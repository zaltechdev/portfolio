<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		open?: boolean;
		title?: string;
		children?: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		children,
		class: className
	}: Props = $props();

	function close() {
		open = false;
	}
</script>

{#if open}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 300 }}
	>
		<!-- Backdrop click handler -->
		<button class="absolute inset-0 w-full h-full cursor-default outline-none" onclick={close} aria-label="Close modal"></button>

		<!-- Outer Card -->
		<div 
			class={cn("relative z-10 w-full max-w-md bg-neutral-900 rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-neutral-800", className)}
			transition:scale={{ duration: 300, start: 0.95 }}
		>
			{#if title}
				<div class="flex items-center justify-between pb-2 border-b border-neutral-800">
					<h3 class="text-lg font-semibold text-neutral-50">{title}</h3>
					<button onclick={close} aria-label="Close" class="text-neutral-400 hover:text-neutral-50 transition-colors">
						<i class="ri-close-line text-xl"></i>
					</button>
				</div>
			{:else}
				<button onclick={close} aria-label="Close" class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-50 transition-colors z-20">
					<i class="ri-close-line text-xl"></i>
				</button>
			{/if}

			<div class="rounded-xl w-full">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}
