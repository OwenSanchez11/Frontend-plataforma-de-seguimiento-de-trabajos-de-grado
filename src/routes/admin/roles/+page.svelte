<script>
  import {onMount} from 'svelte';
  import {getRoles, getModulos, getModulosRol} from '$lib/api';

  let roles = $state([]);
  let modulos = $state([]);
  let modulosRol = $state([]);
  let busqueda = $state("");
  let modalAbierto = $state(false);
  let rolSeleccionado = $state(null);
  let cargando = $state(true);
  let error = $state(null);

  onMount(async () => {
    const [resRoles, resModulos, resModulosRol] = await Promise.allSettled([getRoles(), getModulos(),getModulosRol()]);
    if(resRoles.status === 'fulfilled') {
      roles = resRoles.value;
    } else {
      console.error(resRoles.reason);
      error = resRoles.reason.message;
    }
    if (resModulos.status === 'fulfilled') {
        modulos = resModulos.value;
    } else {
      console.error("modulos:", resModulos.reason);
    }
    if(resModulosRol.status === 'fulfilled') {
      modulosRol = resModulosRol.value;
    }else {
      console.error("modulo_rol:", resModulosRol.reason);
    }

    cargando = false;
  
  });

  let rolesConModulos = $derived(
    roles.map((r) => {
      const idsModulos = modulosRol.filter((mr) => mr.id_rol === r.id_rol).map((mr) => mr.id_modulo);

      return {
        ...r,
        modulos: modulos.filter((m) => idsModulos.includes(m.id_modulo))
      };
    })
  );

  let rolesFiltrados = $derived(
    rolesConModulos.filter((r) =>
      (r.rol_nombre ?? "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  function toggleEstado(id_rol) {
    roles = roles.map(r => r.id_rol === id_rol ? { ...r, estado: !r.estado } : r);
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
            <th>Módulos Asignados</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#if cargando}
            <tr>
              <td colspan="4" class="text-center text-muted py-4">Cargando roles...</td>
            </tr>
          {:else if error} 
            <tr>
              <td colspan="4" class="text-center text-danger py-4">{error}</td>
            </tr>
          {:else if rolesFiltrados.length === 0}
            <tr>
              <td colspan="4" class="text-center text-muted py-4">
                No se encontraron roles con esa búsqueda.
              </td>
            </tr>
          {:else}
            {#each rolesFiltrados as r (r.id_rol)}
              <tr>
                <td class="fw-semibold">{r.rol_nombre}</td>
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
                    onclick={() => toggleEstado(r.id_rol)}
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
                    Módulos de &quot;{rolSeleccionado.rol_nombre}&quot;
                </h6>
                <button
                    type="button"
                    class="btn-close"
                    aria-label="Cerrar modal"
                    onclick={cerrarModal}
                ></button>
            </div>
            <ul class="list-group list-group-flush">
                {#each rolSeleccionado.modulos as modulo (modulo.id_modulo)}
                    <li class="list-group-item d-flex align-items-center gap-2 px-0">
                        <i class="bi bi-check-circle-fill text-success"></i>
                        {modulo.nombre_modulo}
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