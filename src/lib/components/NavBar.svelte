<script>
	import { sesion, cerrarSesion } from '$lib/sesion.svelte.js';
	import { page } from '$app/stores';

	let esEstudiante = $derived(sesion.usuario?.rol === 'estudiante');
	let esDocente = $derived(sesion.usuario?.rol === 'docente');
	let menuAbierto = $state(false);
	let busqueda = $state('');
	let nombre = $derived(sesion.usuario?.nombre ?? '');

	let iniciales = $derived(
	nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
	);
	let subtitulo = $derived(esDocente ? 'Docente' : 'Ing. Sistemas y computación');


	function toggleMenu() {
		menuAbierto = !menuAbierto;
	}

	function cerrarMenu() {
		menuAbierto = false;
	}


	const menuComun = [
		{ id: 'dashboard', name: 'Inicio', icon: 'bi-grid-1x2-fill', href: '/' }
	]

	const menuEstudiante = [
		{ id: 'trabajo', name: 'Mi Trabajo de Grado', icon: 'bi-journal-text', href: '/trabajoGrado' },
		{ id: 'entregas', name: 'Avances & Entregas', icon: 'bi-folder2-open', href: '/entregas' },
		{ id: 'retro', name: 'Retroalimentaciones & Jurados', icon: 'bi-chat-left-text', href: '/retroalimentaciones' }
	];

	const menuDocente = [
		{ id: 'equipos', name: 'equipos', icon: 'bi bi-people-fill', href: '/equipo_trabajo' },
		{ id: 'evaluaciones', name: 'Evaluaciones & trabajos asignados', icon: 'bi-book', href: '/evaluaciones' },
		{ id: 'avances', name: 'Avances & Entregas', icon: 'bi-bi-chat-left-text', href: '/entregas_docente' },
		{ id: 'retro-docente', name: 'Retroalimentaciones', icon: 'bi-chat-left-text', href: '/retroalimentaciones_docente' },
	];

	let menu = $derived(
		esEstudiante ? [...menuComun, ...menuEstudiante] : esDocente ? [...menuComun, ...menuDocente] : menuComun
	);

	let usuario = {
		nombre: 'Owen Sanchez',
		carrera: 'Ing. Sistemas y computación',
		periodo: '2025-II'
	};

	function buscar(e) {
		e.preventDefault();
		if (!busqueda.trim()) return;
		console.log('Buscando:', busqueda);
	}
</script>

<header class="bg-white border-bottom sticky-top shadow-sm">

	<div class="container-fluid px-3 px-md-4 py-2 d-flex align-items-center justify-content-between">
		<a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary mb-0" href="/" onclick={cerrarMenu}>
			<div class="bg-primary text-white rounded-3 p-1.5 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
				<i class="bi bi-mortarboard-fill"></i>
			</div>
			<span class="lh-sm">
				<span class="d-block h6 fw-bold text-dark mb-0">GradosTrack</span>
			</span>
		</a>

		<div class="d-flex align-items-center gap-2">
			<a
				href="/login"
				class="d-flex align-items-center gap-2 text-decoration-none p-1.5 rounded-3 profile-hover transition-all"
				title="Cerrar sesión o Cambiar de usuario"
				onclick={() => { cerrarSesion(); cerrarMenu(); }}
			>
				<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold extra-small flex-shrink-0" style="width: 32px; height: 32px;">
					{iniciales}
				</div>
				<div class="lh-1 min-w-0 d-none d-sm-block">
					<span class="fw-bold text-dark d-block extra-small text-truncate">{nombre}</span>
					<span class="extra-small text-muted">{subtitulo}</span>
				</div>
				<i class="bi bi-box-arrow-right text-muted extra-small d-none d-sm-inline"></i>
			</a>

			<button
				class="border-0 p-1 bg-transparent text-dark fs-4 d-block d-xl-none"
				type="button"
				onclick={toggleMenu}
				aria-expanded={menuAbierto}
				aria-label="Toggle navigation"
			>
				<i class="bi bi-list"></i>
			</button>
		</div>
	</div>

	<div class="collapse navbar-collapse-custom border-top {menuAbierto ? 'show' : ''}" id="navbarContenido">
		<div class="container-fluid px-3 px-md-4 py-2 d-flex flex-column flex-xl-row align-items-stretch align-items-xl-center justify-content-between gap-2">

			<ul class="nav flex-column flex-xl-row gap-1 mb-0 flex-grow-1">
				{#each menu as item}
					<li class="nav-item">
						<a
							class="nav-link px-2.5 py-2 rounded-3 extra-small fw-semibold d-flex align-items-center gap-2 transition-all {$page.url.pathname === item.href ? 'active bg-primary text-white' : 'text-secondary hover-bg-light'}"
							href={item.href}
							onclick={cerrarMenu}
						>
							<i class="bi {item.icon} fs-6"></i>
							<span>{item.name}</span>
						</a>
					</li>
				{/each}


			</ul>

			<form class="d-flex flex-shrink-0" style="max-width: 280px; width: 100%;" onsubmit={buscar}>
				<div class="input-group input-group-sm">
					<span class="input-group-text bg-light border-end-0 text-muted">
						<i class="bi bi-search"></i>
					</span>
					<input
						type="search"
						class="form-control border-start-0 bg-light extra-small"
						placeholder="Buscar..."
						bind:value={busqueda}
						aria-label="Buscar"
					/>
				</div>
			</form>
		</div>
	</div>
</header>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
	.hover-bg-light:hover {
		background-color: #f8f9fa;
		color: #0d6efd !important;
	}
	.profile-hover:hover {
		background-color: #f8f9fa;
	}
	.profile-hover:hover span.text-dark {
		color: #0d6efd !important;
	}
	.transition-all {
		transition: all 0.2s ease-in-out;
	}

	/* Colapsable propio (no depende de bootstrap.js) */
	.navbar-collapse-custom {
		display: none;
	}
	.navbar-collapse-custom.show {
		display: block;
	}

	@media (min-width: 1200px) {
		.navbar-collapse-custom {
			display: block !important;
		}
	}
</style>