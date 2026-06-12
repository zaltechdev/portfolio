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
	// If no session or session is not pending OTP, redirect to login
	if (!locals.session || locals.session.payloads?.type !== 'pending_otp') {
		throw redirect(303, '/admin/login');
	}
	return {};
};

export const actions: Actions = {
	verify: async ({ request, cookies, locals }) => {
		if (!locals.session || locals.session.payloads?.type !== 'pending_otp') {
			throw redirect(303, '/admin/login');
		}

		const data = await request.formData();
		const otp = data.get('otp')?.toString().trim();

		if (!otp) {
			return fail(400, { error: 'Please enter the verification code' });
		}

		const sessionData = locals.session;
		const now = unixtimestamp();

		// Check if expired
		if (sessionData.expiredAt && now > sessionData.expiredAt) {
			return fail(400, { error: 'Verification code has expired. Please request a new one.' });
		}

		const storedOtp = sessionData.payloads?.data?.otp;
		const tempUserId = sessionData.payloads?.data?.tempUserId;

		if (storedOtp?.toString() !== otp) {
			return fail(400, { error: 'Incorrect verification code' });
		}

		try {
			// Update session to authenticated status
			const newExpiration = now + (Number(env.LOGIN_EXPIRED) || 3600);
			await db
				.update(sessions)
				.set({
					payloads: { type: 'authenticated' },
					expiredAt: newExpiration
				})
				.where(eq(sessions.id, sessionData.id));

			// Update cookie lifetime for the authenticated session
			cookies.set('session_id', sessionData.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: process.env.NODE_ENV === 'production',
				maxAge: Number(env.LOGIN_EXPIRED) || 3600
			});

			throw redirect(303, '/admin/dashboard');
		} catch (err: any) {
			if (err.status === 303) throw err;
			console.error(err);
			return fail(500, { error: 'An error occurred during verification' });
		}
	},

	resend: async ({ cookies, locals }) => {
		if (!locals.session || locals.session.payloads?.type !== 'pending_otp') {
			throw redirect(303, '/admin/login');
		}

		const sessionData = locals.session;
		const tempUserId = sessionData.payloads?.data?.tempUserId;

		try {
			// Get owner details
			const userResult = await db.select().from(owner).where(eq(owner.id, tempUserId)).limit(1);
			if (userResult.length === 0) {
				return fail(400, { error: 'User not found' });
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
						type: 'pending_otp',
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
					subject: 'New Verification Code - Portfolio Admin',
					component: Otp,
					props: { otp: newOtp }
				});
				console.log(`[OTP Resent via SMTP] to: ${user.email}`);
			} catch (mailError) {
				console.warn('SMTP error on resend, logging OTP to console:', mailError);
				console.log('\n====================================');
				console.log(`NEW OTP VERIFICATION CODE FOR ${user.email}: ${newOtp}`);
				console.log('====================================\n');
			}

			return { success: true, message: 'Kode OTP yang baru telah dikirim.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Failed to resend verification code' });
		}
	}
};
