<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, generateRandomString } from '$lib/utils';

	interface Props extends HTMLInputAttributes {
		value?: string | number | null;
		iconLeft?: string;
		iconRight?: string;
		message?: string;
		width?: 'fit' | 'full';
		label?: string;
	}

	let {
		value = $bindable(),
		iconLeft,
		iconRight,
		message,
		width = 'full',
		class: className,
		disabled,
		label,
		...rest
	}: Props = $props();

	let containerWidth = $derived(width === 'full' ? 'w-full' : 'w-fit');
	
	let hasError = $derived(!!message);
	let baseBorder = $derived(hasError ? 'border-red-500' : 'border-neutral-700 focus-within:border-indigo-500');
	
	let paddingLeft = $derived(iconLeft ? 'pl-10' : 'pl-4');
	let paddingRight = $derived(iconRight ? 'pr-10' : 'pr-4');

	let inputId = $derived.by(() => generateRandomString(6))
</script>

<div class={cn('flex flex-col gap-1', containerWidth)}>
	{#if label} <label for={inputId} class="text-sm text-neutral-300">{label}</label>{/if}
	<div class={cn(
		'relative flex items-center h-10 rounded-lg border bg-transparent transition-colors duration-300',
		baseBorder,
		disabled ? 'opacity-50 cursor-not-allowed' : ''
	)}>
		{#if iconLeft}
			<div class="absolute left-0 flex items-center justify-center w-10 h-10 text-neutral-400">
				<i class={iconLeft}></i>
			</div>
		{/if}

		<input
			bind:value
			class={cn(
				'w-full h-full bg-transparent outline-none text-neutral-50',
				paddingLeft,
				paddingRight,
				className
			)}
			id={inputId}
			{disabled}
			{...rest}
		/>

		{#if iconRight}
			<div class="absolute right-0 flex items-center justify-center w-10 h-10 text-neutral-400">
				<i class={iconRight}></i>
			</div>
		{/if}
	</div>

	{#if message}
		<div class="flex items-center gap-1 text-sm text-red-500">
			<i class="ri-error-warning-line"></i>
			<span>{message}</span>
		</div>
	{/if}
</div>
