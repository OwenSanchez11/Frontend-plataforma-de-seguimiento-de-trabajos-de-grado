<script>
  import { onMount } from 'svelte';
  import { sesion } from '$lib/sesion.svelte.js';
  import { editarAvance, getAvances, getTrabajoPorDocente, getUsuarios } from '$lib/api.js';
  import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';

  let avances = $state([]);
  const ESTADOS = ['Pendiente', 'En revisión', 'Aprobado', 'Requiere ajustes'];
  let busqueda = $state('');
  let filtroEstado = $state('');
  let seleccionado = $state(null);
  let dictamenTexto = $state('');
  let nuevoEstado = $state('');
  let cargando = $state(true);
  let guardando = $state(false);
  let error = $state('');
  const hoy = new Date().toISOString().slice(0, 10);

  function obtenerLista(respuesta) {
    if (Array.isArray(respuesta)) return respuesta;
    if (Array.isArray(respuesta?.data)) return respuesta.data;
    if (Array.isArray(respuesta?.items)) return respuesta.items;
    return [];
  }

  function separarDictamen(dictamen, fechaEntrega) {
    const texto = String(dictamen ?? '');
    const match = texto.match(/^(Pendiente|En revisión|Aprobado|Requiere ajustes)(?:\s*—\s*|\s*:\s*|\s*\n)?/i);
    if (match) {
      const estado = ESTADOS.find((item) => item.toLowerCase() === match[1].toLowerCase()) ?? match[1];
      return { estado, comentario: texto.slice(match[0].length).trim() };
    }
    return { estado: fechaEntrega ? 'En revisión' : 'Pendiente', comentario: texto };
  }

  async function cargarAvances() {
    cargando = true;
    error = '';
    try {
      const docente = sesion.usuario;
      if (!docente?.id_user) throw new Error('No se encontró el docente en la sesión.');
      const [respuestaTrabajos, respuestaAvances, respuestaUsuarios] = await Promise.all([
        getTrabajoPorDocente(docente.id_user), getAvances(), getUsuarios()
      ]);
      const trabajos = obtenerLista(respuestaTrabajos);
      const usuarios = obtenerLista(respuestaUsuarios);
      const idsTrabajos = new Set(trabajos.map((trabajo) => Number(trabajo.id_trabajo_grado)));
      avances = obtenerLista(respuestaAvances)
        .filter((avance) => idsTrabajos.has(Number(avance.id_trabajo_grado)) && avance.estado !== false)
        .map((avance) => {
          const trabajo = trabajos.find((item) => Number(item.id_trabajo_grado) === Number(avance.id_trabajo_grado));
          const estudiante = usuarios.find((item) => Number(item.id_user) === Number(avance.subido_por));
          const revision = separarDictamen(avance.dictamen, avance.fecha_entrega);
          return {
            ...avance,
            estadoDB: avance.estado,
            subido_por_id: avance.subido_por,
            trabajo: trabajo?.titulo ?? `Trabajo ${avance.id_trabajo_grado}`,
            subido_por: `${estudiante?.nombre ?? ''} ${estudiante?.apellido ?? ''}`.trim() || estudiante?.username || `Usuario ${avance.subido_por}`,
            estado: revision.estado,
            comentarioRevision: revision.comentario
          };
        });
    } catch (e) {
      console.error('Error al cargar las entregas del docente:', e);
      error = e?.message ?? 'No fue posible cargar las entregas.';
    } finally {
      cargando = false;
    }
  }

  onMount(cargarAvances);

  let filtrados = $derived(avances.filter((a) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto = [a.titulo, a.trabajo, a.subido_por]
      .some((valor) => String(valor ?? '').toLowerCase().includes(texto));
    return coincideTexto && (!filtroEstado || a.estado === filtroEstado);
  }));
  const columnasEntregas = [
    { title: 'Avance', data: 'titulo' }, { title: 'Trabajo', data: 'trabajo' },
    { title: 'Estudiante', data: 'subido_por' }, { title: 'Versión', data: 'versionTexto' },
    { title: 'Entrega', data: 'entregaTexto' }, { title: 'Fecha límite', data: 'limiteTexto' },
    { title: 'Estado', data: 'estadoHtml' },
    { title: 'Acciones', data: 'acciones', orderable: false, searchable: false }
  ];
  let filasEntregas = $derived(filtrados.map((a) => ({
    ...a,
    versionTexto: `v${a.numero_version ?? '—'}`,
    entregaTexto: formatearFecha(a.fecha_entrega),
    limiteTexto: `${formatearFecha(a.fecha_limite)}${esVencido(a) ? ' (Vencido)' : ''}`,
    estadoHtml: `<span class="badge text-bg-${colorEstado(a.estado)}">${a.estado}</span>`,
    acciones: `<button class="btn btn-sm btn-outline-primary" data-accion="revisar" data-id="${a.id_avance}">Revisar</button>`
  })));

  function manejarAccion(accion, id) {
    if (accion !== 'revisar') return;
    const avance = avances.find((item) => String(item.id_avance) === String(id));
    if (avance) abrirModal(avance);
  }
  let porRevisar = $derived(avances.filter((a) => a.estado === 'En revisión').length);
  let vencidos = $derived(avances.filter(esVencido).length);
  let aprobados = $derived(avances.filter((a) => a.estado === 'Aprobado').length);

  function esVencido(avance) {
    return !avance.fecha_entrega && avance.fecha_limite && String(avance.fecha_limite).slice(0, 10) < hoy;
  }

  function formatearTamano(bytes) {
    if (!bytes) return 'Sin tamaño';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function formatearFecha(fecha) {
    if (!fecha) return '—';
    return new Date(`${String(fecha).slice(0, 10)}T00:00:00`).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  const colorEstado = (estado) =>
    ({ Pendiente: 'secondary', 'En revisión': 'warning', Aprobado: 'success', 'Requiere ajustes': 'danger' })[estado] ?? 'secondary';

  function abrirModal(avance) {
    seleccionado = avance;
    dictamenTexto = avance.comentarioRevision;
    nuevoEstado = avance.estado;
    error = '';
  }

  function cerrarModal() {
    if (!guardando) seleccionado = null;
  }

  async function guardarDictamen() {
    if (!seleccionado || guardando) return;
    guardando = true;
    error = '';
    const comentario = dictamenTexto.trim();
    const dictamen = comentario ? `${nuevoEstado} — ${comentario}` : nuevoEstado;
    try {
      await editarAvance(seleccionado.id_avance, {
        id_trabajo_grado: Number(seleccionado.id_trabajo_grado),
        titulo: seleccionado.titulo,
        subido_por: Number(seleccionado.subido_por_id),
        descripcion: seleccionado.descripcion ?? null,
        numero_version: seleccionado.numero_version ?? null,
        nombre_archivo: seleccionado.nombre_archivo ?? null,
        ruta_archivo: seleccionado.ruta_archivo ?? null,
        tamano_bytes: seleccionado.tamano_bytes ?? null,
        fecha_inicio: seleccionado.fecha_inicio ?? null,
        fecha_entrega: seleccionado.fecha_entrega ?? null,
        fecha_limite: seleccionado.fecha_limite ?? null,
        estado: seleccionado.estadoDB,
        dictamen
      });
      avances = avances.map((avance) => avance.id_avance === seleccionado.id_avance
        ? { ...avance, dictamen, estado: nuevoEstado, comentarioRevision: comentario }
        : avance);
      seleccionado = null;
    } catch (e) {
      console.error('Error al guardar el dictamen:', e);
      error = e?.message ?? 'No fue posible guardar el dictamen.';
    } finally {
      guardando = false;
    }
  }
</script>

<div class="container-fluid py-4">
  <div class="mb-4">
    <h3 class="mb-0">Avances y entregas</h3>
    <small class="text-muted">Revisa y emite el dictamen de los avances de tus trabajos dirigidos</small>
  </div>

  <!-- Resumen -->
  <div class="row g-3 mb-4">
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Por revisar</small>
        <h4 class="mb-0 text-warning">{porRevisar}</h4>
      </div></div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Vencidos sin entrega</small>
        <h4 class="mb-0 text-danger">{vencidos}</h4>
      </div></div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm"><div class="card-body">
        <small class="text-muted">Aprobados</small>
        <h4 class="mb-0 text-success">{aprobados}</h4>
      </div></div>
    </div>
  </div>

  <!-- Filtros -->
  <div class="row g-2 mb-3">
    <div class="col-md-8">
      <input class="form-control" placeholder="Buscar por avance, trabajo o estudiante..." bind:value={busqueda} />
    </div>
    <div class="col-md-4">
      <select class="form-select" bind:value={filtroEstado}>
        <option value="">Todos los estados</option>
        {#each ESTADOS as e}<option value={e}>{e}</option>{/each}
      </select>
    </div>
  </div>

  {#if error && !seleccionado}<div class="alert alert-danger">{error}</div>{/if}
  {#if cargando}
    <div class="text-center py-5"><div class="spinner-border"></div></div>
  {:else}
    <div class="card shadow-sm p-3">
      <DataTableWrapper columnas={columnasEntregas} filas={filasEntregas} onAccion={manejarAccion} />
    </div>
  {/if}
</div>

<!-- Modal de revisión (controlado con estado, sin JS de Bootstrap) -->
{#if seleccionado}
  <div class="modal d-block" style="background: rgba(0,0,0,.5)" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h5 class="modal-title mb-0">{seleccionado.titulo} <small class="text-muted">v{seleccionado.numero_version}</small></h5>
            <small class="text-muted">{seleccionado.trabajo}</small>
          </div>
          <button class="btn-close" aria-label="Cerrar" onclick={cerrarModal} disabled={guardando}></button>
        </div>

        <div class="modal-body">
          <div class="row g-3 mb-3">
            <div class="col-md-6"><small class="text-muted d-block">Subido por</small>{seleccionado.subido_por}</div>
            <div class="col-md-6"><small class="text-muted d-block">Estado actual</small>
              <span class="badge text-bg-{colorEstado(seleccionado.estado)}">{seleccionado.estado}</span>
            </div>
            <div class="col-md-4"><small class="text-muted d-block">Inicio</small>{formatearFecha(seleccionado.fecha_inicio)}</div>
            <div class="col-md-4"><small class="text-muted d-block">Entrega</small>{formatearFecha(seleccionado.fecha_entrega)}</div>
            <div class="col-md-4"><small class="text-muted d-block">Fecha límite</small>{formatearFecha(seleccionado.fecha_limite)}</div>
          </div>

          <p class="mb-1 text-muted small">Descripción</p>
          <p>{seleccionado.descripcion}</p>

          <p class="mb-1 text-muted small">Archivo</p>
          <div class="d-flex justify-content-between align-items-center border rounded p-2 mb-4">
            <span>📄 {seleccionado.nombre_archivo} <small class="text-muted">({formatearTamano(seleccionado.tamano_bytes)})</small></span>
            <button class="btn btn-sm btn-outline-secondary" disabled={!seleccionado.fecha_entrega}>Descargar</button>
          </div>

          {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
          <hr />
          <h6>Dictamen</h6>
          <div class="mb-3">
            <label class="form-label" for="nuevoEstado">Resultado</label>
            <select id="nuevoEstado" class="form-select" bind:value={nuevoEstado}>
              {#each ESTADOS as e}<option value={e}>{e}</option>{/each}
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label" for="dictamen">Observaciones</label>
            <textarea id="dictamen" class="form-control" rows="4" bind:value={dictamenTexto}
              placeholder="Escribe la retroalimentación para el estudiante..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-light" onclick={cerrarModal} disabled={guardando}>Cancelar</button>
          <button class="btn btn-primary" onclick={guardarDictamen} disabled={guardando}>{guardando ? "Guardando..." : "Guardar dictamen"}</button>
        </div>
      </div>
    </div>
  </div>
{/if}
