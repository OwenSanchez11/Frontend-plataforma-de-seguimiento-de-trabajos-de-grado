<script>
  // Datos de ejemplo — luego vienen de GET /api/admin/usuarios
  let usuarios = $state([
    { id: 1, nombre: "Owen Sanchez", correo: "owen.sanchez@cul.edu.co", rol: "Estudiante", facultad: "Ingeniería", estado: true, fecha_registro: "2025-01-15" },
    { id: 2, nombre: "María Torres", correo: "maria.torres@cul.edu.co", rol: "Jurado", facultad: "Ingeniería", estado: true, fecha_registro: "2024-08-10" },
    { id: 3, nombre: "Carlos Ruiz", correo: "carlos.ruiz@cul.edu.co", rol: "Director", facultad: "Ingeniería", estado: true, fecha_registro: "2024-06-01" },
    { id: 4, nombre: "Laura Gómez", correo: "laura.gomez@cul.edu.co", rol: "Estudiante", facultad: "Ciencias Económicas", estado: false, fecha_registro: "2025-02-20" },
    { id: 5, nombre: "Andrés Pérez", correo: "andres.perez@cul.edu.co", rol: "Coordinador", facultad: "Ingeniería", estado: true, fecha_registro: "2024-03-05" }
  ]);

  let busqueda = $state("");
  let filtroRol = $state("todos");
  let filtroEstado = $state("todos");

  const rolColor = {
    "Estudiante": "primary",
    "Director": "success",
    "Jurado": "info",
    "Coordinador": "warning"
  };

  let usuariosFiltrados = $derived.by(() => usuarios.filter(u => {
    const coincideBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase())
      || u.correo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
    const coincideEstado = filtroEstado === "todos"
      || (filtroEstado === "activo" && u.estado)
      || (filtroEstado === "inactivo" && !u.estado);
    return coincideBusqueda && coincideRol && coincideEstado;
  }));

  function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function toggleEstado(id) {
    usuarios = usuarios.map(u => u.id === id ? { ...u, estado: !u.estado } : u);
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
 
  <!-- Filtros -->
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
          <option value="Estudiante">Estudiante</option>
          <option value="Director">Director</option>
          <option value="Jurado">Jurado</option>
          <option value="Coordinador">Coordinador</option>
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
 
  <!-- Tabla -->
  <div class="card border-0 shadow-sm rounded-4 p-3">
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
          <tr class="text-muted small text-uppercase">
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Facultad</th>
            <th>Registro</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {#each usuariosFiltrados as u (u.id)}
            <tr>
              <td class="fw-semibold">{u.nombre}</td>
              <td class="text-muted">{u.correo}</td>
              <td>
                <span class="badge rounded-pill text-bg-{rolColor[u.rol] ?? 'secondary'}">{u.rol}</span>
              </td>
              <td>{u.facultad}</td>
              <td class="text-muted small">{formatearFecha(u.fecha_registro)}</td>
              <td>
                <button
                  class="btn btn-sm {u.estado ? 'btn-outline-success' : 'btn-outline-secondary'} rounded-pill"
                  on:click={() => toggleEstado(u.id)}
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
 
          {#if usuariosFiltrados.length === 0}
            <tr>
              <td colspan="7" class="text-center text-muted py-4">
                No se encontraron usuarios con esos filtros.
              </td>
            </tr>
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