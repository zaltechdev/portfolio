import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		const sessionId = cookies.get('session_id');
		if (sessionId) {
			try {
				await db.delete(sessions).where(eq(sessions.id, sessionId));
			} catch (err) {
				console.error('Failed to delete session on logout:', err);
			}
			cookies.delete('session_id', { path: '/' });
		}
		
		locals.user = null;
		locals.session = null;
		
		throw redirect(303, '/admin/login');
	}
};
