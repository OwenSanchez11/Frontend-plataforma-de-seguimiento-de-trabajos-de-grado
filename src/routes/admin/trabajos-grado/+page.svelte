<script>
  let trabajos = $state([
    {
      id: 1,
      titulo: "Sistema de seguimiento de trabajos de grado",
      estudiante: "Owen Sanchez",
      director: "Director pendiente",
      estado: "En proceso"
    },
    {
      id: 2,
      titulo: "Plataforma web para gestión académica",
      estudiante: "Estudiante pendiente",
      director: "Director pendiente",
      estado: "En proceso"
    },
    {
      id: 3,
      titulo: "Sistema de gestión de proyectos",
      estudiante: "Estudiante pendiente",
      director: "Director pendiente",
      estado: "Finalizado"
    }
  ]);

  let busqueda = $state("");
  let modalAbierto = $state(false);
  let trabajoSeleccionado = $state(null);

  let trabajosFiltrados = $derived(
    trabajos.filter(t =>
      t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.estudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.director.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  function verTrabajo(trabajo) {
    trabajoSeleccionado = trabajo;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
    trabajoSeleccionado = null;
  }

  function cerrarModalConTeclado(event) {
    if (event.key === "Enter" || event.key === " ") {
      cerrarModal();
    }
  }
</script>

<div class="container-fluid py-4">

  <!-- ENCABEZADO -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-0">Gestión de Trabajos de Grado</h4>
      <p class="text-muted small mb-0">
        Consulta y administra los trabajos de grado registrados en la plataforma
      </p>
    </div>

    <button class="btn btn-primary">
      <i class="bi bi-plus-lg me-1"></i>
      Nuevo Trabajo
    </button>
  </div>


  <!-- BUSCADOR -->
  <div class="card border-0 shadow-sm rounded-4 p-3 mb-3">
    <div class="input-group">
      <span class="input-group-text bg-white border-end-0">
        <i class="bi bi-search"></i>
      </span>

      <input
        type="text"
        class="form-control border-start-0"
        placeholder="Buscar por título, estudiante o director..."
        bind:value={busqueda}
      />
    </div>
  </div>


  <!-- TABLA -->
  <div class="card border-0 shadow-sm rounded-4 p-3">

    <div class="table-responsive">

      <table class="table align-middle mb-0">

        <thead>
          <tr class="text-muted small text-uppercase">
            <th>Trabajo de Grado</th>
            <th>Estudiante</th>
            <th>Director</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>

        <tbody>

          {#each trabajosFiltrados as trabajo (trabajo.id)}

            <tr>

              <td>
                <div class="fw-semibold">
                  {trabajo.titulo}
                </div>

                <small class="text-muted">
                  ID: {trabajo.id}
                </small>
              </td>

              <td class="text-muted small">
                {trabajo.estudiante}
              </td>

              <td class="text-muted small">
                {trabajo.director}
              </td>

              <td>

                <span
                  class="badge rounded-pill
                  {trabajo.estado === 'Finalizado'
                    ? 'text-bg-success'
                    : 'text-bg-primary'}"
                >
                  {trabajo.estado}
                </span>

              </td>

              <td class="text-end">

                <button
                  class="btn btn-sm btn-light rounded-circle me-1"
                  title="Ver detalles"
                  onclick={() => verTrabajo(trabajo)}
                >
                  <i class="bi bi-eye"></i>
                </button>

                <button
                  class="btn btn-sm btn-light rounded-circle"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </button>

              </td>

            </tr>

          {/each}


          {#if trabajosFiltrados.length === 0}

            <tr>
              <td colspan="5" class="text-center text-muted py-4">
                No se encontraron trabajos de grado con esa búsqueda.
              </td>
            </tr>

          {/if}

        </tbody>

      </table>

    </div>

  </div>

</div>


<!-- MODAL DETALLES -->

{#if modalAbierto && trabajoSeleccionado}

  <div
    class="modal-backdrop-custom"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    onclick={cerrarModal}
    onkeydown={cerrarModalConTeclado}
  >

    <div
      class="modal-content-custom"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-trabajo"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >

      <div class="d-flex justify-content-between align-items-center mb-3">

        <h6
          id="titulo-modal-trabajo"
          class="fw-bold mb-0"
        >
          Detalles del Trabajo
        </h6>

        <button
          type="button"
          class="btn-close"
          aria-label="Cerrar modal"
          onclick={cerrarModal}
        ></button>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Título
        </small>

        <span class="fw-semibold">
          {trabajoSeleccionado.titulo}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Estudiante
        </small>

        <span>
          {trabajoSeleccionado.estudiante}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Director
        </small>

        <span>
          {trabajoSeleccionado.director}
        </span>

      </div>


      <div>

        <small class="text-muted d-block">
          Estado
        </small>

        <span
          class="badge rounded-pill
          {trabajoSeleccionado.estado === 'Finalizado'
            ? 'text-bg-success'
            : 'text-bg-primary'}"
        >
          {trabajoSeleccionado.estado}
        </span>

      </div>

    </div>

  </div>

{/if}


<style>

  .modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }

  .modal-content-custom {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    width: 90%;
    max-width: 500px;
  }

</style>