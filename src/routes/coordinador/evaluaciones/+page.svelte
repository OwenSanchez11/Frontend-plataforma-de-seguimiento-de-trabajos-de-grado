<script>
    let filtroEstadoSustentacion = $state('');
    let filtroPeriodo = $state('');

    let resultadosFiltrados = $derived(
        resultadosSustentacion.filter(r =>
            (filtroEstadoSustentacion === '' || r.estado === filtroEstadoSustentacion)
        )
    );

    let resultadosSustentacion = $state([
        { estudiante: 'Ana Gómez', trabajo: 'App Móvil de Turismo', fecha: '2026-09-10', nota: 4.5, estado: 'aprobado' },
        { estudiante: 'Pedro Díaz', trabajo: 'Plataforma de E-learning', fecha: '2026-09-12', nota: 2.8, estado: 'reprobado' },
        { estudiante: 'Juan Pérez', trabajo: 'Sistema de Inventarios', fecha: null, nota: null, estado: 'pendiente' }
    ]);

    function claseBadgeEstado(estado) {
        if (estado === 'aprobado') return 'bg-success';
        if (estado === 'reprobado') return 'bg-danger';
        return 'bg-warning text-dark';
    }


</script>


<section class="cardmb-4">
    <div class="card-body">
        <h6 class="fw-bold">Filtros</h6>
        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label small">Estado de sustentación</label>
                <select class="form-select" bind:value={filtroEstadoSustentacion}>
                    <option value="">Todos</option>
                    <option value="programada">Programada</option>
                    <option value="realizada">Realizada</option>
                    <option value="pendiente">Pendiente</option>
                </select>
            </div>
            <div class="col-md-6">
                <label class="form-label small">Periodo</label>
                <select class="form-select" bind:value={filtroPeriodo}>
                    <option value="">Todos</option>
                </select>

            </div>
        </div>
    </div> 

</section>

<section class="card mb-4">
  <div class="card-body">
    <h6 class="fw-bold">Resultados finales de sustentación de su carrera</h6>
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Trabajo de grado</th>
            <th>Fecha sustentación</th>
            <th>Nota</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {#each resultadosFiltrados as resultado}
            <tr>
              <td>{resultado.estudiante}</td>
              <td>{resultado.trabajo}</td>
              <td>{resultado.fecha ?? '—'}</td>
              <td>{resultado.nota ?? '—'}</td>
              <td><span class="badge {claseBadgeEstado(resultado.estado)}">{resultado.estado}</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</section>