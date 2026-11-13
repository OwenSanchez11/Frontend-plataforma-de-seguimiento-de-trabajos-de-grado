<script>
    import { page } from '$app/stores';
    import { sesion, cerrarSesion } from '$lib/sesion.svelte.js';
	import { goto } from '$app/navigation';
	import logoIcon from '../../../assets/icon-only.png';

	let menuAbierto = $state(false);
	let busqueda = $state('');
	let desconectando = $state(false);

	function toggleMenu() {
		menuAbierto = !menuAbierto;
	}

	function cerrarMenu() {
		menuAbierto = false;
	}

	function desconectar(e) {
		e.preventDefault();
		if (desconectando) return;
		desconectando = true;
		cerrarMenu();
		setTimeout(() => {
			cerrarSesion();
			goto('/login');
		}, 900);
	}

    const menuPrincipal = [
        {id: 'inicio', name: 'Inicio', icon: 'bi-grid-1x2-fill', href: '/coordinador'},
        { id: 'Avances', name: 'Avances & entrgas', icon: 'bi-building', href: '/coordinador/avances' },
        { id: 'roles', name: 'Asignación de equipo', icon: 'bi-journal-text', href: '/coordinador/roles' },
        { id: 'trabajos-grado', name: 'Trabajos de Grado', icon: 'bi-folder2-open', href: '/coordinador/trabajoGrado' },
        { id: 'evaluaciones', name: 'Evaluaciones', icon: 'bi-book', href: '/coordinador/evaluaciones' },
    ];


	let nombre = $derived(
		[sesion.usuario?.nombre, sesion.usuario?.apellido].filter(Boolean).join(' ') ||
		sesion.usuario?.username ||
		sesion.usuario?.email ||
		'Coordinador'
	);
	let iniciales = $derived(
		nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(parte => parte[0]).join('').toUpperCase()
	);

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
				<img src={logoIcon} alt="" width="28" height="28" class="rounded-2 object-fit-contain" />
			</div>
			<span class="lh-sm">
				<span class="d-block h6 fw-bold text-dark mb-0">GradosTrack</span>
			</span>
		</a>

		<div class="d-flex align-items-center gap-2">
				<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold extra-small flex-shrink-0" style="width: 32px; height: 32px;">
					{iniciales}
				</div>
				<div class="lh-1 min-w-0 d-none d-sm-block">
					<span class="fw-bold text-dark d-block extra-small text-truncate">{nombre}</span>
					<span class="extra-small text-muted">{sesion.usuario?.carrera ?? sesion.usuario?.rol ?? 'Coordinador'}</span>
				</div>

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
				{#each menuPrincipal as item}
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

				<li class="nav-item d-none d-xl-block mx-1 my-auto">
					<div class="vr h-100 opacity-25"></div>
				</li>
				<li class="nav-item d-xl-none mt-2 pt-2 border-top">
					<span class="extra-small text-muted fw-bold text-uppercase px-2 d-block mb-1">Evaluaciones Docentes</span>
				</li>

				<li class="nav-item ms-xl-auto">
					<button
						type="button"
						class="nav-link px-2.5 py-2 rounded-3 extra-small fw-semibold d-flex align-items-center gap-2 transition-all text-danger border-0 bg-transparent w-100"
						onclick={desconectar}
						disabled={desconectando}
					>
						<i class="bi bi-box-arrow-right fs-6"></i>
						<span>Cerrar sesión</span>
					</button>
				</li>



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

{#if desconectando}
	<div class="logout-message" role="status" aria-live="polite">
		<div class="logout-card">
			<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
			<span>Desconectando usuario...</span>
		</div>
	</div>
{/if}

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
	.logout-message {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: grid;
		place-items: center;
		background: rgb(15 23 42 / 35%);
	}
	.logout-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		background: white;
		color: #212529;
		font-weight: 600;
		box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 15%);
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
