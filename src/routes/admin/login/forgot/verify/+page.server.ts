import { db } from '$lib/server/db';
import { sessions, owner } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { unixtimestamp, generateOTP } from '$lib/server/utils';
import { sendMail } from '$lib/server/mailer';
import Otp from '$lib/components/mail/Otp.svelte';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If no session or session is not pending password reset OTP, redirect to forgot page
	if (!locals.session || locals.session.payloads?.type !== 'pending_password_reset_otp') {
		throw redirect(303, '/admin/login/forgot');
	}
	return {};
};

export const actions: Actions = {
	verify: async ({ request, cookies, locals }) => {
		if (!locals.session || locals.session.payloads?.type !== 'pending_password_reset_otp') {
			throw redirect(303, '/admin/login/forgot');
		}

		const data = await request.formData();
		const otp = data.get('otp')?.toString().trim();

		if (!otp) {
			return fail(400, { error: 'Silakan masukkan kode verifikasi' });
		}

		const sessionData = locals.session;
		const now = unixtimestamp();

		// Check if expired
		if (sessionData.expiredAt && now > sessionData.expiredAt) {
			return fail(400, { error: 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.' });
		}

		const storedOtp = sessionData.payloads?.data?.otp;
		const tempUserId = sessionData.payloads?.data?.tempUserId;

		if (storedOtp?.toString() !== otp) {
			return fail(400, { error: 'Kode verifikasi tidak sesuai' });
		}

		try {
			// Update session to pending_password_reset status
			const newExpiration = now + (Number(env.VERIFY_EXPIRED) || 300);
			await db
				.update(sessions)
				.set({
					payloads: {
						type: 'pending_password_reset',
						data: { tempUserId }
					},
					expiredAt: newExpiration
				})
				.where(eq(sessions.id, sessionData.id));

			// Update cookie lifetime for the reset session
			cookies.set('session_id', sessionData.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: Number(env.VERIFY_EXPIRED) || 300
			});

			throw redirect(303, '/admin/login/forgot/reset');
		} catch (err: any) {
			if (err.status === 303) throw err;
			console.error(err);
			return fail(500, { error: 'Terjadi kesalahan saat memverifikasi kode' });
		}
	},

	resend: async ({ cookies, locals }) => {
		if (!locals.session || locals.session.payloads?.type !== 'pending_password_reset_otp') {
			throw redirect(303, '/admin/login/forgot');
		}

		const sessionData = locals.session;
		const tempUserId = sessionData.payloads?.data?.tempUserId;

		try {
			// Get owner details
			const userResult = await db.select().from(owner).where(eq(owner.id, tempUserId)).limit(1);
			if (userResult.length === 0) {
				return fail(400, { error: 'User tidak ditemukan' });
			}

			const user = userResult[0];
			const newOtp = generateOTP();
			const now = unixtimestamp();
			const newExpiration = now + (Number(env.VERIFY_EXPIRED) || 300);

			// Update session with new OTP
			await db
				.update(sessions)
				.set({
					payloads: {
						type: 'pending_password_reset_otp',
						data: { otp: newOtp, tempUserId }
					},
					expiredAt: newExpiration
				})
				.where(eq(sessions.id, sessionData.id));

			// Reset session cookie
			cookies.set('session_id', sessionData.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: Number(env.VERIFY_EXPIRED) || 300
			});

			// Send new OTP mail
			try {
				await sendMail({
					to: user.email,
					subject: 'New Reset Password Verification Code - Portfolio Admin',
					component: Otp,
					props: { otp: newOtp }
				});
				console.log(`[Reset OTP Resent via SMTP] to: ${user.email}`);
			} catch (mailError) {
				console.warn('SMTP error on resend, logging OTP to console:', mailError);
				console.log('\n====================================');
				console.log(`NEW RESET PASSWORD OTP VERIFICATION CODE FOR ${user.email}: ${newOtp}`);
				console.log('====================================\n');
			}

			return { success: true, message: 'Kode OTP baru telah dikirim.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Gagal mengirim ulang kode verifikasi' });
		}
	}
};
