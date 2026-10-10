<script>
  // Datos de ejemplo. El backend debería devolver el nombre de quien subió
  // el avance (JOIN con usuarios) y el título del trabajo, no solo los ids.
  let avances = $state([
    {
      id_avance: 1,
      trabajo: 'Sistema IoT para calidad del aire',
      subido_por: 'Laura Pérez',
      titulo: 'Marco teórico',
      descripcion: 'Primera versión del marco teórico con antecedentes.',
      numero_version: 2,
      nombre_archivo: 'marco_teorico_v2.pdf',
      tamano_bytes: 2457600,
      fecha_inicio: '2026-09-01',
      fecha_entrega: '2026-09-20',
      fecha_limite: '2026-09-22',
      estado: 'En revisión',
      dictamen: null
    },
    {
      id_avance: 2,
      trabajo: 'Sistema IoT para calidad del aire',
      subido_por: 'Carlos Gómez',
      titulo: 'Diseño de la metodología',
      descripcion: 'Descripción de la metodología y cronograma.',
      numero_version: 1,
      nombre_archivo: 'metodologia_v1.docx',
      tamano_bytes: 512000,
      fecha_inicio: '2026-09-10',
      fecha_entrega: null,
      fecha_limite: '2026-10-01',
      estado: 'Pendiente',
      dictamen: null
    },
    {
      id_avance: 3,
      trabajo: 'Plataforma de gestión de mantenimientos',
      subido_por: 'Sofía Ramírez',
      titulo: 'Análisis de requisitos',
      descripcion: 'Levantamiento de requisitos funcionales y no funcionales.',
      numero_version: 3,
      nombre_archivo: 'requisitos_v3.pdf',
      tamano_bytes: 1048576,
      fecha_inicio: '2026-08-15',
      fecha_entrega: '2026-09-05',
      fecha_limite: '2026-09-10',
      estado: 'Aprobado',
      dictamen: 'Cumple con los requisitos planteados. Buen trabajo.'
    }
  ]);

  const ESTADOS = ['Pendiente', 'En revisión', 'Aprobado', 'Requiere ajustes'];

  let busqueda = $state('');
  let filtroEstado = $state('');
  let seleccionado = $state(null); // avance abierto en el modal
  let dictamenTexto = $state('');
  let nuevoEstado = $state('');
  let cargando = $state(false);
  let error = $state('');

  const hoy = new Date().toISOString().slice(0, 10);

  let filtrados = $derived(
    avances.filter((a) => {
      const t = busqueda.toLowerCase();
      const coincideTexto =
        a.titulo.toLowerCase().includes(t) ||
        a.trabajo.toLowerCase().includes(t) ||
        a.subido_por.toLowerCase().includes(t);
      const coincideEstado = !filtroEstado || a.estado === filtroEstado;
      return coincideTexto && coincideEstado;
    })
  );

  let porRevisar = $derived(avances.filter((a) => a.estado === 'En revisión').length);
  let vencidos = $derived(avances.filter((a) => esVencido(a)).length);
  let aprobados = $derived(avances.filter((a) => a.estado === 'Aprobado').length);

  function esVencido(a) {
    return !a.fecha_entrega && a.fecha_limite < hoy;
  }

  function formatearTamano(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function formatearFecha(f) {
    if (!f) return '—';
    return new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  const colorEstado = (estado) =>
    ({ Pendiente: 'secondary', 'En revisión': 'warning', Aprobado: 'success', 'Requiere ajustes': 'danger' })[estado] ?? 'secondary';

  function abrirModal(avance) {
    seleccionado = avance;
    dictamenTexto = avance.dictamen ?? '';
    nuevoEstado = avance.estado;
  }

  function cerrarModal() {
    seleccionado = null;
  }

  // Por ahora solo actualiza los datos locales; luego aquí va el PUT al backend.
  function guardarDictamen() {
    seleccionado.dictamen = dictamenTexto;
    seleccionado.estado = nuevoEstado;
    cerrarModal();
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

  {#if cargando}
    <div class="text-center py-5"><div class="spinner-border"></div></div>
  {:else if error}
    <div class="alert alert-danger">{error}</div>
  {:else if filtrados.length === 0}
    <div class="alert alert-light border">No se encontraron avances.</div>
  {:else}
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Avance</th>
              <th>Trabajo</th>
              <th>Estudiante</th>
              <th>Versión</th>
              <th>Entrega</th>
              <th>Fecha límite</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each filtrados as a (a.id_avance)}
              <tr>
                <td class="fw-semibold">{a.titulo}</td>
                <td>{a.trabajo}</td>
                <td>{a.subido_por}</td>
                <td>v{a.numero_version}</td>
                <td>{formatearFecha(a.fecha_entrega)}</td>
                <td>
                  {formatearFecha(a.fecha_limite)}
                  {#if esVencido(a)}<span class="badge text-bg-danger ms-1">Vencido</span>{/if}
                </td>
                <td><span class="badge text-bg-{colorEstado(a.estado)}">{a.estado}</span></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" onclick={() => abrirModal(a)}>
                    Revisar
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
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
          <button class="btn-close" aria-label="Cerrar" onclick={cerrarModal}></button>
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
          <button class="btn btn-light" onclick={cerrarModal}>Cancelar</button>
          <button class="btn btn-primary" onclick={guardarDictamen}>Guardar dictamen</button>
        </div>
      </div>
    </div>
  </div>
{/if}