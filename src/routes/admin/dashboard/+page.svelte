<script lang="ts">
	import { unixtimestamp2datetime } from '$lib/utils';
	import Button from '$lib/components/reusable/Button.svelte';
	
	let { data } = $props();

	let isProfileComplete = $derived(!!data.profile);

	function formatDate(timestamp: number) {
		const date = unixtimestamp2datetime(timestamp);
		return date.toLocaleDateString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard - Portofolio Admin</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<!-- Top Welcome Card -->
	<div class="relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
		<div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
		<div class="flex flex-col gap-2 text-center md:text-left">
			<h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-100">
				Halo, {data.user?.username}! 👋
			</h1>
			<p class="text-neutral-400 text-sm max-w-md">
				Selamat datang kembali di panel administrasi Anda. Kelola profil dan projek Anda di sini.
			</p>
		</div>
		<div class="flex gap-3">
			<Button variant="primary" onclick={() => window.open('/', '_blank')}>
				<i class="ri-external-link-line"></i> Lihat Portofolio
			</Button>
		</div>
	</div>

	<!-- Status Grid -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Profile Status -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-neutral-700 transition-all duration-300">
			<div class="flex items-center justify-between">
				<span class="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Profil Owner</span>
				<span class="text-lg w-10 h-10 rounded-xl flex items-center justify-center {isProfileComplete ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
					<i class={isProfileComplete ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
				</span>
			</div>
			<div>
				<h3 class="text-xl font-bold text-neutral-200">
					{isProfileComplete ? data.profile.fullname : 'Belum Diisi'}
				</h3>
				<p class="text-neutral-500 text-xs mt-1">
					{isProfileComplete ? 'Profil Anda sudah terpasang dengan baik.' : 'Lengkapi profil Anda agar muncul di portofolio.'}
				</p>
			</div>
			<a href="/admin/profile" class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-auto">
				{isProfileComplete ? 'Perbarui Profil' : 'Lengkapi Sekarang'} <i class="ri-arrow-right-line"></i>
			</a>
		</div>

		<!-- Project Status -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-neutral-700 transition-all duration-300">
			<div class="flex items-center justify-between">
				<span class="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Jumlah Projek</span>
				<span class="text-lg w-10 h-10 rounded-xl flex items-center justify-center {data.projectCount > 0 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
					<i class={data.projectCount > 0 ? 'ri-folders-line' : 'ri-error-warning-line'}></i>
				</span>
			</div>
			<div>
				<h3 class="text-3xl font-extrabold text-neutral-100">
					{data.projectCount}
				</h3>
				<p class="text-neutral-500 text-xs mt-1">
					{data.projectCount > 0 ? 'Projek Anda sudah aktif ditampilkan.' : 'Belum ada projek yang ditambahkan.'}
				</p>
			</div>
			<a href="/admin/projects" class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-auto">
				Kelola Projek <i class="ri-arrow-right-line"></i>
			</a>
		</div>

		<!-- Messages Count -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-neutral-700 transition-all duration-300">
			<div class="flex items-center justify-between">
				<span class="text-neutral-400 text-xs font-semibold uppercase tracking-wider">Pesan Masuk</span>
				<span class="text-lg w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
					<i class="ri-mail-unread-line"></i>
				</span>
			</div>
			<div>
				<h3 class="text-3xl font-extrabold text-neutral-100">
					{data.messageCount}
				</h3>
				<p class="text-neutral-500 text-xs mt-1">
					Total pesan dari pengunjung portofolio Anda.
				</p>
			</div>
			<a href="/admin/messages" class="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-auto">
				Buka Kotak Masuk <i class="ri-arrow-right-line"></i>
			</a>
		</div>
	</div>

	<!-- Recent Messages Section -->
	<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col gap-6">
		<div class="flex items-center justify-between border-b border-neutral-800 pb-4">
			<h2 class="text-lg font-bold text-neutral-100">Pesan Masuk Terbaru</h2>
			<a href="/admin/messages" class="text-sm font-semibold text-neutral-400 hover:text-indigo-400 transition-colors">
				Lihat Semua ({data.messageCount})
			</a>
		</div>

		{#if data.recentMessages.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-neutral-500 gap-2">
				<i class="ri-inbox-line text-4xl"></i>
				<span class="text-sm">Belum ada pesan masuk.</span>
			</div>
		{:else}
			<div class="flex flex-col gap-4">
				{#each data.recentMessages as msg}
					<div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors duration-300 flex flex-col gap-2">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
							<span class="font-bold text-neutral-200 text-sm flex items-center gap-1.5">
								<i class="ri-user-follow-line text-neutral-400 text-xs"></i> {msg.name}
							</span>
							<span class="text-neutral-500 text-xs">{formatDate(msg.createdAt)}</span>
						</div>
						<span class="text-xs text-indigo-400/80 font-medium truncate">{msg.email}</span>
						<p class="text-neutral-400 text-sm mt-1 whitespace-pre-line line-clamp-2 leading-relaxed">
							{msg.message}
						</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
