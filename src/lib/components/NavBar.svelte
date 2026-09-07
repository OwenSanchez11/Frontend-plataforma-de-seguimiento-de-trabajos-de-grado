<script>
	import { page } from '$app/state';

	let menuAbierto = $state(false);

	function toggleMenu() {
		menuAbierto = !menuAbierto;
	}

	const navLinks = [
		{ name: 'Portal Institucional', href: 'https://www.ul.edu.co/', external: true },

	];

	let usuario = {
		nombre: 'Owen Sanchez',
		carrera: 'Ing. Sistemas',
		rol: 'Estudiante',
		periodo: '2025-II'
	};
</script>

<nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2">
	<div class="container-fluid px-3 px-md-4">
		<a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" href="/">
			<div class="bg-primary text-white rounded-3 p-1.5 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
				<i class="bi bi-mortarboard-fill extra-small"></i>
			</div>
			<span class="lh-sm">
				<span class="d-block h6 fw-bold text-dark mb-0">GradosTrack</span>
				<span class="extra-small text-muted fw-normal d-none d-sm-block">Gestión de Trabajos de Grado</span>
			</span>
		</a>

		<button
			class="navbar-toggler border-0 p-1"
			type="button"
			onclick={toggleMenu}
			aria-expanded={menuAbierto}
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse {menuAbierto ? 'show' : ''}" id="navbarContenido">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1 pt-2 pt-lg-0">
				{#each navLinks as link}
					<li class="nav-item">
						<a
							class="nav-link extra-small fw-medium text-secondary hover-primary"
							href={link.href}
							target={link.external ? '_blank' : '_self'}
							onclick={() => (menuAbierto = false)}
						>
							{link.name}
							{#if link.external}
								<i class="bi bi-box-arrow-up-right extra-small ms-0.5"></i>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 gap-lg-3 pt-2 pt-lg-0 border-top border-lg-0">

        <div class="d-flex align-items-center gap-1.5 bg-light px-2.5 py-1 rounded-pill border">
					<span class="spinner-grow spinner-grow-sm text-success" style="width: 8px; height: 8px;" role="status"></span>
					<span class="extra-small text-muted fw-medium">Servidor en línea</span>
				</div>

				<span class="badge bg-primary-subtle text-primary border border-primary-subtle extra-small fw-semibold">
					Período: {usuario.periodo}
				</span>

				<!-- En tu NavBar.svelte -->
          <a 
              href="/login" 
              class="d-flex align-items-center gap-2 text-decoration-none p-1 rounded-3 profile-hover transition-all"
              title="Cerrar sesión o Cambiar de usuario"
          >
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold extra-small flex-shrink-0" style="width: 32px; height: 32px;">
                  OS
              </div>
              <div class="lh-1 min-w-0">
                  <span class="fw-bold text-dark d-block extra-small text-truncate">{usuario.nombre}</span>
                  <span class="extra-small text-muted">{usuario.carrera}</span>
              </div>
              <i class="bi bi-box-arrow-right text-muted extra-small ms-1"></i>
          </a>
			</div>
		</div>
	</div>
</nav>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
	.hover-primary:hover {
		color: #0d6efd !important;
	}
	/* Animación suave de hover sobre la tarjeta de perfil */
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