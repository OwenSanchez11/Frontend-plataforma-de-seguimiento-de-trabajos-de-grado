<script>
  let roles = $state([
    {
      id: 1,
      nombre: "Estudiante",
      descripcion: "Usuario que gestiona su propio trabajo de grado",
      estado: true,
      modulos: ["Mi Trabajo de Grado", "Avances & Entregas", "Retroalimentaciones"]
    },
    {
      id: 2,
      nombre: "Director",
      descripcion: "Guía y aprueba los avances del trabajo de grado",
      estado: true,
      modulos: ["Avances & Entregas", "Retroalimentaciones", "Evaluaciones"]
    },
    {
      id: 3,
      nombre: "Jurado",
      descripcion: "Evalúa el trabajo de grado en las fases finales",
      estado: true,
      modulos: ["Retroalimentaciones", "Evaluaciones"]
    },
    {
      id: 4,
      nombre: "Coordinador",
      descripcion: "Supervisa el proceso general del programa",
      estado: true,
      modulos: ["Trabajos de Grado", "Evaluaciones", "Usuarios"]
    },
    {
      id: 5,
      nombre: "Admin",
      descripcion: "Control total de la plataforma",
      estado: true,
      modulos: ["Usuarios", "Roles", "Trabajos de Grado", "Facultades & Carreras"]
    }
  ]);

  let busqueda = $state("");
  let modalAbierto = $state(false);
  let rolSeleccionado = $state(null);

  let rolesFiltrados = $derived(
    roles.filter(r =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase())
      || r.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  function toggleEstado(id) {
    roles = roles.map(r => r.id === id ? { ...r, estado: !r.estado } : r);
  }

  function verModulos(rol) {
    rolSeleccionado = rol;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
    rolSeleccionado = null;
  }
</script>

<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-0">Gestión de Roles</h4>
      <p class="text-muted small mb-0">Define los roles y los módulos a los que tiene acceso cada uno</p>
    </div>
    <button class="btn btn-primary">
      <i class="bi bi-plus-lg me-1"></i> Nuevo Rol
    </button>
  </div>

  <div class="card border-0 shadow-sm rounded-4 p-3 mb-3">
    <div class="input-group">
      <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
      <input
        type="text"
        class="form-control border-start-0"
        placeholder="Buscar por nombre o descripción..."
        bind:value={busqueda}
      />
    </div>
  </div>

  <div class="card border-0 shadow-sm rounded-4 p-3">
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
          <tr class="text-muted small text-uppercase">
            <th>Rol</th>
            <th>Descripción</th>
            <th>Módulos Asignados</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each rolesFiltrados as r (r.id)}
            <tr>
              <td class="fw-semibold">{r.nombre}</td>
              <td class="text-muted small">{r.descripcion}</td>
              <td>
                <button
                  class="btn btn-sm btn-outline-primary rounded-pill"
                  onclick={() => verModulos(r)}
                >
                  {r.modulos.length} módulos <i class="bi bi-chevron-right small"></i>
                </button>
              </td>
              <td>
                <button
                  class="btn btn-sm {r.estado ? 'btn-outline-success' : 'btn-outline-secondary'} rounded-pill"
                  onclick={() => toggleEstado(r.id)}
                >
                  {r.estado ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-light rounded-circle" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          {/each}

          {#if rolesFiltrados.length === 0}
            <tr>
              <td colspan="5" class="text-center text-muted py-4">
                No se encontraron roles con esa búsqueda.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>


{#if modalAbierto && rolSeleccionado}
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
            aria-labelledby="titulo-modal-rol"
            tabindex="-1"
            onclick={(event) => event.stopPropagation()}
            onkeydown={(event) => event.stopPropagation()}
        >
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 id="titulo-modal-rol" class="fw-bold mb-0">
                    Módulos de &quot;{rolSeleccionado.nombre}&quot;
                </h6>
                <button
                    type="button"
                    class="btn-close"
                    aria-label="Cerrar modal"
                    onclick={cerrarModal}
                ></button>
            </div>
            <ul class="list-group list-group-flush">
                {#each rolSeleccionado.modulos as modulo}
                    <li class="list-group-item d-flex align-items-center gap-2 px-0">
                        <i class="bi bi-check-circle-fill text-success"></i>
                        {modulo}
                    </li>
                {/each}
            </ul>
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
    max-width: 400px;
  }
</style>