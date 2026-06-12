import { db } from '$lib/server/db';
import { sessions, owner } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { unixtimestamp } from '$lib/server/utils';
import { redirect, type Handle } from '@sveltejs/kit';

let dbInitialized = false;
async function initDb() {
	if (dbInitialized) return;
	try {
		await db.run(sql`
			CREATE TABLE IF NOT EXISTS contact_messages (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				email TEXT NOT NULL,
				message TEXT NOT NULL,
				created_at INTEGER NOT NULL
			)
		`);
		// Drop unique index to allow multiple projects per profile
		await db.run(sql`DROP INDEX IF EXISTS projects_profile_id_unique`);
		dbInitialized = true;
	} catch (err) {
		console.error("Failed to initialize database tables/indices:", err);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	await initDb();

	const sessionId = event.cookies.get('session_id');
	event.locals.user = null;
	event.locals.session = null;

	if (sessionId) {
		const sessionResult = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
		if (sessionResult.length > 0) {
			const sessionData = sessionResult[0];
			const now = unixtimestamp();
			if (sessionData.expiredAt && sessionData.expiredAt > now) {
				event.locals.session = {
					id: sessionData.id,
					userId: sessionData.userId,
					payloads: sessionData.payloads || null,
					createdAt: sessionData.createdAt,
					expiredAt: sessionData.expiredAt
				};

				if (sessionData.userId) {
					const userResult = await db.select().from(owner).where(eq(owner.id, sessionData.userId)).limit(1);
					if (userResult.length > 0) {
						event.locals.user = {
							id: userResult[0].id,
							username: userResult[0].username,
							email: userResult[0].email
						};
					}
				}
			} else {
				// Clean up expired session
				await db.delete(sessions).where(eq(sessions.id, sessionId));
				event.cookies.delete('session_id', { path: '/' });
			}
		}
	}

	const path = event.url.pathname;
	const isPendingOtp = event.locals.session?.payloads?.type === 'pending_otp';

	// Check if there is an owner in the database
	const ownerCountResult = await db.select({ count: sql<number>`count(*)` }).from(owner);
	const hasOwner = (ownerCountResult[0]?.count ?? 0) > 0;

	if (path.startsWith('/admin')) {
		const isPublicAdminPath = 
			path === '/admin/login' || 
			path === '/admin/login/verify' || 
			path === '/admin/login/forgot' || 
			path.startsWith('/admin/login/forgot/');

		const isFullyAuthenticated = !!(event.locals.user && event.locals.session?.payloads?.type === 'authenticated');

		if (isPublicAdminPath) {
			// If already fully logged in, redirect to dashboard
			if (isFullyAuthenticated) {
				throw redirect(303, '/admin/dashboard');
			}
		} else {
			// If not logged in, redirect to login page
			if (!isFullyAuthenticated) {
				if (!hasOwner) {
					// If no owner exists, allow hitting /admin/login to register
					if (path !== '/admin/login') {
						throw redirect(303, '/admin/login');
					}
				} else {
					if (isPendingOtp && path !== '/admin/login/verify') {
						throw redirect(303, '/admin/login/verify');
					} else {
						throw redirect(303, '/admin/login');
					}
				}
			}
		}
	}

	return await resolve(event);
};
