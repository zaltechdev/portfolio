import { db } from '$lib/server/db';
import { profiles, projects } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { unixtimestamp } from '$lib/server/utils';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const userId = locals.user!.id;

	// Find owner profile
	const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
	const profile = profileResult[0] || null;

	if (!profile) {
		return {
			profileExists: false,
			projects: [],
			pagination: {
				page: 1,
				limit: 5,
				totalCount: 0,
				totalPages: 1
			}
		};
	}

	// Pagination parameters
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 5;
	const offset = (page - 1) * limit;

	try {
		// Get total projects count
		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(projects)
			.where(eq(projects.profileId, profile.id));
		const totalCount = countResult[0]?.count ?? 0;
		const totalPages = Math.ceil(totalCount / limit) || 1;

		// Fetch projects page
		const projectsResult = await db
			.select()
			.from(projects)
			.where(eq(projects.profileId, profile.id))
			.orderBy(desc(projects.createdAt))
			.limit(limit)
			.offset(offset);

		const formattedProjects = projectsResult.map((p) => ({
			id: p.id,
			title: p.title,
			description: p.description,
			techstack: p.techstack,
			hasPhoto: !!p.photo,
			photoUrl: p.photo ? `/api/photo/project/${p.id}?t=${p.updatedAt || p.createdAt}` : null,
			createdAt: p.createdAt,
			updatedAt: p.updatedAt
		}));

		return {
			profileExists: true,
			projects: formattedProjects,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages
			}
		};
	} catch (err) {
		console.error('Failed to load projects list:', err);
		return {
			profileExists: true,
			projects: [],
			pagination: {
				page: 1,
				limit: 5,
				totalCount: 0,
				totalPages: 1
			}
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const userId = locals.user!.id;

		const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
		const profile = profileResult[0] || null;

		if (!profile) {
			return fail(400, { error: 'Harap buat profil Anda terlebih dahulu di menu Edit Profil.' });
		}

		const data = await request.formData();
		const title = data.get('title')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const techstack = data.get('techstack')?.toString().trim();
		const photoFile = data.get('photo') as File | null;

		if (!title || !description || !techstack) {
			return fail(400, { error: 'Judul, Deskripsi, dan Tech Stack wajib diisi.' });
		}

		const now = unixtimestamp();
		const newProject: any = {
			id: crypto.randomUUID(),
			profileId: profile.id,
			title,
			description,
			techstack,
			createdAt: now,
			updatedAt: now
		};

		if (photoFile && photoFile.size > 0) {
			const sizeLimit = Number(env.FILE_IMG_SIZE_MAXLIMIT) || 2024000;
			if (photoFile.size > sizeLimit) {
				return fail(400, { error: 'Ukuran foto projek terlalu besar. Maksimal 2MB.' });
			}

			try {
				const arrayBuffer = await photoFile.arrayBuffer();
				newProject.photo = Buffer.from(arrayBuffer);
			} catch (err) {
				console.error('Failed to process uploaded project photo:', err);
				return fail(400, { error: 'Gagal memproses file foto yang diunggah.' });
			}
		}

		try {
			await db.insert(projects).values(newProject);
			return { success: true, message: 'Projek berhasil ditambahkan.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Gagal menambahkan projek. Pastikan judul projek unik.' });
		}
	},

	update: async ({ request, locals }) => {
		const userId = locals.user!.id;

		const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
		const profile = profileResult[0] || null;

		if (!profile) {
			return fail(400, { error: 'Harap buat profil Anda terlebih dahulu.' });
		}

		const data = await request.formData();
		const id = data.get('id')?.toString();
		const title = data.get('title')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const techstack = data.get('techstack')?.toString().trim();
		const photoFile = data.get('photo') as File | null;

		if (!id || !title || !description || !techstack) {
			return fail(400, { error: 'ID, Judul, Deskripsi, dan Tech Stack wajib diisi.' });
		}

		const now = unixtimestamp();
		const updateData: any = {
			title,
			description,
			techstack,
			updatedAt: now
		};

		if (photoFile && photoFile.size > 0) {
			const sizeLimit = Number(env.FILE_IMG_SIZE_MAXLIMIT) || 2024000;
			if (photoFile.size > sizeLimit) {
				return fail(400, { error: 'Ukuran foto projek terlalu besar. Maksimal 2MB.' });
			}

			try {
				const arrayBuffer = await photoFile.arrayBuffer();
				updateData.photo = Buffer.from(arrayBuffer);
			} catch (err) {
				console.error('Failed to process uploaded photo:', err);
				return fail(400, { error: 'Gagal memproses file foto.' });
			}
		}

		try {
			await db.update(projects).set(updateData).where(eq(projects.id, id));
			return { success: true, message: 'Projek berhasil diperbarui.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Gagal memperbarui projek. Pastikan judul projek unik.' });
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID projek tidak valid.' });
		}

		try {
			await db.delete(projects).where(eq(projects.id, id));
			return { success: true, message: 'Projek berhasil dihapus.' };
		} catch (err) {
			console.error('Failed to delete project:', err);
			return fail(500, { error: 'Gagal menghapus projek.' });
		}
	}
};
