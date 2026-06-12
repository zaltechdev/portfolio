import { db } from '$lib/server/db';
import { profiles, projects, owner } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { unixtimestamp } from '$lib/server/utils';
import { sendMail } from '$lib/server/mailer';
import Notification from '$lib/components/mail/Notification.svelte';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Get first profile from database
	const profileResult = await db.select().from(profiles).limit(1);
	const profile = profileResult[0] || null;

	let projectsList: any[] = [];
	let totalCount = 0;
	let totalPages = 1;
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 5;
	const offset = (page - 1) * limit;

	if (profile) {
		try {
			// Get total count
			const countRes = await db
				.select({ count: sql<number>`count(*)` })
				.from(projects)
				.where(eq(projects.profileId, profile.id));
			totalCount = countRes[0]?.count ?? 0;
			totalPages = Math.ceil(totalCount / limit) || 1;

			// Fetch projects for page
			const projectsResult = await db
				.select()
				.from(projects)
				.where(eq(projects.profileId, profile.id))
				.orderBy(desc(projects.createdAt))
				.limit(limit)
				.offset(offset);

			projectsList = projectsResult.map((p) => ({
				id: p.id,
				title: p.title,
				description: p.description,
				techstack: p.techstack,
				photoUrl: p.photo ? `/api/photo/project/${p.id}?t=${p.updatedAt || p.createdAt}` : null
			}));
		} catch (err) {
			console.error('Failed to load projects on homepage:', err);
		}
	}

	return {
		profile: profile
			? {
					id: profile.id,
					fullname: profile.fullname,
					description: profile.description,
					github: profile.github,
					email: profile.email,
					linkedin: profile.linkedin,
					photoUrl: profile.photo ? `/api/photo/profile/${profile.id}?t=${profile.updatedAt || profile.createdAt}` : null
				}
			: null,
		projects: projectsList,
		pagination: {
			page,
			limit,
			totalCount,
			totalPages
		}
	};
};

export const actions: Actions = {
	sendMessage: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name')?.toString().trim();
		const email = data.get('email')?.toString().trim();
		const message = data.get('message')?.toString().trim();

		if (!name || !email || !message) {
			return fail(400, { error: 'Nama, Email, dan Pesan wajib diisi.' });
		}

		try {
			// Save message to database
			const id = crypto.randomUUID();
			const now = unixtimestamp();
			await db.run(sql`
				INSERT INTO contact_messages (id, name, email, message, created_at)
				VALUES (${id}, ${name}, ${email}, ${message}, ${now})
			`);

			// Try to send notification email to the owner
			try {
				const ownerResult = await db.select().from(owner).limit(1);
				const adminUser = ownerResult[0];

				if (adminUser && adminUser.email) {
					await sendMail({
						to: adminUser.email,
						subject: `Pesan Baru dari ${name} - Portofolio`,
						component: Notification,
						props: {
							title: `Anda menerima pesan baru dari ${name}`,
							description: `
								<p><strong>Nama Pengirim:</strong> ${name}</p>
								<p><strong>Email Pengirim:</strong> ${email}</p>
								<p><strong>Pesan:</strong></p>
								<div style="background-color: #171717; padding: 15px; border-radius: 8px; border: 1px solid #262626; color: #d4d4d4; white-space: pre-wrap;">
									${message}
								</div>
							`
						}
					});
					console.log(`[Email Notification Sent] to: ${adminUser.email}`);
				}
			} catch (mailError: any) {
				console.warn('Could not send notification email:', mailError.message || mailError);
			}

			return { success: true, message: 'Pesan Anda berhasil dikirim! Terima kasih.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Gagal mengirim pesan. Silakan coba lagi nanti.' });
		}
	}
};
