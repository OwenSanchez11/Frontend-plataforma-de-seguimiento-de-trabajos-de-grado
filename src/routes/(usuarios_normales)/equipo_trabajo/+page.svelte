<script>

let equipo = $state([
    {
      id_trabajo_grado: 1,
      titulo: 'Sistema IoT para calidad del aire',
      estudiantes: [
        { id_user: 11, nombre: 'Laura', apellido: 'Pérez', carrera: 'Ingeniería de Sistemas' },
        { id_user: 12, nombre: 'Carlos', apellido: 'Gómez', carrera: 'Ingeniería de Sistemas' }
      ],
      jurados: [
        { id_user: 31, nombre: 'Marta', apellido: 'Rojas' },
        { id_user: 32, nombre: 'Andrés', apellido: 'Mejía' }
      ],
      estado: 'En curso',
      progreso: 60
    },
    {
      id_trabajo_grado: 2,
      titulo: 'Plataforma de gestión de mantenimientos',
      estudiantes: [
        { id_user: 13, nombre: 'Sofía', apellido: 'Ramírez', carrera: 'Ingeniería de Sistemas' }
      ],
      jurados: [{ id_user: 33, nombre: 'Luis', apellido: 'Torres' }],
      estado: 'En revisión',
      progreso: 85
    }
  ]);

  let busqueda = $state('');
  let cargando = $state(false);
  let error = $state('');

  let filtrado = $derived(
    equipo.filter((t) => {
      const texto = busqueda.toLowerCase();
      return (
        t.titulo.toLowerCase().includes(texto) ||
        t.estudiantes.some((e) => `${e.nombre} ${e.apellido}`.toLowerCase().includes(texto))
      );
    })
  );

  let totalEstudiantes = $derived(equipo.reduce((acc, t) => acc + t.estudiantes.length, 0));

  const colorEstado = (estado) =>
    ({ 'En curso': 'primary', 'En revisión': 'warning', Aprobado: 'success', Rechazado: 'danger' })[estado] ?? 'secondary';
</script>

<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="mb-0">Equipo de trabajo</h3>
      <small class="text-muted">Estudiantes y jurados de los trabajos que diriges</small>
    </div>
  </div>

  <!-- Resumen -->
  <div class="row g-3 mb-4">
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Trabajos dirigidos</small>
        <h4 class="mb-0">{equipo.length}</h4>
      </div></div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Estudiantes a cargo</small>
        <h4 class="mb-0">{totalEstudiantes}</h4>
      </div></div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">En revisión</small>
        <h4 class="mb-0">{equipo.filter((t) => t.estado === 'En revisión').length}</h4>
      </div></div>
    </div>
  </div>

  <!-- Búsqueda -->
  <input
    class="form-control mb-3"
    placeholder="Buscar por trabajo o estudiante..."
    bind:value={busqueda}
  />

  {#if cargando}
    <div class="text-center py-5"><div class="spinner-border"></div></div>
  {:else if error}
    <div class="alert alert-danger">{error}</div>
  {:else if filtrado.length === 0}
    <div class="alert alert-light border">No se encontraron resultados.</div>
  {:else}
    <div class="row g-3">
      {#each filtrado as trabajo (trabajo.id_trabajo_grado)}
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>{trabajo.titulo}</strong>
              <span class="badge text-bg-{colorEstado(trabajo.estado)}">{trabajo.estado}</span>
            </div>
            <div class="card-body">
              <div class="progress mb-3" style="height: 8px;">
                <div class="progress-bar" style="width: {trabajo.progreso}%"></div>
              </div>

              <h6 class="text-muted">Estudiantes</h6>
              <ul class="list-group list-group-flush mb-3">
                {#each trabajo.estudiantes as e (e.id_user)}
                  <li class="list-group-item px-0 d-flex justify-content-between">
                    <span>{e.nombre} {e.apellido}</span>
                    <small class="text-muted">{e.carrera}</small>
                  </li>
                {/each}
              </ul>

              <h6 class="text-muted">Jurados</h6>
              <div class="d-flex flex-wrap gap-2">
                {#each trabajo.jurados as j (j.id_user)}
                  <span class="badge text-bg-light border">{j.nombre} {j.apellido}</span>
                {/each}
              </div>
            </div>
            <div class="card-footer bg-transparent text-end">
              <a class="btn btn-sm btn-outline-primary" href="/equipo_trabajo/{trabajo.id_trabajo_grado}">
                Ver trabajo
              </a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>