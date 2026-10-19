<script>
  import { onMount } from 'svelte';
  import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';
  import { getTrabajoPorDocente } from '$lib/api.js';
  import { sesion } from '$lib/sesion.svelte.js';

let equipo = $state([]);

  let busqueda = $state('');
  let cargando = $state(true);
  let error = $state('');

  function listaDe(respuesta) {
    if (Array.isArray(respuesta)) return respuesta;
    if (Array.isArray(respuesta?.trabajos)) return respuesta.trabajos;
    if (Array.isArray(respuesta?.data)) return respuesta.data;
    return [];
  }

  onMount(async () => {
    try {
      const docente = sesion.usuario;
      if (!docente?.id_user) throw new Error('No se encontró el docente en la sesión.');
      const respuesta = await getTrabajoPorDocente(docente.id_user);
      equipo = listaDe(respuesta).map((item) => {
        const trabajo = item.trabajo ?? item;
        const equipoTrabajo = Array.isArray(item.equipo) ? item.equipo : Array.isArray(trabajo.equipo) ? trabajo.equipo : [];
        return {
          id_trabajo_grado: trabajo.id_trabajo_grado ?? trabajo.id,
          titulo: trabajo.titulo ?? trabajo.nombre_trabajo ?? 'Trabajo sin título',
          estudiantes: equipoTrabajo.filter((p) => String(p.rol_proyecto ?? '').toLowerCase().includes('estudiante')),
          jurados: equipoTrabajo.filter((p) => String(p.rol_proyecto ?? '').toLowerCase().includes('jurado')),
          estado: trabajo.estado ?? trabajo.estado_trabajo ?? 'Sin estado',
          progreso: Number(trabajo.progreso ?? trabajo.avance_porcentaje ?? 0)
        };
      });
    } catch (e) {
      error = e?.message ?? 'No fue posible cargar el equipo de trabajo.';
    } finally {
      cargando = false;
    }
  });

  let filtrado = $derived(
    equipo.filter((t) => {
      const texto = busqueda.toLowerCase();
      return (
        String(t.titulo).toLowerCase().includes(texto) ||
        t.estudiantes.some((e) => `${e.nombre ?? ''} ${e.apellido ?? ''}`.toLowerCase().includes(texto))
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
