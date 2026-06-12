import { db } from '$lib/server/db';
import { owner, sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateOTP, unixtimestamp } from '$lib/server/utils';
import { sendMail } from '$lib/server/mailer';
import Otp from '$lib/components/mail/Otp.svelte';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

export const actions: Actions = {
	requestReset: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString().trim();

		if (!email) {
			return fail(400, { error: 'Alamat email wajib diisi' });
		}

		try {
			// Find owner by email
			const userResult = await db
				.select()
				.from(owner)
				.where(eq(owner.email, email))
				.limit(1);

			if (userResult.length === 0) {
				return fail(400, { error: 'Alamat email tidak terdaftar sebagai owner' });
			}

			const user = userResult[0];

			// Password valid! Send OTP
			const otp = generateOTP();
			const now = unixtimestamp();
			const sessionId = crypto.randomUUID();
			const expiredAt = now + (Number(env.VERIFY_EXPIRED) || 300);

			// Save session with pending_password_reset_otp payload
			await db.insert(sessions).values({
				id: sessionId,
				userId: user.id,
				payloads: {
					type: 'pending_password_reset_otp',
					data: { otp, tempUserId: user.id }
				},
				createdAt: now,
				expiredAt
			});

			// Set session cookie
			cookies.set('session_id', sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: Number(env.VERIFY_EXPIRED) || 300
			});

			// Try to send OTP mail
			try {
				await sendMail({
					to: user.email,
					subject: 'Reset Password Verification Code - Portfolio Admin',
					component: Otp,
					props: { otp }
				});
				console.log(`[Reset OTP Sent via SMTP] to: ${user.email}`);
			} catch (mailError) {
				console.warn('SMTP error occurred, logging OTP to console instead:', mailError);
				console.log('\n====================================');
				console.log(`RESET PASSWORD OTP VERIFICATION CODE FOR ${user.email}: ${otp}`);
				console.log('====================================\n');
			}

			throw redirect(303, '/admin/login/forgot/verify');
		} catch (err: any) {
			if (err.status === 303) throw err;
			console.error(err);
			return fail(500, { error: err.message || 'Terjadi kesalahan saat meminta reset kata sandi' });
		}
	}
};
