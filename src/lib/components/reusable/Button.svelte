<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary';
		width?: 'fit' | 'full';
		children?: Snippet;
	}

	let {
		variant = 'primary',
		width = 'fit',
		children,
		class: className,
		disabled,
		...rest
	}: Props = $props();

	let baseClasses = 'inline-flex items-center justify-center gap-2 h-10 rounded-lg transition-colors duration-300 font-medium px-4 outline-none';
	
	let variantClasses = $derived(
		variant === 'primary' 
			? 'border border-indigo-400 text-neutral-50 bg-indigo-500 hover:bg-indigo-600 focus:bg-indigo-600 active:bg-indigo-600 hover:border-indigo-500 focus:border-indigo-500 active:border-indigo-500'
			: 'text-indigo-400 border-transparent hover:bg-neutral-800/50 hover:text-indigo-500 focus:bg-neutral-800/50 focus:text-indigo-500 active:bg-neutral-800/50 active:text-indigo-500'
	);

	let widthClasses = $derived(width === 'full' ? 'w-full' : 'w-fit');
	
	let disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed';
</script>

<button class={cn(baseClasses, variantClasses, widthClasses, disabledClasses, className)}
	{disabled}
	{...rest}>
	{#if children}
		{@render children()}
	{/if}
</button>
