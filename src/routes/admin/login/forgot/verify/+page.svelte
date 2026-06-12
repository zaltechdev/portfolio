<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';

	let { form } = $props();

	let loading = $state(false);
	let resending = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// Watch action results to set toast messages
	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (form?.success && form?.message) {
			toastMessage = form.message;
			toastType = 'success';
		}
	});

	function handleVerify() {
		loading = true;
		return async ({ update }: any) => {
			loading = false;
			await update();
		};
	}

	function handleResend() {
		resending = true;
		return async ({ update, result }: any) => {
			resending = false;
			if (result.type === 'success' && result.data?.message) {
				toastMessage = result.data.message;
				toastType = 'success';
			} else if (result.type === 'failure' && result.data?.error) {
				toastMessage = result.data.error;
				toastType = 'error';
			}
			await update({ reset: false });
		};
	}
</script>

<svelte:head>
	<title>Verifikasi OTP - Reset Password</title>
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

<div class="min-h-screen bg-[#09090b] text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
	<div class="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:border-neutral-700/60">
		<div class="text-center mb-8">
			<h1 class="text-2xl font-bold tracking-tight text-neutral-100">Verifikasi OTP</h1>
			<p class="text-neutral-400 text-sm mt-2">
				Masukkan 6 digit kode keamanan yang telah dikirimkan ke email Anda untuk melanjutkan reset kata sandi.
			</p>
		</div>

		<form method="POST" action="?/verify" use:enhance={handleVerify} class="flex flex-col gap-5">
			<Input
				label="Kode Keamanan"
				name="otp"
				type="text"
				inputmode="numeric"
				pattern="[0-9]*"
				maxlength={6}
				placeholder="123456"
				iconLeft="ri-key-2-line"
				required
				disabled={loading || resending}
				class="tracking-[0.5em] text-center font-bold text-lg"
			/>

			<div class="mt-2 flex flex-col gap-3">
				<Button type="submit" width="full" disabled={loading || resending}>
					{#if loading}
						<i class="ri-loader-4-line animate-spin"></i> Memverifikasi...
					{:else}
						<i class="ri-checkbox-circle-line"></i> Verifikasi Kode
					{/if}
				</Button>
			</div>
		</form>

		<!-- Resend Action Form -->
		<form method="POST" action="?/resend" use:enhance={handleResend} class="mt-4 text-center">
			<button
				type="submit"
				disabled={loading || resending}
				class="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 outline-none flex items-center justify-center gap-1 mx-auto"
			>
				{#if resending}
					<i class="ri-loader-4-line animate-spin"></i> Mengirim ulang...
				{:else}
					<i class="ri-refresh-line"></i> Belum menerima kode? Kirim Ulang
				{/if}
			</button>
		</form>
	</div>
</div>
