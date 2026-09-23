<script>
    let resumen = [
        {etiqueta: 'Pendientes de aprobación', valor: 5},
        {etiqueta: 'Sin jurado asignado', valor: 3},
        {etiqueta: 'Por vencer', valor: 2}
    ]


    let avance = [
        {trabajo : 'Sistema de inventario', descripcion: 'avance capitulo 2', fecha: '2026-09-20'},
        {trabajo : 'App Móvil de Turismo', descripcion: 'Diseño de BD finalizado', fecha: '2026-09-19'}
    ]

    let accesosRapidos = [
        { texto: 'Crear nuevo trabajo de grado', icono: 'bi-plus-circle', ruta: '/admin/trabajos-grado/nuevo' },
        { texto: 'Asignar jurado', icono: 'bi-people', ruta: '/admin/asignacion-roles' }
    ]

</script>


<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Accesos rápidos</h6>
        <div class="d-flex gap-2 flex-wrap">
            {#each accesosRapidos as acceso}
                <a href={acceso.ruta} class="btn btn-primary d-flex align-items-center gap-2">
                    <i class="bi {acceso.icono}"></i>
                    {acceso.texto}
                </a>
                
            {/each}
        </div>
    </div>

</section>  


<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Resumen: trabajos pendientes de aprobación (su carrera)</h6>
        <div class="row g-3 mt-1">
            {#each resumen as item}
                <div class="col-md-4">
                    <div class="border rounded p-3 text-center">
                        <div class="fs-4 fw-bold">{item.valor}</div>
                        <div class="text-muted small">{item.etiqueta}</div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</section>

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Avances recientes reportados</h6>
        <ul class="list-group list-group-flush">
            {#each avance as item}
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">{item.trabajo}</div>
                        <div class="text-muted small">{item.descripcion}</div>
                    </div>
                    <span class="text-muted small">{item.fecha}</span>
                </li>
            {/each}
        </ul>
    </div>
</section>