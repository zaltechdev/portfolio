<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';

	let { data, form } = $props();

	let infoLoading = $state(false);
	let pwdLoading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (form?.success && form?.message) {
			toastMessage = form.message;
			toastType = 'success';
		}
	});

	function handleInfoSubmit() {
		infoLoading = true;
		return async ({ update }: any) => {
			infoLoading = false;
			await update();
		};
	}

	function handlePwdSubmit() {
		pwdLoading = true;
		return async ({ update }: any) => {
			pwdLoading = false;
			await update();
		};
	}
</script>

<svelte:head>
	<title>Pengaturan Akun - Portofolio Admin</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="border-b border-neutral-800 pb-4">
		<h1 class="text-2xl font-extrabold text-neutral-100 flex items-center gap-2">
			<i class="ri-user-settings-line text-indigo-400"></i> Pengaturan Akun
		</h1>
		<p class="text-neutral-400 text-sm mt-1">
			Kelola detail kredensial masuk dan tingkatkan keamanan akun admin Anda.
		</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
		<!-- Account Info Section -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6 h-fit">
			<div>
				<h3 class="text-base font-bold text-neutral-200">Informasi Dasar</h3>
				<p class="text-xs text-neutral-500 mt-1">Ubah nama pengguna dan alamat email utama Anda.</p>
			</div>

			<form method="POST" action="?/updateInfo" use:enhance={handleInfoSubmit} class="flex flex-col gap-5">
				<Input
					label="Username"
					name="username"
					value={data.username}
					placeholder="Masukkan username baru..."
					iconLeft="ri-user-line"
					required
					disabled={infoLoading}
				/>

				<Input
					label="Alamat Email Utama"
					name="email"
					type="email"
					value={data.email}
					placeholder="Masukkan alamat email baru..."
					iconLeft="ri-mail-line"
					required
					disabled={infoLoading}
				/>

				<div class="border-t border-neutral-800 pt-5 flex justify-end">
					<Button type="submit" disabled={infoLoading}>
						{#if infoLoading}
							<i class="ri-loader-4-line animate-spin"></i> Menyimpan...
						{:else}
							<i class="ri-save-line"></i> Simpan Perubahan
						{/if}
					</Button>
				</div>
			</form>
		</div>

		<!-- Password Section -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
			<div>
				<h3 class="text-base font-bold text-neutral-200">Ubah Kata Sandi</h3>
				<p class="text-xs text-neutral-500 mt-1">Pastikan Anda menggunakan kata sandi yang kuat dan unik.</p>
			</div>

			<form method="POST" action="?/updatePassword" use:enhance={handlePwdSubmit} class="flex flex-col gap-5">
				<Input
					label="Kata Sandi Saat Ini"
					name="currentPassword"
					type="password"
					placeholder="••••••••"
					iconLeft="ri-lock-line"
					required
					disabled={pwdLoading}
				/>

				<Input
					label="Kata Sandi Baru"
					name="newPassword"
					type="password"
					placeholder="Minimal 6 karakter"
					iconLeft="ri-lock-unlock-line"
					required
					disabled={pwdLoading}
				/>

				<Input
					label="Konfirmasi Kata Sandi Baru"
					name="confirmPassword"
					type="password"
					placeholder="Minimal 6 karakter"
					iconLeft="ri-check-line"
					required
					disabled={pwdLoading}
				/>

				<div class="border-t border-neutral-800 pt-5 flex justify-end">
					<Button type="submit" disabled={pwdLoading}>
						{#if pwdLoading}
							<i class="ri-loader-4-line animate-spin"></i> Memproses...
						{:else}
							<i class="ri-shield-keyhole-line"></i> Perbarui Kata Sandi
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
</div>
