<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';

	let { form } = $props();

	let loading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// Watch action results to set toast messages
	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		}
	});

	function handleSubmit() {
		loading = true;
		return async ({ update }: any) => {
			loading = false;
			await update();
		};
	}
</script>

<svelte:head>
	<title>Lupa Kata Sandi - Admin</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<div class="min-h-screen bg-[#09090b] text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
	<div class="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-neutral-700/60">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold tracking-tight text-neutral-100">Lupa Kata Sandi?</h1>
			<p class="text-neutral-400 text-sm mt-2">
				Masukkan alamat email Anda untuk menerima kode verifikasi OTP.
			</p>
		</div>

		<form method="POST" action="?/requestReset" use:enhance={handleSubmit} class="flex flex-col gap-5">
			<Input
				label="Alamat Email"
				name="email"
				type="email"
				placeholder="john@example.com"
				iconLeft="ri-mail-line"
				required
				disabled={loading}
			/>

			<div class="mt-2 flex flex-col gap-3">
				<Button type="submit" width="full" disabled={loading}>
					{#if loading}
						<i class="ri-loader-4-line animate-spin"></i> Memproses...
					{:else}
						<i class="ri-mail-send-line"></i> Kirim Kode OTP
					{/if}
				</Button>
				
				<div class="text-center mt-2">
					<a
						href="/admin/login"
						class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-300 outline-none flex items-center justify-center gap-1 mx-auto"
					>
						<i class="ri-arrow-left-line"></i> Kembali ke Halaman Masuk
					</a>
				</div>
			</div>
		</form>
	</div>
</div>
