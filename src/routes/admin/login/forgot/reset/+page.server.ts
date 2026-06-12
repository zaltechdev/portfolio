import { db } from '$lib/server/db';
import { sessions, owner } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '$lib/server/hashing';
import { unixtimestamp } from '$lib/server/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If no session or session is not pending password reset, redirect to forgot page
	if (!locals.session || locals.session.payloads?.type !== 'pending_password_reset') {
		throw redirect(303, '/admin/login/forgot');
	}
	return {};
};

export const actions: Actions = {
	resetPassword: async ({ request, cookies, locals }) => {
		if (!locals.session || locals.session.payloads?.type !== 'pending_password_reset') {
			throw redirect(303, '/admin/login/forgot');
		}

		const sessionData = locals.session;
		const tempUserId = sessionData.payloads?.data?.tempUserId;

		const data = await request.formData();
		const password = data.get('password')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!password || !confirmPassword) {
			return fail(400, { error: 'Semua field wajib diisi' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Kata sandi baru dan konfirmasi kata sandi tidak cocok' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Kata sandi baru minimal harus 6 karakter' });
		}

		try {
			const hashedPassword = await hashPassword(password);
			const now = unixtimestamp();

			// Update user's password in database
			await db
				.update(owner)
				.set({
					password: hashedPassword,
					updatedAt: now
				})
				.where(eq(owner.id, tempUserId));

			// Delete the temporary session
			await db.delete(sessions).where(eq(sessions.id, sessionData.id));

			// Remove the session cookie
			cookies.delete('session_id', { path: '/' });

			throw redirect(303, '/admin/login?resetSuccess=true');
		} catch (err: any) {
			if (err.status === 303) throw err;
			console.error(err);
			return fail(500, { error: 'Gagal mengatur ulang kata sandi. Silakan coba lagi.' });
		}
	}
};
