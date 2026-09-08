<script>
	import { page } from '$app/stores';

	let menuAbierto = $state(false);

	function toggleMenu() {
		menuAbierto = !menuAbierto;
	}

	function cerrarMenu() {
		menuAbierto = false;
	}

	// Arreglos de navegación de tu SideBar
	const menuPrincipal = [
		{ id: 'dashboard', name: 'Inicio', icon: 'bi-grid-1x2-fill', href: '/' },
		{ id: 'trabajo', name: 'Mi Trabajo de Grado', icon: 'bi-journal-text', href: '/trabajoGrado' },
		{ id: 'hitos', name: 'Avances & Cronograma', icon: 'bi-calendar-check', href: '/hitos' },
		{ id: 'entregas', name: 'Entregas & Documentos', icon: 'bi-folder2-open', href: '/entregas' },
		{ id: 'retro', name: 'Retroalimentaciones & Jurados', icon: 'bi-chat-left-text', href: '/retroalimentaciones' }
	];

	const menuProfesores = [
		{ id: 'evaluaciones', name: 'Evaluaciones', icon: 'bi-book', href: '/evaluaciones' }
	];

	let usuario = {
		nombre: 'Owen Sanchez',
		carrera: 'Ing. Sistemas y computación',
		periodo: '2025-II'
	};
</script>

<nav class="navbar navbar-expand-xl bg-white border-bottom sticky-top py-2 shadow-sm">
	<div class="container-fluid px-3 px-md-4">
		<!-- Brand / Logo -->
		<a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary me-xl-4" href="/" onclick={cerrarMenu}>
			<div class="bg-primary text-white rounded-3 p-1.5 d-flex align-items-center justify-content-center" style="width: 34px; height: 34px;">
				<i class="bi bi-mortarboard-fill"></i>
			</div>
			<span class="lh-sm">
				<span class="d-block h6 fw-bold text-dark mb-0">GradosTrack</span>
				<span class="extra-small text-muted fw-normal d-none d-sm-block">Gestión de Trabajos de Grado</span>
			</span>
		</a>

		<!-- Botón Hamburguesa Móvil -->
		<button
			class="navbar-toggler border-0 p-1"
			type="button"
			onclick={toggleMenu}
			aria-expanded={menuAbierto}
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<!-- Menú Desplegable / Módulos de Navegación -->
		<div class="collapse navbar-collapse {menuAbierto ? 'show' : ''}" id="navbarContenido">
			<ul class="navbar-nav me-auto mb-2 mb-xl-0 gap-1 pt-2 pt-xl-0">
				<!-- Menú Principal del Estudiante -->
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

				<!-- Separador vertical en escritorio / horizontal en móvil -->
				<li class="nav-item d-none d-xl-block mx-1 my-auto">
					<div class="vr h-100 opacity-25"></div>
				</li>
				<li class="nav-item d-xl-none mt-2 pt-2 border-top">
					<span class="extra-small text-muted fw-bold text-uppercase px-2 d-block mb-1">Evaluaciones Docentes</span>
				</li>

				<!-- Menú de Profesores / Jurados -->
				{#each menuProfesores as item}
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

			<!-- Información de Estado del Servidor y Perfil -->
			<div class="d-flex flex-column flex-xl-row align-items-start align-items-xl-center gap-2 gap-xl-3 pt-3 pt-xl-0 border-top border-xl-0">
				

				<a 
					href="/login" 
					class="d-flex align-items-center gap-2 text-decoration-none p-1.5 rounded-3 profile-hover transition-all w-100 w-xl-auto"
					title="Cerrar sesión o Cambiar de usuario"
					onclick={cerrarMenu}
				>
					<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold extra-small flex-shrink-0" style="width: 32px; height: 32px;">
						VM
					</div>
					<div class="lh-1 min-w-0">
						<span class="fw-bold text-dark d-block extra-small text-truncate">{usuario.nombre}</span>
						<span class="extra-small text-muted">{usuario.carrera}</span>
					</div>
					<i class="bi bi-box-arrow-right text-muted extra-small ms-auto ms-xl-1"></i>
				</a>
			</div>
		</div>
	</div>
</nav>

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
</style>