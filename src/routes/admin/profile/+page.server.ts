import { db } from '$lib/server/db';
import { profiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { unixtimestamp } from '$lib/server/utils';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
	
	const profile = profileResult[0] || null;
	
	return {
		profile: profile
			? {
					id: profile.id,
					fullname: profile.fullname,
					description: profile.description,
					github: profile.github,
					email: profile.email,
					linkedin: profile.linkedin,
					hasPhoto: !!profile.photo,
					photoUrl: profile.photo ? `/api/photo/profile/${profile.id}?t=${profile.updatedAt || profile.createdAt}` : null
				}
			: null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user!.id;
		
		// Get existing profile
		const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
		const profile = profileResult[0] || null;

		const data = await request.formData();
		const fullname = data.get('fullname')?.toString().trim();
		const description = data.get('description')?.toString().trim();
		const github = data.get('github')?.toString().trim();
		const email = data.get('email')?.toString().trim();
		const linkedin = data.get('linkedin')?.toString().trim();
		const photoFile = data.get('photo') as File | null;

		if (!fullname || !description || !github) {
			return fail(400, { error: 'Nama Lengkap, Deskripsi, dan Link GitHub wajib diisi.' });
		}

		const now = unixtimestamp();
		const profileData: any = {
			fullname,
			description,
			github,
			email: email || null,
			linkedin: linkedin || null,
			updatedAt: now
		};

		// Validate and process photo if uploaded
		if (photoFile && photoFile.size > 0) {
			const sizeLimit = Number(env.FILE_IMG_SIZE_MAXLIMIT) || 2024000;
			if (photoFile.size > sizeLimit) {
				return fail(400, { error: 'Ukuran foto terlalu besar. Maksimal 2MB.' });
			}

			try {
				const arrayBuffer = await photoFile.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				profileData.photo = buffer;
			} catch (err) {
				console.error('Failed to read image file:', err);
				return fail(400, { error: 'Gagal memproses file foto yang diunggah.' });
			}
		}

		try {
			if (profile) {
				await db.update(profiles).set(profileData).where(eq(profiles.userId, userId));
			} else {
				const profileId = crypto.randomUUID();
				profileData.id = profileId;
				profileData.userId = userId;
				profileData.createdAt = now;
				await db.insert(profiles).values(profileData);
			}
			return { success: true, message: 'Profil Anda berhasil disimpan.' };
		} catch (err: any) {
			console.error(err);
			return fail(500, { error: 'Gagal menyimpan profil ke database.' });
		}
	}
};
