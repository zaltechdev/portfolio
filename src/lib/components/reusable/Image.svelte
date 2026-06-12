<script lang="ts">
	import { cn } from '$lib/utils';
    import { onMount } from 'svelte';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		src: string;
		alt?: string;
		ratio?: 'auto' | 'square' | 'square-circled' | 'portrait' | 'landscape';
		objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
	}

	let {
		src,
		alt = 'Image',
		ratio = 'auto',
		objectFit = 'cover',
		loading = 'lazy',
		class: className,
		...rest
	}: Props = $props();

	let hasError = $state(false);
	let isLoaded = $state(false);
	let previousSrc = $state("");

	onMount(() => previousSrc = src)

	// Reset state when src changes
	$effect(() => {
		if (src !== previousSrc) {
			hasError = false;
			isLoaded = false;
			previousSrc = src;
		}
	});

	function handleError() {
		hasError = true;
	}

	function handleLoad() {
		isLoaded = true;
	}

	let ratioClasses = $derived.by(() => {
		switch (ratio) {
			case 'square-circled': return 'aspect-square rounded-full';
			case 'portrait': return 'aspect-[3/4]';
			case 'landscape': return 'aspect-video';
			case 'square': return 'aspect-square';
			case 'auto':
			default: return '';
		}
	});

	let fitClass = $derived.by(() => {
		switch (objectFit) {
			case 'contain': return 'object-contain';
			case 'fill': return 'object-fill';
			case 'none': return 'object-none';
			case 'scale-down': return 'object-scale-down';
			case 'cover':
			default: return 'object-cover';
		}
	});
</script>

<div class={cn('relative overflow-hidden w-full bg-neutral-900/10 dark:bg-neutral-900 flex items-center justify-center', ratioClasses, className)}>
	{#if !src || hasError}
		<div class="flex flex-col items-center justify-center text-neutral-500 gap-2 p-4 text-center w-full h-full min-h-120px">
			<i class="ri-image-line text-2xl"></i>
			<span class="text-sm font-medium">No Image</span>
		</div>
	{:else}
		<img
			{src}
			{alt}
			{loading}
			class={cn(
				'w-full transition-all duration-700 ease-in-out',
				ratio === 'auto' ? 'h-auto' : 'h-full absolute inset-0',
				fitClass,
				isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-105'
			)}
			onerror={handleError}
			onload={handleLoad}
			{...rest}
		/>
	{/if}
</div>
