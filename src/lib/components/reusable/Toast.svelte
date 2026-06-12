<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cn } from '$lib/utils';

	interface Props {
		message?: string;
		type?: 'success' | 'error' | 'info';
		duration?: number;
		class?: string;
		position? : 'top-right' | 'bottom-right';
	}

	let {
		message = $bindable(),
		type = 'info',
		duration = 3000,
		class: className,
		position = "top-right"
	}: Props = $props();

	$effect(() => {
		if (message && duration > 0) {
			const timeoutId = setTimeout(() => {
				message = undefined;
			}, duration);

			return () => {
				clearTimeout(timeoutId);
			};
		}
	});

	let bgClasses = $derived.by(() => {
		switch (type) {
			case 'success':
				return 'bg-emerald-950 border-emerald-800 text-emerald-500';
			case 'error':
				return 'bg-red-950 border-red-800 text-red-500';
			case 'info':
			default:
				return 'bg-indigo-950 border-indigo-800 text-indigo-500';
		}
	});

	let iconClass = $derived.by(() => {
		switch (type) {
			case 'success':
				return 'ri-checkbox-circle-line';
			case 'error':
				return 'ri-error-warning-line';
			case 'info':
			default:
				return 'ri-information-line';
		}
	});

	let toastTransitions = $derived.by(() => {
		switch(position){
			case "top-right" : return { y : -20, duration : 300 }
			case "bottom-right" : return { y : 20, duration : 300 }
			default : return { y : -20, duration : 300 }
		}
	})

	let toastPosition = $derived.by(() => {
		switch(position){
			case "top-right" : return "top-6 right-6"
			case "bottom-right" : return "bottom-6 right-6"
			default : return "top-6 right-6"
		}
	})

	function close() {
		message = undefined;
	}
</script>

{#if message}
	<div
		class={cn(
			'fixed z-50 flex items-center gap-3 px-4 h-12 rounded-xl border shadow-xl bg-opacity-95 backdrop-blur-sm',
			bgClasses,toastPosition,
			className
		)}
		transition:fly={toastTransitions}
	>
		<i class={cn(iconClass, 'text-lg')}></i>
		<span class="text-sm font-medium text-neutral-50">{message}</span>

		<button
			onclick={close}
			aria-label="Close"
			class="ml-2 text-neutral-400 hover:text-neutral-50 transition-colors"
		>
			<i class="ri-close-line"></i>
		</button>
	</div>
{/if}
