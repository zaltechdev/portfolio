<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Textarea from '$lib/components/reusable/Textarea.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';
	import Image from '$lib/components/reusable/Image.svelte';
	import Modal from '$lib/components/reusable/Modal.svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// Modals State
	let addModalOpen = $state(false);
	let editModalOpen = $state(false);
	let deleteModalOpen = $state(false);

	// Selected Project State for Edit/Delete
	let selectedProject = $state<any>(null);

	// Image Upload Preview States
	let createFileInput = $state<HTMLInputElement>();
	let editFileInput = $state<HTMLInputElement>();
	let createPhotoPreview = $state<string | null>(null);
	let editPhotoPreview = $state<string | null>(null);

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (form?.success && form?.message) {
			toastMessage = form.message;
			toastType = 'success';
			// Close all modals on success
			addModalOpen = false;
			editModalOpen = false;
			deleteModalOpen = false;
			// Reset preview states
			createPhotoPreview = null;
			editPhotoPreview = null;
		}
	});

	function handleCreateFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				createPhotoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleEditFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				editPhotoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function openAddModal() {
		createPhotoPreview = null;
		addModalOpen = true;
	}

	function openEditModal(project: any) {
		selectedProject = { ...project };
		editPhotoPreview = project.photoUrl;
		editModalOpen = true;
	}

	function openDeleteModal(project: any) {
		selectedProject = project;
		deleteModalOpen = true;
	}

	function handleCreate() {
		loading = true;
		return async ({ update }: any) => {
			loading = false;
			await update();
		};
	}

	function handleUpdate() {
		loading = true;
		return async ({ update }: any) => {
			loading = false;
			await update();
		};
	}

	function handleDelete() {
		loading = true;
		return async ({ update }: any) => {
			loading = false;
			await update();
		};
	}

	function getPageUrl(pageNum: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', pageNum.toString());
		return url.pathname + url.search;
	}
</script>

<svelte:head>
	<title>Daftar Projek - Portofolio Admin</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<Modal bind:open={addModalOpen} title="Tambah Projek Baru" class="max-w-xl">
	<form method="POST" action="?/create" enctype="multipart/form-data" use:enhance={handleCreate} class="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-2">
		<!-- Photo Upload -->
		<div class="flex flex-col gap-2">
			<span class="text-sm text-neutral-300">Mockup / Banner Projek</span>
			<div class="w-full aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center relative shadow-lg">
				{#if createPhotoPreview}
					<Image src={createPhotoPreview} alt="Preview Projek Baru" ratio="landscape" />
				{:else}
					<div class="flex flex-col items-center justify-center text-neutral-600 gap-2">
						<i class="ri-image-add-line text-3xl"></i>
						<span class="text-xs">Unggah Gambar Projek</span>
					</div>
				{/if}
			</div>

			<input
				type="file"
				name="photo"
				accept="image/png, image/jpeg, image/webp"
				class="hidden"
				bind:this={createFileInput}
				onchange={handleCreateFileChange}
			/>

			<Button
				type="button"
				variant="secondary"
				width="full"
				onclick={() => createFileInput?.click()}
				disabled={loading}
			>
				<i class="ri-upload-2-line"></i> Pilih File Gambar
			</Button>
		</div>

		<Input
			label="Judul Projek"
			name="title"
			placeholder="Contoh: E-Commerce Platform"
			iconLeft="ri-folder-line"
			required
			disabled={loading}
		/>

		<Input
			label="Tech Stack (Pisahkan dengan koma)"
			name="techstack"
			placeholder="Contoh: SvelteKit, Drizzle ORM, Tailwind CSS"
			iconLeft="ri-braces-line"
			required
			disabled={loading}
		/>

		<Textarea
			label="Deskripsi Projek"
			name="description"
			placeholder="Tuliskan detail, fitur, dan pencapaian projek..."
			iconLeft="ri-file-text-line"
			required
			rows={4}
			disabled={loading}
		/>

		<div class="border-t border-neutral-800 pt-5 flex justify-end gap-3">
			<Button type="button" variant="secondary" onclick={() => addModalOpen = false}>
				Batal
			</Button>
			<Button type="submit" disabled={loading}>
				{#if loading}
					<i class="ri-loader-4-line animate-spin"></i> Menyimpan...
				{:else}
					<i class="ri-check-line"></i> Simpan Projek
				{/if}
			</Button>
		</div>
	</form>
</Modal>

<Modal bind:open={editModalOpen} title="Edit Projek" class="max-w-xl">
	{#if selectedProject}
		<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance={handleUpdate} class="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-2">
			<input type="hidden" name="id" value={selectedProject.id} />

			<!-- Photo Upload -->
			<div class="flex flex-col gap-2">
				<span class="text-sm text-neutral-300">Mockup / Banner Projek</span>
				<div class="w-full aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center relative shadow-lg">
					{#if editPhotoPreview}
						<Image src={editPhotoPreview} alt="Preview Projek" ratio="landscape" />
					{:else}
						<div class="flex flex-col items-center justify-center text-neutral-600 gap-2">
							<i class="ri-image-add-line text-3xl"></i>
							<span class="text-xs">Belum ada gambar</span>
						</div>
					{/if}
				</div>

				<input
					type="file"
					name="photo"
					accept="image/png, image/jpeg, image/webp"
					class="hidden"
					bind:this={editFileInput}
					onchange={handleEditFileChange}
				/>

				<Button
					type="button"
					variant="secondary"
					width="full"
					onclick={() => editFileInput?.click()}
					disabled={loading}
				>
					<i class="ri-upload-2-line"></i> Ganti Gambar
				</Button>
			</div>

			<Input
				label="Judul Projek"
				name="title"
				value={selectedProject.title}
				placeholder="Judul projek..."
				iconLeft="ri-folder-line"
				required
				disabled={loading}
			/>

			<Input
				label="Tech Stack (Pisahkan dengan koma)"
				name="techstack"
				value={selectedProject.techstack}
				placeholder="Tech stack..."
				iconLeft="ri-braces-line"
				required
				disabled={loading}
			/>

			<Textarea
				label="Deskripsi Projek"
				name="description"
				value={selectedProject.description}
				placeholder="Deskripsi..."
				iconLeft="ri-file-text-line"
				required
				rows={4}
				disabled={loading}
			/>

			<div class="border-t border-neutral-800 pt-5 flex justify-end gap-3">
				<Button type="button" variant="secondary" onclick={() => editModalOpen = false}>
					Batal
				</Button>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<i class="ri-loader-4-line animate-spin"></i> Menyimpan...
					{:else}
						<i class="ri-save-line"></i> Simpan Perubahan
					{/if}
				</Button>
			</div>
		</form>
	{/if}
</Modal>

<!-- MODAL: DELETE CONFIRMATION -->
<Modal bind:open={deleteModalOpen} title="Hapus Projek">
	{#if selectedProject}
		<div class="flex flex-col gap-4">
			<p class="text-sm text-neutral-300">
				Apakah Anda yakin ingin menghapus projek <span class="font-bold text-neutral-100">{selectedProject.title}</span>? Tindakan ini tidak dapat dibatalkan.
			</p>
			
			<form method="POST" action="?/delete" use:enhance={handleDelete} class="flex justify-end gap-3 pt-2">
				<input type="hidden" name="id" value={selectedProject.id} />
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
				<i class="ri-folders-line text-indigo-400"></i> Kelola Daftar Projek
			</h1>
			<p class="text-neutral-400 text-sm mt-1">
				Tambahkan, ubah, atau hapus karya projek portofolio Anda di sini.
			</p>
		</div>

		{#if data.profileExists}
			<Button type="button" onclick={openAddModal}>
				<i class="ri-add-line"></i> Tambah Projek
			</Button>
		{/if}
	</div>

	{#if !data.profileExists}
		<!-- Warning State -->
		<div class="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-8 flex flex-col items-center text-center gap-4 max-w-xl mx-auto mt-8">
			<div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
				<i class="ri-alert-line text-xl"></i>
			</div>
			<div class="flex flex-col gap-1">
				<h3 class="text-lg font-bold text-neutral-100">Profil Owner Belum Dibuat</h3>
				<p class="text-neutral-400 text-sm">
					Anda harus melengkapi profil owner terlebih dahulu sebelum bisa mengelola projek.
				</p>
			</div>
			<Button onclick={() => window.location.href = '/admin/profile'}>
				<i class="ri-profile-line"></i> Buat Profil Owner
			</Button>
		</div>
	{:else if data.projects.length === 0}
		<!-- Empty Projects -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 max-w-xl mx-auto mt-8">
			<div class="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500">
				<i class="ri-folder-open-line text-2xl"></i>
			</div>
			<div class="flex flex-col gap-1">
				<h3 class="text-lg font-bold text-neutral-200">Belum Ada Projek</h3>
				<p class="text-neutral-500 text-sm">
					Daftar projek Anda kosong. Klik tombol **Tambah Projek** di atas untuk menambahkan projek pertama Anda!
				</p>
			</div>
		</div>
	{:else}
		<!-- Projects Grid list -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			{#each data.projects as project}
				<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-neutral-700 transition-all duration-300">
					<!-- Project Banner -->
					<div class="w-full aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center relative">
						{#if project.photoUrl}
							<Image src={project.photoUrl} alt={project.title} ratio="landscape" />
						{:else}
							<div class="flex flex-col items-center justify-center text-neutral-600 gap-1">
								<i class="ri-image-line text-2xl"></i>
								<span class="text-[10px]">Tanpa Gambar</span>
							</div>
						{/if}
					</div>

					<div class="flex flex-col gap-2 flex-1">
						<h3 class="text-base font-bold text-neutral-100 truncate">{project.title}</h3>
						
						<!-- Tech Stack Badges -->
						<div class="flex flex-wrap gap-1.5">
							{#each project.techstack.split(',').map(t => t.trim()).filter(Boolean) as tag}
								<span class="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-[10px] uppercase">
									{tag}
								</span>
							{/each}
						</div>

						<p class="text-neutral-400 text-xs mt-1 leading-relaxed line-clamp-3 whitespace-pre-line">
							{project.description}
						</p>
					</div>

					<div class="border-t border-neutral-800 pt-4 flex justify-end gap-2 mt-auto">
						<Button
							type="button"
							variant="secondary"
							class="h-9 px-3 text-xs"
							onclick={() => openEditModal(project)}
							disabled={loading}
						>
							<i class="ri-edit-line"></i> Edit
						</Button>
						<Button
							type="button"
							class="h-9 px-3 text-xs bg-red-600/10 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
							onclick={() => openDeleteModal(project)}
							disabled={loading}
						>
							<i class="ri-delete-bin-line"></i> Hapus
						</Button>
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
