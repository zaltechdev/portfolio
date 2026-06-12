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
	<title>Atur Ulang Kata Sandi - Admin</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<div class="min-h-screen bg-[#09090b] text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
	<div class="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-neutral-700/60">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold tracking-tight text-neutral-100">Atur Ulang Kata Sandi</h1>
			<p class="text-neutral-400 text-sm mt-2">
				Masukkan kata sandi baru Anda di bawah ini.
			</p>
		</div>

		<form method="POST" action="?/resetPassword" use:enhance={handleSubmit} class="flex flex-col gap-5">
			<Input
				label="Kata Sandi Baru"
				name="password"
				type="password"
				placeholder="Minimal 6 karakter"
				iconLeft="ri-lock-line"
				required
				disabled={loading}
			/>

			<Input
				label="Konfirmasi Kata Sandi Baru"
				name="confirmPassword"
				type="password"
				placeholder="Minimal 6 karakter"
				iconLeft="ri-lock-line"
				required
				disabled={loading}
			/>

			<div class="mt-2 flex flex-col gap-3">
				<Button type="submit" width="full" disabled={loading}>
					{#if loading}
						<i class="ri-loader-4-line animate-spin"></i> Menyimpan...
					{:else}
						<i class="ri-checkbox-circle-line"></i> Simpan Kata Sandi
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>
