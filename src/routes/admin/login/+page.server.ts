import { db } from '$lib/server/db';
import { owner, sessions } from '$lib/server/db/schema';
import { sql, eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '$lib/server/hashing';
import { generateOTP, unixtimestamp } from '$lib/server/utils';
import { sendMail } from '$lib/server/mailer';
import Otp from '$lib/components/mail/Otp.svelte';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const ownerCountResult = await db.select({ count: sql<number>`count(*)` }).from(owner);
	const hasOwner = (ownerCountResult[0]?.count ?? 0) > 0;
	return { hasOwner };
};

export const actions: Actions = {
	register: async ({ request, cookies }) => {
		const ownerCountResult = await db.select({ count: sql<number>`count(*)` }).from(owner);
		const hasOwner = (ownerCountResult[0]?.count ?? 0) > 0;
		if (hasOwner) {
			return fail(400, { error: 'Registration is closed. Owner already exists.' });
		}

		const data = await request.formData();
		const username = data.get('username')?.toString().trim();
		const email = data.get('email')?.toString().trim();
		const password = data.get('password')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!username || !email || !password || !confirmPassword) {
			return fail(400, { error: 'All fields are required' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match' });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters' });
		}

		try {
			const hashedPassword = await hashPassword(password);
			const now = unixtimestamp();
			const userId = crypto.randomUUID();

			// Create owner
			await db.insert(owner).values({
				id: userId,
				username,
				email,
				password: hashedPassword,
				createdAt: now,
				updatedAt: now
			});

			// Create session directly to log in
			const sessionId = crypto.randomUUID();
			const expiredAt = now + (Number(env.LOGIN_EXPIRED) || 3600);

			await db.insert(sessions).values({
				id: sessionId,
				userId,
				payloads: { type: 'authenticated' },
				createdAt: now,
				expiredAt
			});

			cookies.set('session_id', sessionId, {
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
			return fail(500, { error: 'Failed to create owner account' });
		}
	},

	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const usernameOrEmail = data.get('usernameOrEmail')?.toString().trim();
		const password = data.get('password')?.toString();

		if (!usernameOrEmail || !password) {
			return fail(400, { error: 'Username/Email and Password are required' });
		}

		try {
			// Find owner by username or email
			const userResult = await db
				.select()
				.from(owner)
				.where(sql`${owner.username} = ${usernameOrEmail} OR ${owner.email} = ${usernameOrEmail}`)
				.limit(1);

			if (userResult.length === 0) {
				return fail(400, { error: 'Invalid username or password' });
			}

			const user = userResult[0];
			const isPasswordValid = await verifyPassword(password, user.password);
			if (!isPasswordValid) {
				return fail(400, { error: 'Invalid username or password' });
			}

			// Password valid! Send OTP
			const otp = generateOTP();
			const now = unixtimestamp();
			const sessionId = crypto.randomUUID();
			const expiredAt = now + (Number(env.VERIFY_EXPIRED) || 300);

			// Save session with OTP payload
			await db.insert(sessions).values({
				id: sessionId,
				userId: user.id,
				payloads: {
					type: 'pending_otp',
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
					subject: 'Verification Code - Portfolio Admin',
					component: Otp,
					props: { otp }
				});
				console.log(`[OTP Sent via SMTP] to: ${user.email}`);
			} catch (mailError) {
				console.warn('SMTP error occurred, logging OTP to console instead:', mailError);
				console.log('\n====================================');
				console.log(`OTP VERIFICATION CODE FOR ${user.email}: ${otp}`);
				console.log('====================================\n');
			}

			throw redirect(303, '/admin/login/verify');
		} catch (err: any) {
			if (err.status === 303) throw err;
			console.error(err);
			return fail(500, { error: err.message || 'An error occurred during login' });
		}
	}
};
