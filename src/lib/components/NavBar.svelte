<script>
  let menuOpen = $state(false);

  const navLinks = [
    { name: 'Portal Universitario', href: '#'},
    { name: 'Guía y normativa', href: '#'},
    { name: 'Mesa de ayuda', href: '#'},
    { name: 'Estado del Servicio', href: '#'}
  ];

  function cerrarMenu() {
    menuOpen = false;
  }
</script>

<nav class="navbar navbar-expand-lg bg-white border-bottom px-4 py-2">

  <div class="container-fluid d-flex align-items-center justify-content-between p-0">

    <!-- izquierda-->
    <a href="/" class="d-flex align-items-center text-decoration-none me-4" aria-label="Inicio">
      <div class="bg-primary text-white rounded-2 d-flex align-items-center justify-content-center me-2 p-2" style="width: 32px; height: 32px;">
        <i class="bi bi-box-seam-fill fs-6"></i>
      </div>
      <div class="lh-sm">
        <span class="fw-bold text-dark d-block fs-6">GradosTrack</span>
        <span class="text-secondary d-block extra-small d-none d-sm-block">Portal institucional de Grados y Tesis</span>
      </div>
    </a>

    <!-- 2.  central (solo desktop) -->
    <div class="d-none d-lg-flex align-items-center gap-4">
      {#each navLinks as link}
        <a href={link.href} class="nav-link-custom text-secondary text-decoration-none small fw-medium transition-colors">
          {link.name}
        </a>
      {/each}
    </div>

    <!-- 3.  derecha -->
    <div class="d-flex align-items-center gap-2 gap-sm-3">
      <div class="bg-primary-subtle text-primary rounded-2 px-3 py-1.5 d-none d-sm-flex align-items-center gap-2">
        <span class="status-dot rounded-circle bg-primary"></span>
        <span class="fw-bold extra-small text-uppercase tracking-wider">Servicios Operativos</span>
      </div>

      <button type="button" class="btn btn-link text-secondary text-decoration-none p-1 d-none d-md-flex align-items-center gap-1 small fw-semibold">
        <i class="bi bi-globe fs-6"></i>
        <span>ES</span>
      </button>

      <a href="/login" class="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm"
        style="width: 36px; height: 36px;"
        aria-label="Ir al inicio de sesión"
      >
        <i class="bi bi-person-fill fs-5"></i>
      </a>

      <button
        type="button"
        class="btn btn-light border p-1 d-flex d-lg-none align-items-center justify-content-center"
        style="width: 36px; height: 36px;"
        onclick={() => (menuOpen = !menuOpen)}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
      >
        <i class="bi {menuOpen ? 'bi-x-lg' : 'bi-list'} fs-5"></i>
      </button>
    </div>

  </div>

  {#if menuOpen}
    <div class="d-lg-none w-100 border-top mt-2 pt-2">
      <div class="d-flex flex-column gap-1">
        {#each navLinks as link}
          <a
            href={link.href}
            onclick={cerrarMenu}
            class="nav-link-custom text-secondary text-decoration-none small fw-medium py-2 px-1 transition-colors"
          >
            {link.name}
          </a>
        {/each}

        <button type="button" class="btn btn-link text-secondary text-decoration-none p-1 d-md-none d-flex align-items-center gap-1 small fw-semibold text-start">
          <i class="bi bi-globe fs-6"></i>
          <span>ES</span>
        </button>
      </div>
    </div>
  {/if}
</nav>

<style>
  .extra-small {
		font-size: 0.72rem;
	}

  .nav-link-custom {
    color: #6c757d;
    transition: color 0.2s ease-in-out;
  }

  .nav-link-custom:hover {
      color: #0d6efd !important;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      display: inline-block;
    }

    .tracking-wider {
      letter-spacing: 0.05em;
    }
</style>