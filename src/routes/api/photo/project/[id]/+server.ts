import { db } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getMimeTypeFile } from '$lib/server/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	try {
		const projectResult = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
		if (projectResult.length === 0 || !projectResult[0].photo) {
			throw error(404, 'Photo not found');
		}

		const photoBuffer = Buffer.from(projectResult[0].photo as any);
		const mimeType = getMimeTypeFile(photoBuffer);

		return new Response(photoBuffer, {
			headers: {
				'Content-Type': mimeType,
				'Cache-Control': 'public, max-age=31536000',
				'Content-Length': photoBuffer.length.toString()
			}
		});
	} catch (err: any) {
		if (err.status === 404) throw err;
		console.error('Error fetching project photo:', err);
		throw error(500, 'Internal Server Error');
	}
};
