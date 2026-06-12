import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 5;
	const offset = (page - 1) * limit;

	let messages: any[] = [];
	let totalCount = 0;
	let totalPages = 1;

	try {
		// Get total count
		const countRes = await db.all<{ count: number }>(sql`SELECT COUNT(*) as count FROM contact_messages`);
		totalCount = countRes[0]?.count ?? 0;
		totalPages = Math.ceil(totalCount / limit) || 1;

		// Fetch messages for page
		messages = await db.all<any>(sql`
			SELECT id, name, email, message, created_at as createdAt 
			FROM contact_messages 
			ORDER BY created_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`);
	} catch (err) {
		console.error('Failed to load contact messages with pagination:', err);
	}

	return {
		messages,
		pagination: {
			page,
			limit,
			totalCount,
			totalPages
		}
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'ID pesan tidak valid.' });
		}

		try {
			await db.run(sql`DELETE FROM contact_messages WHERE id = ${id}`);
			return { success: true, message: 'Pesan berhasil dihapus.' };
		} catch (err) {
			console.error('Failed to delete message:', err);
			return fail(500, { error: 'Gagal menghapus pesan.' });
		}
	}
};
