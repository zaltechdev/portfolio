<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLAnchorAttributes {
		type?: 'button' | 'link';
		variant?: 'primary' | 'secondary';
		width?: 'fit' | 'full';
		children?: Snippet;
	}

	let {
		type = 'link',
		variant = 'primary',
		width = 'fit',
		children,
		class: className,
		...rest
	}: Props = $props();

	// Button styles
	let btnBaseClasses = 'inline-flex items-center justify-center gap-2 h-10 rounded-lg transition-colors duration-300 font-medium px-4 outline-none';
	let btnVariantClasses = $derived(
		variant === 'primary' 
			? 'border border-indigo-400 text-neutral-50 bg-indigo-500 hover:bg-indigo-600 focus:bg-indigo-600 active:bg-indigo-600 hover:border-indigo-500 focus:border-indigo-500 active:border-indigo-500'
			: 'text-indigo-400 border-transparent hover:bg-neutral-800/50 hover:text-indigo-500 focus:bg-neutral-800/50 focus:text-indigo-500 active:bg-neutral-800/50 active:text-indigo-500'
	);
	let widthClasses = $derived(width === 'full' ? 'w-full' : 'w-fit');

	// Link styles
	let linkBaseClasses = 'inline-flex items-center gap-2 transition-colors duration-300 text-indigo-500 hover:underline focus:underline active:underline outline-none';
	let linkVariantClasses = $derived(
		variant === 'secondary' ? 'hover:bg-neutral-800 focus:bg-neutral-800 active:bg-neutral-800 rounded-md px-1' : ''
	);

	let appliedClasses = $derived(
		type === 'button'
			? cn(btnBaseClasses, btnVariantClasses, widthClasses, className)
			: cn(linkBaseClasses, linkVariantClasses, className)
	);
</script>

<a class={appliedClasses} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</a>
