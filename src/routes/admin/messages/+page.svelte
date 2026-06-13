<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { unixtimestamp2datetime } from '$lib/utils';
	import Button from '$lib/components/reusable/Button.svelte';
	import Modal from '$lib/components/reusable/Modal.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// Deletion modal state
	let deleteModalOpen = $state(false);
	let selectedMessage = $state<any>(null);

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (form?.success && form?.message) {
			toastMessage = form.message;
			toastType = 'success';
		}
	});

	function getPageUrl(pageNum: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', pageNum.toString());
		return url.pathname + url.search;
	}

	function formatDate(timestamp: number) {
		const date = unixtimestamp2datetime(timestamp);
		return date.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function confirmDelete(msg: any) {
		selectedMessage = msg;
		deleteModalOpen = true;
	}

	function handleDelete() {
		loading = true;
		deleteModalOpen = false;
		return async ({ update }: any) => {
			await update();
			loading = false;
		};
	}
</script>

<svelte:head>
	<title>Pesan Masuk - Portofolio Admin</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<!-- Custom Modal for Delete Confirmation -->
<Modal bind:open={deleteModalOpen} title="Hapus Pesan">
	{#if selectedMessage}
		<div class="flex flex-col gap-4">
			<p class="text-sm text-neutral-300">
				Apakah Anda yakin ingin menghapus pesan dari <span class="font-bold text-neutral-100">{selectedMessage.name}</span> ({selectedMessage.email})? Tindakan ini tidak dapat dibatalkan.
			</p>
			
			<form method="POST" action="?/delete" use:enhance={handleDelete} class="flex justify-end gap-3 pt-2">
				<input type="hidden" name="id" value={selectedMessage.id} />
				<Button type="button" variant="secondary" onclick={() => deleteModalOpen = false}>
					Batal
				</Button>
				<Button type="submit" class="bg-red-600 border-red-500 hover:bg-red-700 active:bg-red-800">
					Hapus
				</Button>
			</form>
		</div>
	{/if}
</Modal>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-neutral-100 flex items-center gap-2">
				<i class="ri-mail-line text-indigo-400"></i> Pesan Masuk Pengunjung
			</h1>
			<p class="text-neutral-400 text-sm mt-1">
				Berikut adalah daftar pesan yang dikirim oleh pengunjung melalui formulir kontak portofolio Anda.
			</p>
		</div>
		<div class="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-400 self-start sm:self-center">
			{data.pagination.totalCount} Pesan
		</div>
	</div>

	{#if data.messages.length === 0}
		<!-- Empty Inbox State -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 max-w-xl mx-auto mt-8">
			<div class="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500">
				<i class="ri-inbox-archive-line text-2xl"></i>
			</div>
			<div class="flex flex-col gap-1">
				<h3 class="text-lg font-bold text-neutral-200">Kotak Masuk Kosong</h3>
				<p class="text-neutral-450 text-sm max-w-sm">
					Belum ada pengunjung yang mengirimkan pesan. Bagikan link portofolio Anda untuk mulai berinteraksi!
				</p>
			</div>
		</div>
	{:else}
		<!-- Message List -->
		<div class="flex flex-col gap-4">
			{#each data.messages as msg}
				<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6 flex flex-col gap-4 hover:border-neutral-700 transition-all duration-300">
					<!-- Sender Header -->
					<div class="flex items-start justify-between gap-4">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold uppercase shrink-0">
								{msg.name.charAt(0)}
							</div>
							<div class="min-w-0">
								<h3 class="text-sm font-bold text-neutral-200 truncate">{msg.name}</h3>
								<a href="mailto:{msg.email}" class="text-xs text-indigo-400 hover:underline truncate block">{msg.email}</a>
							</div>
						</div>
						
						<!-- Action Controls -->
						<div class="flex items-center gap-2">
							<span class="hidden sm:inline text-neutral-500 text-[10px] bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
								{formatDate(msg.createdAt)}
							</span>
							<Button
								type="button"
								variant="secondary"
								class="h-8 w-8 p-0! text-red-400 hover:text-red-500 hover:bg-red-500/5 focus:bg-red-500/5 active:bg-red-500/5"
								onclick={() => confirmDelete(msg)}
								disabled={loading}
								aria-label="Hapus pesan"
							>
								<i class="ri-delete-bin-line"></i>
							</Button>
						</div>
					</div>

					<!-- Date Badge for Mobile -->
					<div class="sm:hidden text-neutral-500 text-[10px] self-start bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">
						{formatDate(msg.createdAt)}
					</div>

					<!-- Body Content -->
					<div class="p-4 rounded-xl bg-neutral-950/60 border border-neutral-850/50 text-neutral-300 text-sm whitespace-pre-line leading-relaxed">
						{msg.message}
					</div>
				</div>
			{/each}
		</div>

		<!-- PAGINATION SYSTEM CONTROLS -->
		{#if data.pagination.totalPages > 1}
			<div class="flex justify-center items-center gap-3 mt-8 border-t border-neutral-800 pt-6">
				<a
					href={getPageUrl(data.pagination.page - 1)}
					class="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-neutral-850 bg-neutral-900/40 text-sm font-medium transition-all duration-300 {data.pagination.page <= 1 ? 'opacity-40 pointer-events-none' : 'hover:border-neutral-700 text-neutral-200'}"
				>
					<i class="ri-arrow-left-s-line"></i> Sebelumnya
				</a>

				<span class="text-xs text-neutral-450 font-semibold bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
					Halaman {data.pagination.page} dari {data.pagination.totalPages}
				</span>

				<a
					href={getPageUrl(data.pagination.page + 1)}
					class="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-neutral-850 bg-neutral-900/40 text-sm font-medium transition-all duration-300 {data.pagination.page >= data.pagination.totalPages ? 'opacity-40 pointer-events-none' : 'hover:border-neutral-700 text-neutral-200'}"
				>
					Selanjutnya <i class="ri-arrow-right-s-line"></i>
				</a>
			</div>
		{/if}
	{/if}
</div>
