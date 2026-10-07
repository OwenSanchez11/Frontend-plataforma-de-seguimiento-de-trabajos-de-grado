<script>

  import {onMount} from 'svelte';
  import {getUsuarios, getRoles, getCarreras, crearUsuario, editarUsuario, eliminarUsuario} from '$lib/api'

  let usuarios = $state([]);
  let roles = $state([]);
  let carreras = $state([]);
  let cargando = $state(true);
  let error = $state(null);
  let guardando = $state(false);
  let errorFormulario = $state('');
  let desactivando = $state(false);
  let errorDesactivar = $state('');

  let busqueda = $state("");
  let filtroRol = $state("todos");
  let filtroEstado = $state("todos");


  onMount(async () => {
    const [resUsuarios, resRoles, resCarreras] = await Promise.allSettled([
      getUsuarios(),
      getRoles(),
      getCarreras()
    ]);

    if(resUsuarios.status === 'fulfilled') {
      usuarios = resUsuarios.value;
    } else {
      console.error(resUsuarios.reason);
      error = resUsuarios.reason.message;
    }

    if (resRoles.status === 'fulfilled') {
      roles = resRoles.value;
    } else {
      console.error(resRoles.reason);
    }
    if (resCarreras.status === 'fulfilled') {
      carreras = resCarreras.value;
    } else {
      console.error(resCarreras.reason)
    }

    cargando = false;

  })


  function obtenerNombreRol(id_rol) {
    const rol = roles.find((r) => r.id_rol === Number(id_rol));
    return rol ? rol.rol_nombre : "Sin rol";
  }

  function obtenerNombreCarrera(id_carrera) {
    const carrera = carreras.find((c) => c.id_carrera === Number(id_carrera));
    return carrera ? carrera.nombre_carrera : "Sin carreras";
  }


  const rolColor = {
    "Estudiante": "primary",
    "Director": "success",
    "Jurado": "info",
    "Coordinador": "warning"
  };

  let usuariosFiltrados = $derived.by(() => {
    const texto = busqueda.toLowerCase();

    return usuarios.filter((u) => {
      const nombreCompleto = `${u.nombre ?? ""} ${u.apellido ?? ""}`.toLowerCase();
      const correo = (u.email ?? "").toLowerCase();

      const coincideBusqueda = nombreCompleto.includes(texto) || correo.includes(texto);
      const coincideRol = filtroRol === 'todos' || u.id_rol === Number(filtroRol);
      const coincideEstado = filtroEstado === 'todos' ||
      (filtroEstado === "activo" && u.estado) ||
      (filtroEstado === "inactivo" && !u.estado);

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  });

  function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function toggleEstado(id) {
    usuarios = usuarios.map(u => u.id_user === id ? { ...u, estado: !u.estado } : u);
  }

  //  MODAL CREAR / EDITAR

  let modalFormAbierto = $state(false);
  let usuarioEditando = $state(null);

  // Valores del formulario. Los select usan '' como "nada elegido".
  let form = $state({
    username: '', nombre: '', apellido: '', email: '',
    documento: '', contrasena: '', id_rol: '', id_carrera: '', estado: true
  });

  function abrirCrear() {
    usuarioEditando = null;
    form = {
      username: '', nombre: '', apellido: '', email: '',
      documento: '', contrasena: '', id_rol: '', id_carrera: '', estado: true
    };
    errorFormulario = '';
    modalFormAbierto = true;
  }

  function abrirEditar(usuario) {
    usuarioEditando = usuario;
    // Copiamos los datos del usuario al formulario (así no modificamos la tabla hasta guardar)
    form = {
      username: usuario.username ?? '',
      nombre: usuario.nombre ?? '',
      apellido: usuario.apellido ?? '',
      email: usuario.email ?? '',
      documento: usuario.documento ?? '',
      contrasena: '',
      id_rol: usuario.id_rol ?? '',
      id_carrera: usuario.id_carrera ?? '',
      estado: usuario.estado
    };
    errorFormulario = '';
    modalFormAbierto = true;
  }

  function cerrarModalForm() {
    modalFormAbierto = false;
    usuarioEditando = null;
    errorFormulario = '';
  }

  async function guardarUsuario() {
    errorFormulario = '';

    if (!form.username.trim()) {
      errorFormulario = 'El username es obligatorio.';
      return;
    }
    if (!form.nombre.trim() || !form.apellido.trim()) {
      errorFormulario = 'El nombre y los apellidos son obligatorios.';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errorFormulario = 'Ingresa un correo válido.';
      return;
    }
    if (!form.documento.trim()) {
      errorFormulario = 'El documento es obligatorio.';
      return;
    }
    if (form.id_rol === '') {
      errorFormulario = 'Selecciona un rol.';
      return;
    }
    if (!usuarioEditando && form.contrasena.length < 6) {
      errorFormulario = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Lo que se envía al backend (id_carrera va como null si no se eligió)
    const payload = {
      username: form.username.trim(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      documento: form.documento.trim(),
      id_rol: Number(form.id_rol),
      id_carrera: form.id_carrera === '' ? null : Number(form.id_carrera),
      estado: form.estado
    };

    if (usuarioEditando) {
      guardando = true;
      try {
        await editarUsuario(usuarioEditando.id_user, payload);
        usuarios = usuarios.map((u) =>
          u.id_user === usuarioEditando.id_user ? { ...u, ...payload } : u
        );
      } catch (err) {
        errorFormulario = err?.message ?? 'No se pudo actualizar el usuario.';
        return;
      } finally {
        guardando = false;
      }
    } else {
      guardando = true;
      try {
        const nuevo = await crearUsuario({ ...payload, contrasena: form.contrasena });
        usuarios = [...usuarios, nuevo];
      } catch (err) {
        errorFormulario = err?.message ?? 'No se pudo crear el usuario.';
        return;
      } finally {
        guardando = false;
      }
    }

    cerrarModalForm();
  }


  //  MODAL ELIMINAR (confirmación)

  let modalEliminarAbierto = $state(false);
  let usuarioAEliminar = $state(null);

  function abrirEliminar(usuario) {
    usuarioAEliminar = usuario;
    errorDesactivar = '';
    modalEliminarAbierto = true;
  }

  function cerrarModalEliminar() {
    modalEliminarAbierto = false;
    usuarioAEliminar = null;
    errorDesactivar = '';
  }

  async function confirmarEliminar() {
    desactivando = true;
    errorDesactivar = '';
    try {
      await eliminarUsuario(usuarioAEliminar.id_user);
      // Solo si el backend respondió bien, lo quitamos de la tabla
      usuarios = usuarios.filter((u) => u.id_user !== usuarioAEliminar.id_user);
      cerrarModalEliminar();
    } catch (err) {

      errorDesactivar = err?.message ?? 'No se pudo eliminar el usuario.';
    } finally {
      desactivando = false;
    }
  }


  // Cerrar cualquier modal con Escape
  function cerrarConTeclado(event) {
    if (event.key === 'Escape') {
      cerrarModalForm();
      cerrarModalEliminar();
    }
  }

  // Bloquea el scroll de la página de fondo mientras haya un modal abierto
  // (así, en celular, solo se desplaza el contenido del modal)
  $effect(() => {
    document.body.style.overflow = (modalFormAbierto || modalEliminarAbierto) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  });
</script>


<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-0">Gestión de Usuarios</h4>
      <p class="text-muted small mb-0">Administra los usuarios registrados en la plataforma</p>
    </div>
    <button class="btn btn-primary" onclick={abrirCrear}>
      <i class="bi bi-plus-lg me-1"></i> Nuevo Usuario
    </button>
  </div>

  <div class="card border-0 shadow-sm rounded-4 p-3 mb-3">
    <div class="row g-2">
      <div class="col-md-5">
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
          <input
            type="text"
            class="form-control border-start-0"
            placeholder="Buscar por nombre o correo..."
            bind:value={busqueda}
          />
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" bind:value={filtroRol}>
          <option value="todos">Todos los roles</option>
          {#each roles as rol (rol.id_rol)}
            <option value={rol.id_rol}>{rol.rol_nombre}</option>
          {/each}
        </select>
      </div>
      <div class="col-md-3">
        <select class="form-select" bind:value={filtroEstado}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card border-0 shadow-sm rounded-4 p-3">
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
          <tr class="text-muted small text-uppercase">
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Carrera</th>
            <th>Registro</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#if cargando}
            <tr>
              <td colspan="7" class="text-center text-muted py-4">Cargando usuarios</td>
            </tr>
          {:else if error}
            <tr>
              <td colspan="7" class="text-center text-danger py-4">{error}</td>
            </tr>
          {:else if usuariosFiltrados.length === 0}
            <tr>
              <td colspan="7" class="text-center text-muted py-4">
                No se encontraron usuarios con esos filtros.
              </td>
            </tr>
          {:else}
            {#each usuariosFiltrados as u (u.id_user)}
              <tr>
                <td class="fw-semibold">{u.nombre} {u.apellido ?? ''}</td>
                <td class="text-muted">{u.email}</td>
                <td>
                  <span class="badge rounded-pill text-bg-{rolColor[obtenerNombreRol(u.id_rol)] ?? 'secondary'}">{obtenerNombreRol(u.id_rol)}</span>
                </td>
                <td>{obtenerNombreCarrera(u.id_carrera)}</td>
                <td class="text-muted small">{formatearFecha(u.created_at)}</td>
                <td>
                  <button
                    class="btn btn-sm {u.estado ? 'btn-outline-success' : 'btn-outline-secondary'} rounded-pill"
                    onclick={() => toggleEstado(u.id_user)}
                  >
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-light rounded-circle" title="Ver detalle">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-light rounded-circle" title="Editar" onclick={() => abrirEditar(u)}>
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger rounded-circle" title="Eliminar" onclick={() => abrirEliminar(u)}>
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
      <span class="text-muted small">
        Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
      </span>
    </div>
  </div>
</div>


<!--  MODAL CREAR / EDITAR  -->
{#if modalFormAbierto}
  <div
    class="modal-backdrop-custom"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    onclick={cerrarModalForm}
    onkeydown={cerrarConTeclado}
  >

    <div
      class="modal-content-custom modal-form"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-usuario"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <div class="modal-header-custom d-flex justify-content-between align-items-center">
        <h6 id="titulo-modal-usuario" class="fw-bold mb-0">
          {usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}
        </h6>
        <button type="button" class="btn-close" aria-label="Cerrar modal" onclick={cerrarModalForm}></button>
      </div>

      <form
        id="form-usuario"
        class="modal-body-custom"
        onsubmit={(event) => {
          event.preventDefault();
          guardarUsuario();
        }}
      >
        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <label for="u-username" class="form-label small fw-semibold">Username</label>
            <input id="u-username" type="text" class="form-control" bind:value={form.username} disabled={guardando} />
          </div>
          <div class="col-12 col-sm-6">
            <label for="u-documento" class="form-label small fw-semibold">Documento</label>
            <input id="u-documento" type="text" class="form-control" placeholder="1001567897" bind:value={form.documento} disabled={guardando} />
          </div>

          <div class="col-12 col-sm-6">
            <label for="u-nombre" class="form-label small fw-semibold">Nombre</label>
            <input id="u-nombre" type="text" class="form-control" bind:value={form.nombre} disabled={guardando} />
          </div>
          <div class="col-12 col-sm-6">
            <label for="u-apellido" class="form-label small fw-semibold">Apellidos</label>
            <input id="u-apellido" type="text" class="form-control" bind:value={form.apellido} disabled={guardando} />
          </div>

          <div class="col-12">
            <label for="u-email" class="form-label small fw-semibold">Correo</label>
            <input id="u-email" type="email" class="form-control" placeholder="usuario@correo.com" bind:value={form.email} disabled={guardando} />
          </div>

          {#if !usuarioEditando}
            <div class="col-12">
              <label for="u-contrasena" class="form-label small fw-semibold">Contraseña</label>
              <input id="u-contrasena" type="password" class="form-control" bind:value={form.contrasena} disabled={guardando} />
            </div>
          {/if}

          <div class="col-12 col-sm-6">
            <label for="u-rol" class="form-label small fw-semibold">Rol</label>
            <select id="u-rol" class="form-select" bind:value={form.id_rol} disabled={guardando}>
              <option value="">Selecciona un rol</option>
              {#each roles as rol (rol.id_rol)}
                <option value={rol.id_rol}>{rol.rol_nombre}</option>
              {/each}
            </select>
          </div>
          <div class="col-12 col-sm-6">
            <label for="u-carrera" class="form-label small fw-semibold">Carrera</label>
            <select id="u-carrera" class="form-select" bind:value={form.id_carrera} disabled={guardando}>
              <option value="">Sin carrera</option>
              {#each carreras as c (c.id_carrera)}
                <option value={c.id_carrera}>{c.nombre_carrera}</option>
              {/each}
            </select>
          </div>

          <div class="col-12">
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" role="switch" id="u-estado" bind:checked={form.estado} disabled={guardando} />
              <label class="form-check-label" for="u-estado">{form.estado ? 'Activo' : 'Inactivo'}</label>
            </div>
          </div>

          {#if errorFormulario}
            <div class="col-12">
              <div class="alert alert-danger py-2 small mb-0">{errorFormulario}</div>
            </div>
          {/if}
        </div>
      </form>

      <div class="modal-footer-custom d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2">
        <button type="button" class="btn btn-light" onclick={cerrarModalForm} disabled={guardando}>Cancelar</button>
        <button type="submit" form="form-usuario" class="btn btn-primary" disabled={guardando}>
          {#if guardando}
            <span class="spinner-border spinner-border-sm me-1"></span> Guardando...
          {:else}
            {usuarioEditando ? 'Guardar cambios' : 'Crear usuario'}
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}


<!--  MODAL ELIMINAR  -->
{#if modalEliminarAbierto && usuarioAEliminar}
  <div
    class="modal-backdrop-custom"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    onclick={cerrarModalEliminar}
    onkeydown={cerrarConTeclado}
  >
    <div
      class="modal-content-custom"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-eliminar-usuario"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <div class="modal-header-custom">
        <h6 id="titulo-modal-eliminar-usuario" class="fw-bold mb-0">Eliminar usuario</h6>
      </div>

      <div class="modal-body-custom">
        <p class="text-muted small mb-0">
          ¿Seguro que quieres eliminar a
          <strong>{usuarioAEliminar.nombre} {usuarioAEliminar.apellido ?? ''}</strong>?
          Esta acción no se puede deshacer.
        </p>

        {#if errorDesactivar}
          <div class="alert alert-danger py-2 small mt-3 mb-0">{errorDesactivar}</div>
        {/if}
      </div>

      <div class="modal-footer-custom d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2">
        <button type="button" class="btn btn-light" onclick={cerrarModalEliminar} disabled={desactivando}>Cancelar</button>
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
    padding: 1rem;
    z-index: 1050;
  }


  .modal-content-custom {
    background: white;
    border-radius: 1rem;
    width: 100%;
    max-width: 400px;
    max-height: calc(100vh - 2rem);
    max-height: calc(100dvh - 2rem); 
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .modal-form {
    max-width: 560px;
  }

  .modal-header-custom,
  .modal-footer-custom {
    flex-shrink: 0;
    padding: 1rem 1.25rem;
  }
  .modal-header-custom {
    border-bottom: 1px solid #dee2e6;
  }
  .modal-footer-custom {
    border-top: 1px solid #dee2e6;
  }

  .modal-body-custom {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1.25rem;
  }

  @media (max-width: 575.98px) {
    .modal-backdrop-custom {
      padding: 0.5rem;
    }
    .modal-content-custom {
      max-height: calc(100dvh - 1rem);
    }
    .modal-header-custom,
    .modal-footer-custom {
      padding: 0.75rem 1rem;
    }
    .modal-body-custom {
      padding: 1rem;
    }
  }
</style>