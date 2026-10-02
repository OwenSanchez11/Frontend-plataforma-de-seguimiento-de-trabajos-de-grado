<script>

  import {onMount} from 'svelte';
  import {getUsuarios, getRoles, getCarreras} from '$lib/api'

  let usuarios = $state([]);
  let roles = $state([]);
  let carreras = $state([]);
  let cargando = $state(true);
  let error = $state(null);

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
      const nombreCompleto = `${u.nombre ?? ""} ${u.apellidos}`.toLowerCase();
      const correo = (u.correo ?? "").toLowerCase();

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
</script>

 
<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-0">Gestión de Usuarios</h4>
      <p class="text-muted small mb-0">Administra los usuarios registrados en la plataforma</p>
    </div>
    <button class="btn btn-primary">
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
                <td class="fw-semibold">{u.nombre}</td>
                <td class="text-muted">{u.email}</td>
                <td>
                  <span class="badge rounded-pill text-bg-{rolColor[obtenerNombreRol(u.id_rol)] ?? 'secondary'}">{obtenerNombreRol(u.id_rol)}</span>
                </td>
                <td>{obtenerNombreCarrera(u.id_carrera)}</td>
                <td class="text-muted small">{formatearFecha(u.fecha_registro)}</td>
                <td>
                  <button
                    class="btn btn-sm {u.estado ? 'btn-outline-success' : 'btn-outline-secondary'} rounded-pill"
                    on:click={() => toggleEstado(u.id_user)}
                  >
                    {u.estado ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-light rounded-circle" title="Ver detalle">
                    <i class="bi bi-eye"></i>
                  </button>
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
 
    <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
      <span class="text-muted small">
        Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
      </span>
    </div>
  </div>
</div>