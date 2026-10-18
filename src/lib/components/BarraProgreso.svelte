<script>
  // avances: el arreglo que ya traes de la tabla avances
  let { avances = [], compact = false } = $props();

  // Solo cuentan los avances activos (estado = true)
  let activos = $derived(avances.filter((a) => a.estado));
  let aprobados = $derived(
    activos.filter((a) => a.dictamen?.toLowerCase() === 'aprobado').length
  );
  let porcentaje = $derived(
    activos.length > 0 ? Math.round((aprobados / activos.length) * 100) : 0
  );
  let color = $derived(
    porcentaje === 100 ? 'bg-success' : porcentaje >= 50 ? 'bg-primary' : 'bg-warning'
  );
</script>

<div class={compact ? '' : 'mb-3'}>
  {#if !compact}
    <div class="d-flex justify-content-between mb-1">
      <span class="fw-semibold">Progreso del trabajo de grado</span>
      <span>{porcentaje}%</span>
    </div>
  {/if}

  <div
    class="progress {compact ? 'rounded-pill bg-light border' : ''}"
    role="progressbar"
    aria-label="Progreso del trabajo de grado"
    aria-valuenow={porcentaje}
    aria-valuemin="0"
    aria-valuemax="100"
    style:height={compact ? '10px' : undefined}
  >
    <div class="progress-bar {color} {compact ? 'progress-bar-striped progress-bar-animated rounded-pill' : ''}" style="width: {porcentaje}%"></div>
  </div>

  {#if !compact}
    <small class="text-muted">
      {aprobados} de {activos.length} avances aprobados
    </small>
  {/if}
</div>
