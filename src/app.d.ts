// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				username: string;
				email: string;
			} | null;
			session: {
				id: string;
				userId: string | null;
				payloads: {
					type?: string;
					data?: any;
				} | null;
				createdAt: number | null;
				expiredAt: number | null;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
