<script>
    let filtroTrabajo = '';
    let filtroEstudiante = '';
    let filtroFase = '';


    let historialAvance = [
        { estudiante: 'Juan Pérez', trabajo: 'Sistema de Inventarios', fase: 'Desarrollo', descripcion: 'Avance capítulo 2', fecha: '2026-09-20' },
        { estudiante: 'Ana Gómez', trabajo: 'App Móvil de Turismo', fase: 'Anteproyecto', descripcion: 'Diseño de BD finalizado', fecha: '2026-09-19' }
    ]
    
    let avanceSeleccionado = $state(null);

    function verDetalles(avance) {
        avanceSeleccionado = avance;
    }

</script>

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Filtros</h6>
        <div class="row g-3">
            <div class="col-md-4">
                <label class="form-label small">Trabajo de grados</label>
                <select class="form-select" bind:value={filtroTrabajo}>
                    <option value="">Todos</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label small">Estudiante</label>
                <select class="form-select" bind:value={filtroEstudiante}>
                    <option value="">Todos</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label small">Fase</label>
                <select class="form-select" bind:value={filtroFase}>
                    <option value="">Todos</option>
                </select>
            </div>
        </div>
    </div>
</section>


<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Historial de avances y entregas de su carrera (solo consulta, sin edición)</h6>
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Trabajo de grado</th>
                        <th>Fase</th>
                        <th>Descripción</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {#each historialAvance as avance}
                        <tr on:click={ () => verDetalles(avance)} style = "cursor: pointer;">
                            <td>{avance.estudiante}</td>
                            <td>{avance.trabajo}</td>
                            <td>{avance.fase}</td>
                            <td>{avance.descripcion}</td>
                            <td>{avance.fecha}</td>
                        </tr>
                    {/each}
                </tbody>

            </table>

        </div>
    </div>

</section>

{#if avanceSeleccionado}
    <div class="modal d-block" tabindex="-1" style="background: rgba(0,0,0, 0.5);">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle del avance</h5>
                    <button class="btn-close" on:click={ () => avanceSeleccionado = null}></button>
                </div>
                <div class="modal-body">
                    <p><strong>Estudiante:</strong> {avanceSeleccionado.estudiante}</p>
                    <p><strong>Trabajo de grado:</strong> {avanceSeleccionado.trabajo}</p>
                    <p><strong>Fase:</strong> {avanceSeleccionado.fase}</p>
                    <p><strong>Descripción:</strong> {avanceSeleccionado.descripcion}</p>
                    <p><strong>Fecha:</strong> {avanceSeleccionado.fecha}</p>
                </div>
            </div>
        </div>
    </div>
{/if}