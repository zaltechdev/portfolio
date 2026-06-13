<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// Set toast message when action returns form values or password reset is successful
	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (data.resetSuccess) {
			toastMessage = 'Kata sandi berhasil diatur ulang. Silakan masuk.';
			toastType = 'success';
		}
	});

	function handleSubmit() {
		loading = true;
		return async ({ update, result }: any) => {
			await update();
			loading = false;
		};
	}
</script>

<svelte:head>
	<title>{data.hasOwner ? 'Admin Login' : 'Setup Owner Account'}</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<div class="min-h-screen bg-[#09090b] text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
	<div class="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-neutral-700/60">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold tracking-tight text-neutral-100">
				{data.hasOwner ? 'Selamat Datang' : 'Buat Akun Owner'}
			</h1>
			<p class="text-neutral-400 text-sm mt-2">
				{data.hasOwner 
					? 'Silakan masuk ke dashboard portofolio Anda.' 
					: 'Daftarkan akun administrator untuk mengelola portofolio.'}
			</p>
		</div>

		{#if data.hasOwner}
			<!-- Login Form -->
			<form method="POST" action="?/login" use:enhance={handleSubmit} class="flex flex-col gap-5">
				<Input
					label="Username atau Email"
					name="usernameOrEmail"
					type="text"
					placeholder="Masukkan username atau email..."
					iconLeft="ri-user-line"
					required
					disabled={loading}
				/>

				<Input
					label="Kata Sandi"
					name="password"
					type="password"
					placeholder="••••••••"
					iconLeft="ri-lock-line"
					required
					disabled={loading}
				/>

				<div class="flex justify-end -mt-2">
					<a href="/admin/login/forgot" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-300 outline-none">
						Lupa Kata Sandi?
					</a>
				</div>

				<div class="mt-2">
					<Button type="submit" width="full" disabled={loading}>
						{#if loading}
							<i class="ri-loader-4-line animate-spin"></i> Memproses...
						{:else}
							<i class="ri-login-box-line"></i> Masuk
						{/if}
					</Button>
				</div>
			</form>
		{:else}
			<!-- Register/Setup Form -->
			<form method="POST" action="?/register" use:enhance={handleSubmit} class="flex flex-col gap-5">
				<Input
					label="Username"
					name="username"
					type="text"
					placeholder="johndoe"
					iconLeft="ri-user-line"
					required
					disabled={loading}
				/>

				<Input
					label="Alamat Email"
					name="email"
					type="email"
					placeholder="john@example.com"
					iconLeft="ri-mail-line"
					required
					disabled={loading}
				/>

				<Input
					label="Kata Sandi"
					name="password"
					type="password"
					placeholder="Minimal 6 karakter"
					iconLeft="ri-lock-line"
					required
					disabled={loading}
				/>

				<Input
					label="Konfirmasi Kata Sandi"
					name="confirmPassword"
					type="password"
					placeholder="Minimal 6 karakter"
					iconLeft="ri-lock-line"
					required
					disabled={loading}
				/>

				<div class="mt-2">
					<Button type="submit" width="full" disabled={loading}>
						{#if loading}
							<i class="ri-loader-4-line animate-spin"></i> Mendaftar...
						{:else}
							<i class="ri-user-add-line"></i> Buat Akun
						{/if}
					</Button>
				</div>
			</form>
		{/if}
	</div>
</div>
