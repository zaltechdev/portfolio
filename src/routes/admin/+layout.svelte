<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	let { data, children } = $props();
	let mobileMenuOpen = $state(false);

	const navigation = [
		{ name: 'Dashboard', href: '/admin/dashboard', icon: 'ri-dashboard-3-line' },
		{ name: 'Edit Profil', href: '/admin/profile', icon: 'ri-profile-line' },
		{ name: 'Daftar Projek', href: '/admin/projects', icon: 'ri-folders-line' },
		{ name: 'Pesan Masuk', href: '/admin/messages', icon: 'ri-mail-line' },
		{ name: 'Pengaturan Akun', href: '/admin/account', icon: 'ri-user-settings-line' }
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

{#if page.url.pathname.startsWith('/admin/login')}
	{@render children()}
{:else}
<div class="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col md:flex-row">
	<!-- Mobile Top Navigation Header -->
	<header class="md:hidden flex items-center justify-between px-6 py-4 bg-neutral-900 border-b border-neutral-800">
		<a href="/admin/dashboard" class="flex items-center gap-2 font-bold text-indigo-400">
			<i class="ri-shield-keyhole-line text-xl"></i>
			<span>Admin Panel</span>
		</a>
		<button onclick={toggleMobileMenu} class="text-neutral-400 hover:text-neutral-100 transition-colors p-1" aria-label="Toggle menu">
			<i class={mobileMenuOpen ? 'ri-close-line text-2xl' : 'ri-menu-line text-2xl'}></i>
		</button>
	</header>

	<!-- Mobile Sidebar Overlay Menu -->
	{#if mobileMenuOpen}
		<button class="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm w-full h-full border-none outline-none cursor-default" onclick={closeMobileMenu} aria-label="Tutup Menu"></button>
		<aside class="md:hidden fixed top-57px bottom-0 left-0 w-64 z-50 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between py-6">
			<nav class="flex flex-col gap-2 px-4">
				{#each navigation as item}
					<a
						href={item.href}
						onclick={closeMobileMenu}
						class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium {page.url.pathname === item.href ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/50'}"
					>
						<i class={item.icon}></i>
						<span>{item.name}</span>
					</a>
				{/each}
			</nav>

			<div class="px-4">
				<form action="/admin/logout" method="POST" use:enhance>
					<button
						type="submit"
						class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-300 font-medium"
					>
						<i class="ri-logout-box-line"></i>
						<span>Keluar</span>
					</button>
				</form>
			</div>
		</aside>
	{/if}

	<!-- Desktop Left Sidebar -->
	<aside class="hidden md:flex flex-col justify-between w-64 bg-neutral-950 border-r border-neutral-800 p-6 shrink-0 h-screen sticky top-0">
		<div class="flex flex-col gap-8">
			<!-- Header Branding -->
			<div class="flex items-center gap-3 px-2">
				<div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
					<i class="ri-shield-keyhole-line text-lg"></i>
				</div>
				<div>
					<h2 class="font-bold text-neutral-100 text-sm leading-tight">Admin Dashboard</h2>
				</div>
			</div>

			<!-- Navigation Links -->
			<nav class="flex flex-col gap-2">
				{#each navigation as item}
					<a
						href={item.href}
						class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium border border-transparent {page.url.pathname === item.href ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/40'}"
					>
						<i class={item.icon}></i>
						<span>{item.name}</span>
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex flex-col gap-4">
			<!-- User Badge -->
			<div class="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/40 border border-neutral-800">
				<div class="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm uppercase">
					{data.user?.username?.charAt(0) || 'A'}
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs font-semibold text-neutral-200 truncate">{data.user?.username}</p>
					<p class="text-[10px] text-neutral-500 truncate">{data.user?.email}</p>
				</div>
			</div>

			<!-- Logout Action -->
			<form action="/admin/logout" method="POST" use:enhance>
				<button
					type="submit"
					class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-300 font-medium"
				>
					<i class="ri-logout-box-line"></i>
					<span>Keluar</span>
				</button>
			</form>
		</div>
	</aside>

	<!-- Main Workspace Panel -->
	<main class="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
		{@render children()}
	</main>
</div>
{/if}
