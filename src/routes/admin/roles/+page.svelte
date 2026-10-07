<script>
  import {onMount} from 'svelte';
  import {getRoles, getModulos, getModulosRol, crearRol, editarRol, eliminarRol} from '$lib/api';

  let roles = $state([]);
  let modulos = $state([]);
  let modulosRol = $state([]);
  let busqueda = $state("");
  let modalAbierto = $state(false);
  let rolSeleccionado = $state(null);
  let cargando = $state(true);
  let error = $state(null);
  let guardando = $state(false);
  let errorFormulario = $state('');
  let desactivando = $state(false);
  let errorDesactivar = $state('');

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

  function cerrarModalConTeclado(event) {
    if (event.key === 'Escape') {
      cerrarModal();
      cerrarModalForm();
      cerrarModalEliminar();
    }
  }

  // Eliminar 
  let modalEliminarAbierto = $state(false);
  let rolAEliminar = $state(null);

  function abrirEliminar(rol) {
    rolAEliminar = rol;
    errorDesactivar = '';
    modalEliminarAbierto = true;
  }

  function cerrarModalEliminar() {
    modalEliminarAbierto = false;
    rolAEliminar = null;
    errorDesactivar = '';
  }

  async function confirmarEliminar() {
    desactivando = true;
    errorDesactivar = '';
    try {
      await eliminarRol(rolAEliminar.id_rol);
      roles = roles.filter((r) => r.id_rol !== rolAEliminar.id_rol);
      modulosRol = modulosRol.filter((mr) => mr.id_rol !== rolAEliminar.id_rol);
      cerrarModalEliminar();
    } catch (e) {
      errorDesactivar = e.message ?? 'No se pudo eliminar el rol.';
    } finally {
      desactivando = false;
    }
  }

  // Modal crear / editar 
  let modalFormAbierto = $state(false);
  let rolEditando = $state(null); // null = creando, objeto = editando
  let form = $state({ rol_nombre: '', estado: true, modulos: [] });

  function abrirCrear() {
    rolEditando = null;
    form = { rol_nombre: '', estado: true, modulos: [] };
    errorFormulario = '';
    modalFormAbierto = true;
  }

  function abrirEditar(rol) {
    rolEditando = rol;
    form = {
      rol_nombre: rol.rol_nombre,
      estado: rol.estado,
      modulos: rol.modulos.map((m) => m.id_modulo)
    };
    errorFormulario = '';
    modalFormAbierto = true;
  }

  function cerrarModalForm() {
    modalFormAbierto = false;
    rolEditando = null;
    errorFormulario = '';
  }

  async function guardarRol() {
    errorFormulario = '';

    if (!form.rol_nombre.trim()) {
      errorFormulario = 'El nombre del rol es obligatorio.';
      return;
    }

    guardando = true;
    try {
      const payload = {
        rol_nombre: form.rol_nombre.trim(),
        estado: form.estado,
        modulos: form.modulos // ids de módulos -> tabla modulo_rol
      };

      if (rolEditando) {
        await editarRol(rolEditando.id_rol, payload);
      } else {
        await crearRol(payload);
      }

      // recargar para ver los cambios reflejados desde la BD
      const [nuevosRoles, nuevosModulosRol] = await Promise.all([getRoles(), getModulosRol()]);
      roles = nuevosRoles;
      modulosRol = nuevosModulosRol;

      cerrarModalForm();
    } catch (e) {
      errorFormulario = e.message ?? 'No se pudo guardar el rol.';
    } finally {
      guardando = false;
    }
  }
</script>

<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-0">Gestión de Roles</h4>
      <p class="text-muted small mb-0">Define los roles y los módulos a los que tiene acceso cada uno</p>
    </div>
    <button class="btn btn-primary" onclick={abrirCrear}>
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
                  <button class="btn btn-sm btn-light rounded-circle" title="Editar" onclick={() => abrirEditar(r)}>
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger rounded-circle ms-1" title="Eliminar" onclick={() => abrirEliminar(r)}>
                    <i class="bi bi-trash"></i>
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

{#if modalFormAbierto}
  <div
    class="modal-backdrop-custom"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    onclick={cerrarModalForm}
    onkeydown={cerrarModalConTeclado}
  >
    <div
      class="modal-content-custom modal-form"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-form"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 id="titulo-modal-form" class="fw-bold mb-0">
          {rolEditando ? `Editar rol "${rolEditando.rol_nombre}"` : 'Nuevo rol'}
        </h6>
        <button type="button" class="btn-close" aria-label="Cerrar modal" onclick={cerrarModalForm}></button>
      </div>

      <form
        onsubmit={(event) => {
          event.preventDefault();
          guardarRol();
        }}
      >
        <div class="mb-3">
          <label for="rol-nombre" class="form-label small fw-semibold">Nombre del rol</label>
          <input
            id="rol-nombre"
            type="text"
            class="form-control"
            placeholder="Ej: Coordinador"
            bind:value={form.rol_nombre}
            disabled={guardando}
          />
        </div>

        <div class="mb-3">
          <span class="form-label small fw-semibold d-block">Módulos con acceso</span>
          <div class="lista-modulos border rounded-3 p-2">
            {#each modulos as m (m.id_modulo)}
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id={`modulo-${m.id_modulo}`}
                  value={m.id_modulo}
                  bind:group={form.modulos}
                  disabled={guardando}
                />
                <label class="form-check-label" for={`modulo-${m.id_modulo}`}>
                  {m.nombre_modulo}
                </label>
              </div>
            {:else}
              <p class="text-muted small mb-0">No hay módulos disponibles.</p>
            {/each}
          </div>
          <div class="form-text">{form.modulos.length} seleccionados</div>
        </div>

        <div class="form-check form-switch mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            role="switch"
            id="rol-estado"
            bind:checked={form.estado}
            disabled={guardando}
          />
          <label class="form-check-label" for="rol-estado">
            {form.estado ? 'Activo' : 'Inactivo'}
          </label>
        </div>

        {#if errorFormulario}
          <div class="alert alert-danger py-2 small">{errorFormulario}</div>
        {/if}

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-light" onclick={cerrarModalForm} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" disabled={guardando}>
            {#if guardando}
              <span class="spinner-border spinner-border-sm me-1"></span> Guardando...
            {:else}
              {rolEditando ? 'Guardar cambios' : 'Crear rol'}
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if modalEliminarAbierto && rolAEliminar}
  <div
    class="modal-backdrop-custom"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    onclick={cerrarModalEliminar}
    onkeydown={cerrarModalConTeclado}
  >
    <div
      class="modal-content-custom"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-eliminar"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <h6 id="titulo-modal-eliminar" class="fw-bold mb-2">Eliminar rol</h6>
      <p class="text-muted small">
        ¿Seguro que quieres eliminar el rol <strong>&quot;{rolAEliminar.rol_nombre}&quot;</strong>?
        Esta acción no se puede deshacer.
      </p>

      {#if errorDesactivar}
        <div class="alert alert-danger py-2 small">{errorDesactivar}</div>
      {/if}

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-light" onclick={cerrarModalEliminar} disabled={desactivando}>
          Cancelar
        </button>
        <button type="button" class="btn btn-danger" onclick={confirmarEliminar} disabled={desactivando}>
          {#if desactivando}
            <span class="spinner-border spinner-border-sm me-1"></span> Eliminando...
          {:else}
            Eliminar
          {/if}
        </button>
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
    max-width: 400px;
  }
  .modal-form {
    max-width: 480px;
  }
  .lista-modulos {
    max-height: 220px;
    overflow-y: auto;
  }
</style>