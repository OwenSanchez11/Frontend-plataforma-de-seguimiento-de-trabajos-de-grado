<script>
  import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';

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

  const columnasEquipo = [
    { title: 'Trabajo', data: 'titulo' },
    { title: 'Estudiantes', data: 'estudiantesTexto' },
    { title: 'Jurados', data: 'juradosTexto' },
    { title: 'Estado', data: 'estado' },
    { title: 'Progreso', data: 'progresoTexto' },
    { title: 'Acciones', data: 'acciones', orderable: false, searchable: false }
  ];
  let filasEquipo = $derived(filtrado.map((t) => ({
    titulo: t.titulo,
    estudiantesTexto: t.estudiantes.map((e) => `${e.nombre} ${e.apellido} (${e.carrera})`).join('<br>'),
    juradosTexto: t.jurados.map((j) => `${j.nombre} ${j.apellido}`).join('<br>'),
    estado: `<span class="badge text-bg-${colorEstado(t.estado)}">${t.estado}</span>`,
    progresoTexto: `${t.progreso}%`,
    acciones: `<a class="btn btn-sm btn-outline-primary" href="/evaluaciones/${t.id_trabajo_grado}">Ver trabajo</a>`
  })));

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
  {:else}
    <div class="card shadow-sm p-3">
      <DataTableWrapper columnas={columnasEquipo} filas={filasEquipo} />
    </div>
  {/if}
</div>
