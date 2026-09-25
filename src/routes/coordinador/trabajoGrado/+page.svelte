
<script>
    let filtroEstado = $state('');
    let filtroPrograma = $state('');
    let filtroPeriodo = $state('');


    let trabajosGrado = $state([
        { id: 1, titulo: 'Sistema de Inventarios', estudiante: 'Juan Pérez', estado: 'pendiente' },
        { id: 2, titulo: 'App Móvil de Turismo', estudiante: 'Ana Gómez', estado: 'aprobado' },
        { id: 3, titulo: 'Plataforma de E-learning', estudiante: 'Pedro Díaz', estado: 'rechazado' }
    ]);


    function aprobar(trabajo) {
        trabajo.estado = 'aprobado';
        trabajosGrado = trabajosGrado
    }


    function rechazar(trabajo) {
        trabajo.estado = 'rechazado';
        trabajosGrado = trabajosGrado;
    }

    function claseBadge(estado) {
        if (estado === 'aprobado') return 'bg-success';
        if (estado === 'rechazado') return 'bg-danger';
        return 'bg-warning text-dark';
    }

</script>


<div class="d-flex justify-content-between align-items-center mb-3">
    <h4 class="fw-bold mb-0">Trabajos de Grado</h4>
    <a href="/admin/trabajos-grado/nuevo" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i>Crear nuevo trabajo de grado
    </a>
</div>


<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Filtros</h6>
        <div class="row g-3">
            <div class="col-md-4">
                <label class="form-label small">Estado</label>
                <select class="form-select" bind:value={filtroEstado}>
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label small">Programa</label>
                <select class="form-select" bind:value={filtroPrograma} >
                    <option value="">Todos</option>
                </select>
            </div>

        </div>
    </div>

</section>

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Listado de trabajos de grado de su carrera</h6>
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Estudiante</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {#each trabajosGrado as trabajo}
                        <tr>
                            <td>{trabajo.titulo}</td>
                             <td>{trabajo.estudiante}</td>
                             <td> <span class="badge {claseBadge(trabajo.estado)}">{trabajo.estado}</span></td>
                             <td>
                                {#if trabajo.estado === 'pendiente'}
                                    <button class="btn btn-sm btn-success me-1" onclick={() => aprobar(trabajo)}>Aprobar</button>
                                    <button class="btn btn-sm btn-danger" onclick={() => rechazar(trabajo)}>Rechazar</button>
                                    {:else}
                                        <span class="text-muted small">Sin acciones</span>
                                {/if}
                             </td>
                        </tr>
                    {/each}
                </tbody>

            </table>

        </div>

    </div>
</section>