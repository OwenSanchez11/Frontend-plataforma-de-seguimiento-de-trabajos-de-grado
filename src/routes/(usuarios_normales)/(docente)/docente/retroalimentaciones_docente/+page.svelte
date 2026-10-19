<script>
  // Datos de ejemplo. El backend debería resolver con JOIN el título del avance,
  // el trabajo, el estudiante y el nombre de quien escribió el comentario,
  // además de un booleano `es_mio` (id_usuario == usuario en sesión).
  let retroalimentaciones = $state([
    {
      id_retroalimentacion: 1,
      id_avance: 1,
      avance: 'Marco teórico',
      trabajo: 'Sistema IoT para calidad del aire',
      estudiante: 'Laura Pérez',
      autor: 'Tú',
      es_mio: true,
      comentario: 'Amplía los antecedentes internacionales y revisa el formato de las citas.',
      estado: 'Pendiente',
      created_at: '2026-09-21T10:30:00',
      updated_at: '2026-09-21T10:30:00'
    },
    {
      id_retroalimentacion: 2,
      id_avance: 1,
      avance: 'Marco teórico',
      trabajo: 'Sistema IoT para calidad del aire',
      estudiante: 'Laura Pérez',
      autor: 'Marta Rojas (Jurado)',
      es_mio: false,
      comentario: 'Falta justificar la elección de los sensores.',
      estado: 'Atendida',
      created_at: '2026-09-23T15:00:00',
      updated_at: '2026-09-25T09:10:00'
    },
    {
      id_retroalimentacion: 3,
      id_avance: 3,
      avance: 'Análisis de requisitos',
      trabajo: 'Plataforma de gestión de mantenimientos',
      estudiante: 'Sofía Ramírez',
      autor: 'Tú',
      es_mio: true,
      comentario: 'Excelente levantamiento de requisitos. Puedes pasar a la fase de diseño.',
      estado: 'Atendida',
      created_at: '2026-09-06T08:00:00',
      updated_at: '2026-09-08T11:45:00'
    }
  ]);

  // Avances sobre los que el docente puede comentar (solo para el selector del modal).
  const avancesDisponibles = [
    { id_avance: 1, titulo: 'Marco teórico', trabajo: 'Sistema IoT para calidad del aire', estudiante: 'Laura Pérez' },
    { id_avance: 2, titulo: 'Diseño de la metodología', trabajo: 'Sistema IoT para calidad del aire', estudiante: 'Carlos Gómez' },
    { id_avance: 3, titulo: 'Análisis de requisitos', trabajo: 'Plataforma de gestión de mantenimientos', estudiante: 'Sofía Ramírez' }
  ];

  const ESTADOS = ['Pendiente', 'Atendida'];

  let busqueda = $state('');
  let filtroEstado = $state('');
  let soloMias = $state(false);
  let cargando = $state(false);
  let error = $state('');

  // Modal crear/editar
  let modalAbierto = $state(false);
  let editando = $state(null); // retroalimentación en edición (null = nueva)
  let formAvance = $state('');
  let formComentario = $state('');

  let filtradas = $derived(
    retroalimentaciones.filter((r) => {
      const t = busqueda.toLowerCase();
      const coincideTexto =
        r.comentario.toLowerCase().includes(t) ||
        r.avance.toLowerCase().includes(t) ||
        r.estudiante.toLowerCase().includes(t);
      const coincideEstado = !filtroEstado || r.estado === filtroEstado;
      const coincideAutor = !soloMias || r.es_mio;
      return coincideTexto && coincideEstado && coincideAutor;
    })
  );

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

  // Por ahora solo modifica los datos locales; luego aquí van el POST y el PUT.
  function guardar() {
    if (!formValido) return;
    const ahora = new Date().toISOString();

    if (editando) {
      editando.comentario = formComentario.trim();
      editando.updated_at = ahora;
    } else {
      const av = avancesDisponibles.find((a) => String(a.id_avance) === formAvance);
      retroalimentaciones.unshift({
        id_retroalimentacion: Date.now(), // temporal, lo asigna la BD
        id_avance: av.id_avance,
        avance: av.titulo,
        trabajo: av.trabajo,
        estudiante: av.estudiante,
        autor: 'Tú',
        es_mio: true,
        comentario: formComentario.trim(),
        estado: 'Pendiente',
        created_at: ahora,
        updated_at: ahora
      });
    }
    cerrarModal();
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
  {:else if filtradas.length === 0}
    <div class="alert alert-light border">No se encontraron retroalimentaciones.</div>
  {:else}
    <div class="d-flex flex-column gap-3">
      {#each filtradas as r (r.id_retroalimentacion)}
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-0">{r.avance}</h6>
                <small class="text-muted">{r.trabajo} · {r.estudiante}</small>
              </div>
              <span class="badge text-bg-{colorEstado(r.estado)}">{r.estado}</span>
            </div>

            <p class="mb-2">{r.comentario}</p>

            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                {r.autor} · {formatearFecha(r.created_at)}
                {#if fueEditada(r)}<em>(editado {formatearFecha(r.updated_at)})</em>{/if}
              </small>
              {#if r.es_mio}
                <button class="btn btn-sm btn-outline-primary" onclick={() => abrirEditar(r)}>Editar</button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
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
          <button class="btn btn-light" onclick={cerrarModal}>Cancelar</button>
          <button class="btn btn-primary" onclick={guardar} disabled={!formValido}>Guardar</button>
        </div>
      </div>
    </div>
  </div>
{/if}