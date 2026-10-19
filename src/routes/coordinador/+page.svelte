
<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { sesion } from '$lib/sesion.svelte.js';
    import {
        getTrabajos,
        getAvances
    } from '$lib/api.js';

    let trabajos = $state([]);
    let avances = $state([]);

    let cargando = $state(true);
    let error = $state('');

    let usuario = $derived(sesion.usuario);

    // ==========================================
    // CONFIGURACIÓN DATATABLE
    // ==========================================

    let paginaActual = $state(1);
    let registrosPorPagina = $state(5);
    let columnaOrden = $state('fecha_entrega');
    let direccionOrden = $state('desc');

    // ==========================================
    // OBTENER LISTAS
    // ==========================================

    function obtenerLista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.data)) return respuesta.data;
        if (Array.isArray(respuesta?.items)) return respuesta.items;
        return [];
    }

    // ==========================================
    // IDENTIFICAR CARRERA
    // ==========================================

    let idCarrera = $derived(
        usuario?.id_carrera ??
        usuario?.carrera?.id_carrera ??
        usuario?.idCarrera ??
        null
    );

    let trabajosCarrera = $derived(
        idCarrera
            ? trabajos.filter(
                (trabajo) =>
                    Number(trabajo.id_carrera) === Number(idCarrera)
            )
            : trabajos
    );

    // ==========================================
    // CARGAR INFORMACIÓN
    // ==========================================

    async function cargarDatos() {
        cargando = true;
        error = '';

        try {
            const [respuestaTrabajos, respuestaAvances] =
                await Promise.all([
                    getTrabajos(),
                    getAvances()
                ]);

            trabajos = obtenerLista(respuestaTrabajos);
            avances = obtenerLista(respuestaAvances);

            paginaActual = 1;

        } catch (e) {
            console.error(
                'Error al cargar el inicio del coordinador:',
                e
            );

            error = e.message ||
                'No fue posible cargar la información.';
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        cargarDatos();
    });

    // ==========================================
    // TRABAJOS PENDIENTES
    // ==========================================

    let pendientes = $derived(
        trabajosCarrera.filter((trabajo) => {
            const estado = String(
                trabajo.estado_tramite ?? ''
            ).toLowerCase();

            return (
                estado.includes('pendiente') ||
                estado.includes('revisión')
            ) && trabajo.estado !== false;
        })
    );

    // ==========================================
    // TRABAJOS POR VENCER
    // ==========================================

    function estaPorVencer(trabajo) {
        if (!trabajo.fecha_fin || trabajo.estado === false) {
            return false;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaFin = new Date(
            String(trabajo.fecha_fin).slice(0, 10) + 'T00:00:00'
        );

        if (isNaN(fechaFin.getTime())) return false;

        const diferencia =
            (fechaFin.getTime() - hoy.getTime()) /
            (1000 * 60 * 60 * 24);

        return diferencia >= 0 && diferencia <= 7;
    }

    let porVencer = $derived(
        trabajosCarrera.filter(estaPorVencer)
    );

    // ==========================================
    // IDENTIFICAR JURADOS
    // ==========================================

    function tieneJurado(trabajo) {
        const campos = [
            'id_jurado',
            'jurado_id',
            'id_usuario_jurado',
            'id_user_jurado',
            'jurado'
        ];

        for (const campo of campos) {
            if (campo in trabajo) {
                const valor = trabajo[campo];

                if (Array.isArray(valor)) {
                    return valor.length > 0;
                }

                return valor !== null &&
                    valor !== undefined &&
                    valor !== '';
            }
        }

        return null;
    }

    let tieneInformacionJurado = $derived(
        trabajosCarrera.some((trabajo) =>
            [
                'id_jurado',
                'jurado_id',
                'id_usuario_jurado',
                'id_user_jurado',
                'jurado'
            ].some((campo) => campo in trabajo)
        )
    );

    let sinJurado = $derived(
        tieneInformacionJurado
            ? trabajosCarrera.filter(
                (trabajo) =>
                    trabajo.estado !== false &&
                    tieneJurado(trabajo) === false
            ).length
            : null
    );

    // ==========================================
    // AVANCES DE LA CARRERA
    // ==========================================

    let avancesCarrera = $derived(
        avances
            .filter((avance) =>
                trabajosCarrera.some(
                    (trabajo) =>
                        Number(trabajo.id_trabajo_grado) ===
                        Number(avance.id_trabajo_grado)
                )
            )
    );

    // ==========================================
    // NOMBRE DEL TRABAJO
    // ==========================================

    function nombreTrabajo(idTrabajo) {
        const trabajo = trabajosCarrera.find(
            (item) =>
                Number(item.id_trabajo_grado) === Number(idTrabajo)
        );

        return trabajo?.titulo ?? 'Trabajo no encontrado';
    }

    // ==========================================
    // FORMATEAR FECHAS
    // ==========================================

    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';

        const fechaTexto = String(fecha).slice(0, 10);
        const partes = fechaTexto.split('-');

        if (partes.length !== 3) return fechaTexto;

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    // ==========================================
    // ORDENAMIENTO DATATABLE
    // ==========================================

    function obtenerValorOrden(avance, columna) {
        switch (columna) {
            case 'trabajo':
                return nombreTrabajo(avance.id_trabajo_grado);

            case 'descripcion':
                return avance.descripcion ??
                    avance.titulo ??
                    '';

            case 'fecha_entrega':
                return avance.fecha_entrega ?? '';

            default:
                return '';
        }
    }

    let avancesOrdenados = $derived(
        [...avancesCarrera].sort((a, b) => {
            const valorA = obtenerValorOrden(a, columnaOrden);
            const valorB = obtenerValorOrden(b, columnaOrden);

            const comparacion = String(valorA).localeCompare(
                String(valorB),
                'es',
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );

            return direccionOrden === 'asc'
                ? comparacion
                : -comparacion;
        })
    );

    function ordenarPor(columna) {
        if (columnaOrden === columna) {
            direccionOrden =
                direccionOrden === 'asc' ? 'desc' : 'asc';
        } else {
            columnaOrden = columna;
            direccionOrden = 'asc';
        }

        paginaActual = 1;
    }

    function iconoOrden(columna) {
        if (columnaOrden !== columna) {
            return 'bi-arrow-down-up';
        }

        return direccionOrden === 'asc'
            ? 'bi-sort-up'
            : 'bi-sort-down';
    }

    // ==========================================
    // PAGINACIÓN DATATABLE
    // ==========================================

    let totalRegistros = $derived(
        avancesOrdenados.length
    );

    let totalPaginas = $derived(
        Math.max(
            1,
            Math.ceil(totalRegistros / registrosPorPagina)
        )
    );

    let inicioRegistro = $derived(
        totalRegistros === 0
            ? 0
            : (paginaActual - 1) * registrosPorPagina + 1
    );

    let finRegistro = $derived(
        Math.min(
            paginaActual * registrosPorPagina,
            totalRegistros
        )
    );

    let avancesPaginados = $derived(
        avancesOrdenados.slice(
            (paginaActual - 1) * registrosPorPagina,
            paginaActual * registrosPorPagina
        )
    );

    let paginasVisibles = $derived.by(() => {
        const inicio = Math.max(
            1,
            Math.min(paginaActual - 2, totalPaginas - 4)
        );

        const fin = Math.min(
            totalPaginas,
            inicio + 4
        );

        return Array.from(
            { length: fin - inicio + 1 },
            (_, i) => inicio + i
        );
    });

    function irPagina(pagina) {
        if (pagina < 1 || pagina > totalPaginas) return;

        paginaActual = pagina;
    }

    function cambiarRegistrosPorPagina(event) {
        registrosPorPagina = Number(event.currentTarget.value);
        paginaActual = 1;
    }

    // ==========================================
    // RESUMEN
    // ==========================================

    let resumen = $derived([
        {
            etiqueta: 'Pendientes de aprobación',
            valor: pendientes.length,
            icono: 'bi-hourglass-split'
        },
        {
            etiqueta: 'Sin jurado asignado',
            valor: sinJurado ?? 'Por identificar',
            icono: 'bi-people'
        },
        {
            etiqueta: 'Por vencer',
            valor: porVencer.length,
            icono: 'bi-calendar-event'
        }
    ]);

    // ==========================================
    // ACCESOS RÁPIDOS
    // ==========================================

    let accesosRapidos = [
        {
            texto: 'Crear nuevo trabajo de grado',
            icono: 'bi-plus-circle',
            ruta: '/coordinador/trabajoGrado'
        },
        {
            texto: 'Asignar jurado',
            icono: 'bi-people',
            ruta: '/coordinador/roles'
        },
        {
            texto: 'Ver avances',
            icono: 'bi-clipboard-check',
            ruta: '/coordinador/avances'
        }
    ];

</script>

<!-- ==========================================
     BIENVENIDA
========================================== -->

<section class="mb-4">
    <h4 class="fw-bold">
        Bienvenido, {usuario?.nombre ?? 'Coordinador'}
    </h4>

    <p class="text-muted mb-0">
        Aquí puedes consultar el estado de los trabajos de grado
        y los avances de tu carrera.
    </p>
</section>

<!-- ==========================================
     MENSAJE DE ERROR
========================================== -->

{#if error}
    <div class="alert alert-danger" role="alert">
        {error}

        <button
            type="button"
            class="btn btn-sm btn-outline-danger ms-2"
            onclick={cargarDatos}
        >
            Reintentar
        </button>
    </div>
{/if}

<!-- ==========================================
     ACCESOS RÁPIDOS
========================================== -->

<section class="card mb-4 shadow-sm">
    <div class="card-body">
        <h6 class="fw-bold mb-3">
            Accesos rápidos
        </h6>

        <div class="d-flex gap-2 flex-wrap">
            {#each accesosRapidos as acceso}
                <a
                    href={acceso.ruta}
                    class="btn btn-primary d-flex align-items-center gap-2"
                >
                    <i class="bi {acceso.icono}"></i>
                    {acceso.texto}
                </a>
            {/each}
        </div>
    </div>
</section>

<!-- ==========================================
     RESUMEN
========================================== -->

<section class="card mb-4 shadow-sm">
    <div class="card-body">
        <h6 class="fw-bold">
            Resumen: trabajos pendientes de aprobación (su carrera)
        </h6>

        {#if cargando}
            <p class="text-muted mb-0">
                Cargando resumen...
            </p>
        {:else}
            <div class="row g-3 mt-1">
                {#each resumen as item}
                    <div class="col-md-4">
                        <div class="border rounded p-3 text-center h-100">
                            <i class="bi {item.icono} fs-4 text-primary"></i>

                            <div class="fs-4 fw-bold mt-2">
                                {item.valor}
                            </div>

                            <div class="text-muted small">
                                {item.etiqueta}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</section>

<!-- ==========================================
     AVANCES RECIENTES - DATATABLE
========================================== -->

<section class="card mb-4 shadow-sm">
    <div class="card-body">

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">

            <div>
                <h6 class="fw-bold mb-1">
                    Avances recientes reportados
                </h6>

                <small class="text-muted">
                    Avances correspondientes a los trabajos de tu carrera
                </small>
            </div>

            <a
                href="/coordinador/avances"
                class="btn btn-primary btn-sm d-flex align-items-center gap-2"
            >
                <i class="bi bi-eye"></i>
                Ver todos los avances
            </a>
        </div>

        {#if cargando}
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>

                <p class="text-muted mt-2 mb-0">
                    Cargando avances...
                </p>
            </div>

        {:else if totalRegistros === 0}
            <div class="alert alert-info mb-0">
                <i class="bi bi-info-circle me-2"></i>
                No hay avances registrados para tu carrera.
            </div>

        {:else}

            <!-- SELECTOR DE REGISTROS -->

            <div class="d-flex justify-content-end align-items-center gap-2 mb-3">

                <label
                    for="registrosPorPagina"
                    class="small text-muted"
                >
                    Mostrar
                </label>

                <select
                    id="registrosPorPagina"
                    class="form-select form-select-sm selector-registros"
                    value={registrosPorPagina}
                    onchange={cambiarRegistrosPorPagina}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                </select>

                <span class="small text-muted">
                    registros
                </span>
            </div>

            <!-- TABLA -->

            <div class="table-responsive">
                <table class="table table-hover align-middle datatable">

                    <thead class="table-light">
                        <tr>
                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('trabajo')}
                                >
                                    Trabajo de grado
                                    <i class="bi {iconoOrden('trabajo')}"></i>
                                </button>
                            </th>

                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('descripcion')}
                                >
                                    Descripción
                                    <i class="bi {iconoOrden('descripcion')}"></i>
                                </button>
                            </th>

                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('fecha_entrega')}
                                >
                                    Fecha de entrega
                                    <i class="bi {iconoOrden('fecha_entrega')}"></i>
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each avancesPaginados as item, i (item.id_avance ?? `${item.id_trabajo_grado}-${i}`)}
                            <tr>
                                <td class="titulo-celda fw-semibold">
                                    {nombreTrabajo(item.id_trabajo_grado)}
                                </td>

                                <td class="descripcion-celda">
                                    {item.descripcion || item.titulo || 'Sin descripción'}
                                </td>

                                <td class="text-nowrap">
                                    {formatearFecha(item.fecha_entrega)}
                                </td>
                            </tr>
                        {/each}
                    </tbody>

                </table>
            </div>

            <!-- INFORMACIÓN Y PAGINACIÓN -->

            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">

                <div class="small text-muted">
                    Mostrando
                    <strong>{inicioRegistro}</strong>
                    a
                    <strong>{finRegistro}</strong>
                    de
                    <strong>{totalRegistros}</strong>
                    registros
                </div>

                <nav aria-label="Paginación de avances">
                    <ul class="pagination pagination-sm mb-0">

                        <li
                            class:disabled={paginaActual === 1}
                            class="page-item"
                        >
                            <button
                                type="button"
                                class="page-link"
                                disabled={paginaActual === 1}
                                onclick={() => irPagina(paginaActual - 1)}
                                aria-label="Página anterior"
                            >
                                <i class="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {#each paginasVisibles as pagina}
                            <li
                                class:active={paginaActual === pagina}
                                class="page-item"
                            >
                                <button
                                    type="button"
                                    class="page-link"
                                    aria-current={paginaActual === pagina ? 'page' : undefined}
                                    onclick={() => irPagina(pagina)}
                                >
                                    {pagina}
                                </button>
                            </li>
                        {/each}

                        <li
                            class:disabled={paginaActual === totalPaginas}
                            class="page-item"
                        >
                            <button
                                type="button"
                                class="page-link"
                                disabled={paginaActual === totalPaginas}
                                onclick={() => irPagina(paginaActual + 1)}
                                aria-label="Página siguiente"
                            >
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </li>

                    </ul>
                </nav>

            </div>
        {/if}
    </div>
</section>

<style>
    .datatable {
        min-width: 650px;
        margin-bottom: 0;
    }

    .datatable thead th {
        white-space: nowrap;
        font-size: 0.875rem;
        color: #495057;
        padding: 14px 12px;
    }

    .datatable tbody td {
        padding: 13px 12px;
        font-size: 0.9rem;
    }

    .titulo-celda {
        min-width: 220px;
        max-width: 300px;
        overflow-wrap: break-word;
    }

    .descripcion-celda {
        min-width: 200px;
        max-width: 400px;
        overflow-wrap: break-word;
    }

    .btn-orden {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        font-weight: 600;
        cursor: pointer;
    }

    .btn-orden:hover {
        color: var(--bs-primary);
    }

    .btn-orden i {
        color: #6c757d;
        font-size: 0.85rem;
    }

    .selector-registros {
        width: 75px;
    }

    .pagination .page-link {
        cursor: pointer;
    }

    .pagination .page-item.disabled .page-link {
        cursor: not-allowed;
    }
</style>
