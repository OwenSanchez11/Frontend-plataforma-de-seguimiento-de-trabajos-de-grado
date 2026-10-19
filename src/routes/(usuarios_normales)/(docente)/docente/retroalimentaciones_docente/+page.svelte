<script>
  import { onMount } from 'svelte';
  import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';
  import { crearRetroalimentacion, editarRetroalimentacion, getAvances, getRetroalimentacionPorTrabajo, getTrabajoPorDocente, getUsuarios } from '$lib/api.js';
  import { sesion } from '$lib/sesion.svelte.js';
  let retroalimentaciones = $state([]);
    let avancesDisponibles = $state([]);

  const ESTADOS = ['Pendiente', 'Atendida'];

  let busqueda = $state('');
  let filtroEstado = $state('');
  let soloMias = $state(false);
  let cargando = $state(true);
  let guardando = $state(false);
  let error = $state('');

  // Modal crear/editar
  let modalAbierto = $state(false);
  let editando = $state(null); // retroalimentación en edición (null = nueva)
  let formAvance = $state('');
  let formComentario = $state('');

  function obtenerLista(respuesta) {
    if (Array.isArray(respuesta)) return respuesta;
    if (Array.isArray(respuesta?.data)) return respuesta.data;
    if (Array.isArray(respuesta?.items)) return respuesta.items;
    if (Array.isArray(respuesta?.trabajos)) return respuesta.trabajos;
    return [];
  }

  function nombreUsuario(usuario) {
    return `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim() || usuario?.username || 'Usuario';
  }

  onMount(async () => {
    try {
      const docente = sesion.usuario;
      if (!docente?.id_user) throw new Error('No se encontró el docente en la sesión.');
      const [respuestaTrabajos, respuestaAvances, respuestaUsuarios] = await Promise.all([
        getTrabajoPorDocente(docente.id_user), getAvances(), getUsuarios()
      ]);
      const trabajos = obtenerLista(respuestaTrabajos).map((item) => item.trabajo ?? item);
      const avances = obtenerLista(respuestaAvances).filter((avance) =>
        trabajos.some((trabajo) => String(trabajo.id_trabajo_grado) === String(avance.id_trabajo_grado))
      );
      const usuarios = obtenerLista(respuestaUsuarios);
      avancesDisponibles = avances.map((avance) => {
        const trabajo = trabajos.find((item) => String(item.id_trabajo_grado) === String(avance.id_trabajo_grado));
        const estudiante = usuarios.find((item) => String(item.id_user) === String(avance.subido_por));
        return {
          id_avance: avance.id_avance,
          titulo: avance.titulo ?? `Avance ${avance.id_avance}`,
          trabajo: trabajo?.titulo ?? 'Trabajo',
          estudiante: nombreUsuario(estudiante)
        };
      });
      const listas = await Promise.all(trabajos.map((trabajo) => getRetroalimentacionPorTrabajo(trabajo.id_trabajo_grado)));
      retroalimentaciones = listas.flatMap((lista) => obtenerLista(lista)).map((item) => {
        const avance = avances.find((registro) => String(registro.id_avance) === String(item.id_avance));
        const trabajo = trabajos.find((registro) => String(registro.id_trabajo_grado) === String(avance?.id_trabajo_grado));
        const autorId = item.id_user ?? item.id_usuario ?? item.usuario?.id_user;
        const autor = usuarios.find((usuario) => String(usuario.id_user) === String(autorId));
        const esMia = String(autorId) === String(docente.id_user);
        return {
          ...item,
          avance: item.avance?.titulo ?? item.titulo_avance ?? avance?.titulo ?? `Avance ${item.id_avance ?? ''}`,
          trabajo: item.trabajo?.titulo ?? item.titulo_trabajo ?? trabajo?.titulo ?? 'Trabajo',
          estudiante: item.estudiante?.nombre ? nombreUsuario(item.estudiante) : nombreUsuario(usuarios.find((u) => String(u.id_user) === String(avance?.subido_por))),
          autor: esMia ? 'Tú' : nombreUsuario(autor),
          es_mio: esMia,
          comentario: String(item.comentario ?? ''),
          estado: item.estado ?? item.dictamen ?? 'Pendiente',
          created_at: item.created_at ?? item.fecha_creacion,
          updated_at: item.updated_at ?? item.created_at ?? item.fecha_creacion
        };
      });
    } catch (e) {
      error = e?.message ?? 'No fue posible cargar las retroalimentaciones.';
    } finally {
      cargando = false;
    }
  });

  let filtradas = $derived(
    retroalimentaciones.filter((r) => {
      const t = busqueda.toLowerCase();
      const coincideTexto =
        String(r.comentario ?? '').toLowerCase().includes(t) ||
        String(r.avance ?? '').toLowerCase().includes(t) ||
        String(r.estudiante ?? '').toLowerCase().includes(t);
      const coincideEstado = !filtroEstado || r.estado === filtroEstado;
      const coincideAutor = !soloMias || r.es_mio;
      return coincideTexto && coincideEstado && coincideAutor;
    })
  );

  const columnasRetroalimentaciones = [
    { title: 'Avance', data: 'avance' }, { title: 'Trabajo', data: 'trabajo' },
    { title: 'Estudiante', data: 'estudiante' }, { title: 'Comentario', data: 'comentario' },
    { title: 'Autor', data: 'autor' }, { title: 'Estado', data: 'estado' },
    { title: 'Fecha', data: 'fecha' },
    { title: 'Acciones', data: 'acciones', orderable: false, searchable: false }
  ];
  let filasRetroalimentaciones = $derived(filtradas.map((r) => ({
    ...r,
    estado: `<span class="badge text-bg-${colorEstado(r.estado)}">${r.estado}</span>`,
    fecha: formatearFecha(r.created_at),
    acciones: r.es_mio ? `<button class="btn btn-sm btn-outline-primary" data-accion="editar" data-id="${r.id_retroalimentacion}">Editar</button>` : '—'
  })));

  function manejarAccion(accion, id) {
    if (accion !== 'editar') return;
    const retroalimentacion = retroalimentaciones.find((r) => String(r.id_retroalimentacion) === String(id));
    if (retroalimentacion) abrirEditar(retroalimentacion);
  }

  let total = $derived(retroalimentaciones.length);
  let pendientes = $derived(retroalimentaciones.filter((r) => r.estado === 'Pendiente').length);
  let mias = $derived(retroalimentaciones.filter((r) => r.es_mio).length);

  let formValido = $derived(formAvance !== '' && formComentario.trim().length > 0);

  const colorEstado = (estado) => ({ Pendiente: 'warning', Atendida: 'success' })[estado] ?? 'secondary';

  function formatearFecha(f) {
    return new Date(f).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  const fueEditada = (r) => r.updated_at !== r.created_at;

  function abrirNueva() {
    editando = null;
    formAvance = '';
    formComentario = '';
    modalAbierto = true;
  }

  function abrirEditar(r) {
    editando = r;
    formAvance = String(r.id_avance);
    formComentario = r.comentario;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
  }

  async function guardar() {
    if (!formValido) return;
    guardando = true;
    error = '';
    try {
      const datos = editando
        ? { comentario: formComentario.trim() }
        : {
            id_avance: Number(formAvance),
            id_usuario: Number(sesion.usuario.id_user),
            comentario: formComentario.trim()
          };
      if (editando) {
        await editarRetroalimentacion(editando.id_retroalimentacion, datos);
      } else {
        await crearRetroalimentacion(datos);
      }
      const trabajos = obtenerLista(await getTrabajoPorDocente(sesion.usuario.id_user)).map((item) => item.trabajo ?? item);
      const respuestas = await Promise.all(trabajos.map((trabajo) => getRetroalimentacionPorTrabajo(trabajo.id_trabajo_grado)));
      // Recargar desde la fuente del backend para conservar los campos calculados y el ID real.
      const docenteId = String(sesion.usuario.id_user);
      retroalimentaciones = respuestas.flatMap((lista) => obtenerLista(lista)).map((item) => {
        const avance = avancesDisponibles.find((a) => String(a.id_avance) === String(item.id_avance));
        const autorId = item.id_user ?? item.id_usuario ?? item.usuario?.id_user;
        return {
          ...item,
          avance: item.avance?.titulo ?? item.titulo_avance ?? avance?.titulo ?? `Avance ${item.id_avance ?? ''}`,
          trabajo: item.trabajo?.titulo ?? item.titulo_trabajo ?? avance?.trabajo ?? 'Trabajo',
          estudiante: item.estudiante?.nombre ? nombreUsuario(item.estudiante) : avance?.estudiante ?? 'Estudiante',
          es_mio: String(autorId) === docenteId,
          autor: String(autorId) === docenteId ? 'Tú' : nombreUsuario(item.usuario),
          comentario: String(item.comentario ?? ''),
          estado: item.estado ?? item.dictamen ?? 'Pendiente',
          created_at: item.created_at ?? item.fecha_creacion,
          updated_at: item.updated_at ?? item.created_at ?? item.fecha_creacion
        };
      });
      cerrarModal();
    } catch (e) {
      error = e?.message ?? 'No fue posible guardar la retroalimentación.';
    } finally {
      guardando = false;
    }
  }
</script>

<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 class="mb-0">Retroalimentaciones</h3>
      <small class="text-muted">Comentarios sobre los avances de tus trabajos dirigidos</small>
    </div>
    <button class="btn btn-primary" onclick={abrirNueva}>+ Nueva retroalimentación</button>
  </div>

  <!-- Resumen -->
  <div class="row g-3 mb-4">
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Total</small>
        <h4 class="mb-0">{total}</h4>
      </div></div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Pendientes de atender</small>
        <h4 class="mb-0 text-warning">{pendientes}</h4>
      </div></div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Escritas por ti</small>
        <h4 class="mb-0">{mias}</h4>
      </div></div>
    </div>
  </div>

  <!-- Filtros -->
  <div class="row g-2 mb-3 align-items-center">
    <div class="col-md-6">
      <input class="form-control" placeholder="Buscar por comentario, avance o estudiante..." bind:value={busqueda} />
    </div>
    <div class="col-md-3">
      <select class="form-select" bind:value={filtroEstado}>
        <option value="">Todos los estados</option>
        {#each ESTADOS as e}<option value={e}>{e}</option>{/each}
      </select>
    </div>
    <div class="col-md-3">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="soloMias" bind:checked={soloMias} />
        <label class="form-check-label" for="soloMias">Solo las mías</label>
      </div>
    </div>
  </div>

  {#if cargando}
    <div class="text-center py-5"><div class="spinner-border"></div></div>
  {:else if error}
    <div class="alert alert-danger">{error}</div>
  {:else}
    <div class="card shadow-sm p-3">
      <DataTableWrapper columnas={columnasRetroalimentaciones} filas={filasRetroalimentaciones} onAccion={manejarAccion} />
    </div>
  {/if}
</div>

<!-- Modal crear / editar -->
{#if modalAbierto}
  <div class="modal d-block" style="background: rgba(0,0,0,.5)" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{editando ? 'Editar retroalimentación' : 'Nueva retroalimentación'}</h5>
          <button class="btn-close" aria-label="Cerrar" onclick={cerrarModal}></button>
        </div>

        <div class="modal-body">
          {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
          <div class="mb-3">
            <label class="form-label" for="avance">Avance</label>
            <select id="avance" class="form-select" bind:value={formAvance} disabled={!!editando}>
              <option value="">Selecciona un avance...</option>
              {#each avancesDisponibles as a (a.id_avance)}
                <option value={String(a.id_avance)}>{a.titulo} — {a.estudiante}</option>
              {/each}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label" for="comentario">Comentario</label>
            <textarea id="comentario" class="form-control" rows="5" bind:value={formComentario}
              placeholder="Escribe tu retroalimentación..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" onclick={cerrarModal} disabled={guardando}>Cancelar</button>
          <button class="btn btn-primary" onclick={guardar} disabled={!formValido || guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  </div>
{/if}
