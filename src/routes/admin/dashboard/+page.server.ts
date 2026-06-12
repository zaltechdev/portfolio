import { db } from '$lib/server/db';
import { profiles, projects } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	// Fetch profile
	const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
	const profile = profileResult[0] || null;

	// Fetch project count if profile exists
	let projectCount = 0;
	if (profile) {
		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(projects)
			.where(eq(projects.profileId, profile.id));
		projectCount = countResult[0]?.count ?? 0;
	}

	// Fetch messages using raw SQL
	let messageCount = 0;
	let recentMessages: any[] = [];
	try {
		const countRes = await db.all<{ count: number }>(sql`SELECT COUNT(*) as count FROM contact_messages`);
		messageCount = countRes[0]?.count ?? 0;

		recentMessages = await db.all<any>(sql`
			SELECT id, name, email, message, created_at as createdAt 
			FROM contact_messages 
			ORDER BY created_at DESC 
			LIMIT 5
		`);
	} catch (err) {
		console.error('Failed to query messages in dashboard:', err);
	}

	return {
		profile,
		projectCount,
		messageCount,
		recentMessages
	};
};
