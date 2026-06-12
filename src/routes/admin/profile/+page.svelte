<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Textarea from '$lib/components/reusable/Textarea.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';
	import Image from '$lib/components/reusable/Image.svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// File input reference and local image preview
	let fileInput = $state<HTMLInputElement>();
	let photoPreview = $state<string | null>(null);

	$effect(() => {
		if (photoPreview === null && data.profile?.photoUrl) {
			photoPreview = data.profile.photoUrl;
		}
	});

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (form?.success && form?.message) {
			toastMessage = form.message;
			toastType = 'success';
			// Force refresh photo preview with new timestamp to bypass cache if updated
			if (data.profile?.photoUrl) {
				photoPreview = `${data.profile.photoUrl.split('?')[0]}?t=${Date.now()}`;
			}
		}
	});

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				photoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleSubmit() {
		loading = true;
		return async ({ update }: any) => {
			loading = false;
			await update();
		};
	}
</script>

<svelte:head>
	<title>Edit Profil - Portofolio Admin</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="border-b border-neutral-800 pb-4">
		<h1 class="text-2xl font-extrabold text-neutral-100 flex items-center gap-2">
			<i class="ri-profile-line text-indigo-400"></i> Kelola Profil Owner
		</h1>
		<p class="text-neutral-400 text-sm mt-1">
			Informasi profil di bawah ini akan ditampilkan pada halaman utama portofolio Anda.
		</p>
	</div>

	<!-- Profile Edit Form -->
	<form method="POST" enctype="multipart/form-data" use:enhance={handleSubmit} class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<!-- Photo Upload Card -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center gap-4 h-fit">
			<span class="text-neutral-400 text-xs font-semibold uppercase tracking-wider self-start">Foto Profil</span>
			
			<div class="w-40 h-40 rounded-full overflow-hidden border-2 border-neutral-800 shadow-xl bg-neutral-950 relative flex items-center justify-center">
				{#if photoPreview}
					<Image src={photoPreview} alt="Foto Profil Preview" ratio="square-circled" />
				{:else}
					<div class="flex flex-col items-center justify-center text-neutral-600 gap-1">
						<i class="ri-user-smile-line text-4xl"></i>
						<span class="text-xs">Belum ada foto</span>
					</div>
				{/if}
			</div>

			<input
				type="file"
				name="photo"
				accept="image/png, image/jpeg, image/webp"
				class="hidden"
				bind:this={fileInput}
				onchange={handleFileChange}
			/>

			<Button
				type="button"
				variant="secondary"
				width="full"
				onclick={() => fileInput?.click()}
				disabled={loading}
			>
				<i class="ri-upload-2-line"></i> Pilih Foto
			</Button>

			<span class="text-neutral-500 text-[10px] text-center">
				Mendukung PNG, JPG, WEBP. Maksimal 2MB.
			</span>
		</div>

		<!-- Details Fields Card -->
		<div class="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
			<span class="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Detail Informasi</span>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
				<Input
					label="Nama Lengkap"
					name="fullname"
					value={data.profile?.fullname || ''}
					placeholder="Masukkan nama lengkap Anda..."
					iconLeft="ri-user-line"
					required
					disabled={loading}
				/>

				<Input
					label="Email Kontak"
					name="email"
					type="email"
					value={data.profile?.email || ''}
					placeholder="alamat-email@domain.com"
					iconLeft="ri-mail-line"
					disabled={loading}
				/>

				<Input
					label="Username / Link GitHub"
					name="github"
					value={data.profile?.github || ''}
					placeholder="https://github.com/username"
					iconLeft="ri-github-line"
					required
					disabled={loading}
				/>

				<Input
					label="Link LinkedIn"
					name="linkedin"
					value={data.profile?.linkedin || ''}
					placeholder="https://linkedin.com/in/username"
					iconLeft="ri-linkedin-box-line"
					disabled={loading}
				/>
			</div>

			<Textarea
				label="Deskripsi / Tentang Saya"
				name="description"
				value={data.profile?.description || ''}
				placeholder="Tuliskan cerita singkat tentang keahlian, pengalaman, dan diri Anda..."
				iconLeft="ri-chat-quote-line"
				required
				rows={5}
				disabled={loading}
			/>

			<div class="border-t border-neutral-800 pt-6 flex justify-end">
				<Button type="submit" disabled={loading}>
					{#if loading}
						<i class="ri-loader-4-line animate-spin"></i> Menyimpan...
					{:else}
						<i class="ri-save-line"></i> Simpan Profil
					{/if}
				</Button>
			</div>
		</div>
	</form>
</div>
