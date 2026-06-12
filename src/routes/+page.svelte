<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/components/reusable/Button.svelte';
	import Input from '$lib/components/reusable/Input.svelte';
	import Textarea from '$lib/components/reusable/Textarea.svelte';
	import Toast from '$lib/components/reusable/Toast.svelte';
	import Image from '$lib/components/reusable/Image.svelte';

	let { data, form } = $props();

	let loading = $state(false);
	let toastMessage = $state("");
	let toastType = $state<'success' | 'error' | 'info'>('info');

	// Parse tech stack list helper
	function parseTechStack(techstack: string) {
		if (!techstack) return [];
		return techstack
			.split(',')
			.map((tech: string) => tech.trim())
			.filter((tech: string) => tech.length > 0);
	}

	function getPageUrl(pageNum: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', pageNum.toString());
		return url.pathname + url.search + '#project';
	}

	$effect(() => {
		if (form?.error) {
			toastMessage = form.error;
			toastType = 'error';
		} else if (form?.success && form?.message) {
			toastMessage = form.message;
			toastType = 'success';
		}
	});

	function handleContactSubmit() {
		loading = true;
		return async ({ update, result }: any) => {
			loading = false;
			await update();
		};
	}
</script>

<svelte:head>
	<title>{data.profile ? data.profile.fullname : 'Portofolio Digital'}</title>
	<meta name="description" content={data.profile ? data.profile.description : 'Selamat datang di portofolio pribadi saya.'} />
</svelte:head>

<Toast bind:message={toastMessage} type={toastType} />

{#if !data.profile}
	<!-- SETUP WELCOME SCREEN IF PROFILE NOT YET CONFIGURED -->
	<div class="h-dvh bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
		<!-- Background light glow -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>

		<div class="max-w-md w-full bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl text-center flex flex-col gap-6 shadow-2xl relative z-10">
			<div class="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-indigo-500/5">
				<i class="ri-rocket-2-line"></i>
			</div>
			
			<div class="flex flex-col gap-2">
				<h1 class="text-2xl font-extrabold tracking-tight text-neutral-100">Siapkan Portofolio Anda</h1>
				<p class="text-neutral-400 text-sm leading-relaxed">
					Selamat datang! Untuk memulai, silakan masuk ke panel admin dan lengkapi profil owner serta unggah projek utama Anda.
				</p>
			</div>

			<div class="bg-neutral-950/80 border border-neutral-800/80 p-4 rounded-xl text-left flex flex-col gap-2 text-xs text-neutral-500">
				<div class="flex items-center gap-2"><i class="ri-checkbox-circle-line text-indigo-400"></i> Buat akun & login aman (OTP)</div>
				<div class="flex items-center gap-2"><i class="ri-checkbox-circle-line text-indigo-400"></i> Lengkapi deskripsi profil & foto</div>
				<div class="flex items-center gap-2"><i class="ri-checkbox-circle-line text-indigo-400"></i> Upload projek utama andalan Anda</div>
			</div>

			<Button type="button" width="full" onclick={() => window.location.href = '/admin/login'}>
				<i class="ri-settings-4-line"></i> Buka Panel Admin
			</Button>
		</div>
	</div>
{:else}
	<!-- FULL PORTFOLIO LANDING PAGE -->
	<div class="h-dvh bg-neutral-950 text-neutral-100 selection:bg-indigo-500/30 selection:text-indigo-200">
		
		<!-- STICKY GLASSMORPHIC NAVBAR -->
		<nav class="sticky top-0 z-40 bg-neutral-950/60 backdrop-blur-md border-b border-neutral-900/60 py-4 px-6 md:px-16 flex justify-between items-center">
			<a href="/" class="text-lg font-black tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors uppercase">
				zaltechdev
			</a>
			
			<div class="flex items-center gap-6 md:gap-8">
				<a href="#about" class="text-sm font-semibold text-neutral-400 hover:text-neutral-100 transition-colors">Tentang</a>
				<a href="#project" class="text-sm font-semibold text-neutral-400 hover:text-neutral-100 transition-colors">Projek</a>
				<a href="#contact" class="text-sm font-semibold text-neutral-400 hover:text-neutral-100 transition-colors">Kontak</a>
			</div>
		</nav>

		<!-- HERO SECTION -->
		<section id="about" class="py-20 md:py-28 px-6 md:px-16 w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative">
			<!-- Left Info Block -->
			<div class="md:col-span-7 flex flex-col gap-6 text-center md:text-left relative z-10 order-2 md:order-1">
				<h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-neutral-100">
					Hai, Saya <span class="text-indigo-400">{data.profile.fullname}</span>
				</h1>
				<p class="text-neutral-400 text-base md:text-lg leading-relaxed whitespace-pre-line">
					{data.profile.description}
				</p>

				<!-- Social Links -->
				<div class="flex items-center justify-center md:justify-start gap-4 mt-2">
					<a href={data.profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" class="w-10 h-10 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all duration-300 shadow-md">
						<i class="ri-github-fill text-xl"></i>
					</a>
					{#if data.profile.linkedin}
						<a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" class="w-10 h-10 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all duration-300 shadow-md">
							<i class="ri-linkedin-box-fill text-xl"></i>
						</a>
					{/if}
					{#if data.profile.email}
						<a href="mailto:{data.profile.email}" aria-label="Email Address" class="w-10 h-10 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all duration-300 shadow-md">
							<i class="ri-mail-fill text-xl"></i>
						</a>
					{/if}
				</div>

				<div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-4 justify-center md:justify-start">
					<Button type="button" onclick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
						<i class="ri-chat-3-line"></i> Hubungi Saya
					</Button>
					<Button type="button" variant="secondary" onclick={() => document.getElementById('project')?.scrollIntoView({ behavior: 'smooth' })}>
						Lihat Projek <i class="ri-arrow-down-line"></i>
					</Button>
				</div>
			</div>

			<!-- Right Photo Block -->
			<div class="md:col-span-5 flex justify-center order-1 md:order-2">
				<div class="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border border-neutral-800 bg-neutral-900/40 p-1.5 shadow-2xl flex items-center justify-center">
					<div class="w-full h-full rounded-full overflow-hidden relative border border-neutral-800">
						{#if data.profile.photoUrl}
							<Image src={data.profile.photoUrl} alt={data.profile.fullname} ratio="square" objectPosition="top" />
						{:else}
							<div class="flex items-center justify-center w-full h-full text-neutral-600">
								<i class="ri-user-fill text-6xl"></i>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<!-- FEATURED PROJECT SECTION -->
		<section id="project" class="py-20 md:py-28 px-6 md:px-16 border-t border-neutral-900 bg-neutral-950/40">
			<div class="w-full">
				<div class="text-center md:text-left mb-16">
					<h2 class="text-3xl md:text-4xl font-extrabold text-neutral-100 mt-2">Projek Saya</h2>
				</div>

				{#if data.projects.length === 0}
					<!-- Placeholder / No projects uploaded -->
					<div class="bg-neutral-900/50 border border-neutral-850 p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4 max-w-xl mx-auto">
						<div class="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-850 flex items-center justify-center text-neutral-600">
							<i class="ri-code-s-slash-line text-2xl"></i>
						</div>
						<div class="flex flex-col gap-1">
							<h3 class="text-lg font-bold text-neutral-200">Daftar Projek akan segera hadir</h3>
							<p class="text-neutral-500 text-sm">
								Nantikan daftar projek yang saya kembangkan.
							</p>
						</div>
					</div>
				{:else}
					<!-- Display Projects List -->
					<div class="flex flex-col gap-10">
						{#each data.projects as project}
							<div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-3xl hover:border-neutral-700/60 transition-all duration-300">
								<!-- Mockup Column -->
								<div class="md:col-span-5 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center shadow-lg relative group">
									{#if project.photoUrl}
										<Image src={project.photoUrl} alt={project.title} ratio="landscape" class="group-hover:scale-105 transition-transform duration-700" />
									{:else}
										<div class="flex flex-col items-center justify-center py-12 text-neutral-600 gap-2 w-full h-full min-h-55">
											<i class="ri-image-line text-3xl"></i>
											<span class="text-xs">Gambar Projek</span>
										</div>
									{/if}
								</div>

								<!-- Details Column -->
								<div class="md:col-span-7 flex flex-col justify-center gap-2">
									<div class="flex flex-col gap-2">
										<h3 class="text-2xl md:text-3xl font-extrabold text-neutral-100 tracking-tight">{project.title}</h3>
									</div>
									<p class="text-neutral-400 text-sm md:text-base leading-relaxed whitespace-pre-line">
										{project.description}
									</p>
									<!-- Tech Stack Tags -->
									<div class="flex flex-wrap gap-2 mt-2">
										{#each parseTechStack(project.techstack) as tag}
											<span class="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider">
												{tag}
											</span>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- PAGINATION CONTROLS -->
					{#if data.pagination.totalPages > 1}
						<div class="flex justify-center items-center gap-3 mt-12">
							<a
								href={getPageUrl(data.pagination.page - 1)}
								class="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-neutral-850 bg-neutral-900/40 text-sm font-medium transition-all duration-300 {data.pagination.page <= 1 ? 'opacity-40 pointer-events-none' : 'hover:border-neutral-700 text-neutral-200'}"
							>
								<i class="ri-arrow-left-s-line"></i> Sebelumnya
							</a>

							<span class="text-xs text-neutral-450 font-semibold bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md">
								Halaman {data.pagination.page} dari {data.pagination.totalPages}
							</span>

							<a
								href={getPageUrl(data.pagination.page + 1)}
								class="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-neutral-850 bg-neutral-900/40 text-sm font-medium transition-all duration-300 {data.pagination.page >= data.pagination.totalPages ? 'opacity-40 pointer-events-none' : 'hover:border-neutral-700 text-neutral-200'}"
							>
								Selanjutnya <i class="ri-arrow-right-s-line"></i>
							</a>
						</div>
					{/if}
				{/if}
			</div>
		</section>

		<!-- CONTACT FORM SECTION -->
		<section id="contact" class="py-20 md:py-28 px-6 md:px-16 border-t border-neutral-900 w-full">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
				<!-- Left Text Block -->
				<div class="lg:col-span-5 flex flex-col justify-center gap-4 text-center lg:text-left w-full">
					<div class="flex flex-col gap-2">
						<span class="text-indigo-400 text-xs font-bold uppercase tracking-wider">Hubungi Saya</span>
						<h2 class="text-3xl md:text-4xl font-extrabold text-neutral-100">Mari Bekerja Sama</h2>
					</div>
					<p class="text-neutral-400 text-sm md:text-base leading-relaxed">
						Tertarik untuk bekerja sama, mendiskusikan projek baru, atau hanya ingin menyapa? Kirimkan pesan Anda melalui formulir kontak ini. Saya akan membalas secepat mungkin.
					</p>
					
					<!-- Social Links -->
					<div class="flex items-center justify-center lg:justify-start gap-4 mt-2 self-center lg:self-start">
						<a href={data.profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" class="w-16 h-16 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all duration-300 shadow-md">
							<i class="ri-github-fill text-3xl"></i>
						</a>
						{#if data.profile.linkedin}
							<a href={data.profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" class="w-16 h-16 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all duration-300 shadow-md">
								<i class="ri-linkedin-box-fill text-3xl"></i>
							</a>
						{/if}
						{#if data.profile.email}
							<a href="mailto:{data.profile.email}" aria-label="Email Address" class="w-16 h-16 rounded-xl bg-neutral-900/40 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all duration-300 shadow-md">
								<i class="ri-mail-fill text-3xl"></i>
							</a>
						{/if}
					</div>
				</div>

				<!-- Right Form Block -->
				<div class="lg:col-span-7">
					<div class="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl">
						<form method="POST" action="?/sendMessage" use:enhance={handleContactSubmit} class="flex flex-col gap-5">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<Input
									label="Nama Anda"
									name="name"
									type="text"
									placeholder="John Doe"
									iconLeft="ri-user-line"
									required
									disabled={loading}
								/>
								
								<Input
									label="Alamat Email"
									name="email"
									type="email"
									placeholder="john@example.com"
									iconLeft="ri-mail-line"
									required
									disabled={loading}
								/>
							</div>

							<Textarea
								label="Pesan Anda"
								name="message"
								placeholder="Tuliskan detail projek, pertanyaan, atau pesan Anda di sini..."
								iconLeft="ri-message-2-line"
								required
								rows={6}
								disabled={loading}
								class="resize-none!"
							/>

							<div class="pt-2">
								<Button type="submit" width="full" disabled={loading}>
									{#if loading}
										<i class="ri-loader-4-line animate-spin"></i> Mengirim...
									{:else}
										<i class="ri-send-plane-line"></i> Kirim Pesan
									{/if}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>

		<!-- FOOTER -->
		<footer class="py-8 px-6 md:px-12 border-t border-neutral-900 bg-neutral-950 text-center text-xs text-neutral-500">
			<p>&copy; {new Date().getFullYear()} zaltechdev. All rights reserved.</p>
		</footer>
	</div>
{/if}
