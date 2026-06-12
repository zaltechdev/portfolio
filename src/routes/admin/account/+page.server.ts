import { db } from '$lib/server/db';
import { owner } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '$lib/server/hashing';
import { unixtimestamp } from '$lib/server/utils';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const userResult = await db.select().from(owner).where(eq(owner.id, userId)).limit(1);
	const user = userResult[0];

	return {
		username: user.username,
		email: user.email
	};
};

export const actions: Actions = {
	updateInfo: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const data = await request.formData();
		const username = data.get('username')?.toString().trim();
		const email = data.get('email')?.toString().trim();

		if (!username || !email) {
			return fail(400, { error: 'Username dan Email wajib diisi.' });
		}

		try {
			// Check if username or email is already taken by another user
			const now = unixtimestamp();
			await db
				.update(owner)
				.set({
					username,
					email,
					updatedAt: now
				})
				.where(eq(owner.id, userId));

			// Update session locals username/email
			locals.user!.username = username;
			locals.user!.email = email;

			return { success: true, message: 'Informasi akun berhasil disimpan.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Gagal memperbarui informasi akun. Username atau email mungkin sudah digunakan.' });
		}
	},

	updatePassword: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString();
		const newPassword = data.get('newPassword')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'Semua kolom kata sandi wajib diisi.' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'Konfirmasi kata sandi baru tidak cocok.' });
		}

		if (newPassword.length < 6) {
			return fail(400, { error: 'Kata sandi baru minimal 6 karakter.' });
		}

		try {
			// Get current password hash
			const userResult = await db.select().from(owner).where(eq(owner.id, userId)).limit(1);
			const user = userResult[0];

			const isPasswordValid = await verifyPassword(currentPassword, user.password);
			if (!isPasswordValid) {
				return fail(400, { error: 'Kata sandi saat ini tidak valid.' });
			}

			// Hash new password
			const newHashedPassword = await hashPassword(newPassword);
			const now = unixtimestamp();

			await db
				.update(owner)
				.set({
					password: newHashedPassword,
					updatedAt: now
				})
				.where(eq(owner.id, userId));

			return { success: true, message: 'Kata sandi Anda berhasil diperbarui.' };
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Gagal mengubah kata sandi.' });
		}
	}
};
