
<script>
    import { onMount } from 'svelte';
    import {
        getTrabajos,
        getCarreras,
        crearTrabajoGrado,
        actualizarTrabajoGrado,
        eliminarTrabajoGrado
    } from '$lib/api';

    // ==========================================
    // FILTROS
    // ==========================================

    let filtroBusqueda = $state('');
    let filtroEstado = $state('');
    let filtroPrograma = $state('');

    // ==========================================
    // DATOS
    // ==========================================

    let trabajosGrado = $state([]);
    let carreras = $state([]);

    let cargando = $state(true);
    let error = $state('');
    let mensaje = $state('');
    let guardando = $state(false);

    // ==========================================
    // CONFIGURACIÓN DATATABLE
    // ==========================================

    let paginaActual = $state(1);
    let registrosPorPagina = $state(10);

    let columnaOrden = $state('titulo');
    let direccionOrden = $state('asc');

    // ==========================================
    // FORMULARIO CRUD
    // ==========================================

    let mostrarFormulario = $state(false);
    let modoEdicion = $state(false);
    let trabajoIdEditar = $state(null);

    let formulario = $state({
        id_carrera: '',
        titulo: '',
        resumen: '',
        linea_investigacion: '',
        estado_tramite: 'En desarrollo',
        fecha_inicio: '',
        fecha_fin: '',
        fecha_sustentacion: '',
        observaciones_finales: '',
        estado: true
    });

    onMount(() => {
        cargarDatos();
    });

    // ==========================================
    // CARGAR INFORMACIÓN
    // ==========================================

    async function cargarDatos() {
        cargando = true;
        error = '';

        try {
            const [respuestaTrabajos, respuestaCarreras] =
                await Promise.all([
                    getTrabajos(),
                    getCarreras()
                ]);

            trabajosGrado = Array.isArray(respuestaTrabajos)
                ? respuestaTrabajos
                : [];

            carreras = Array.isArray(respuestaCarreras)
                ? respuestaCarreras
                : [];

            paginaActual = 1;

        } catch (e) {
            console.error('Error al cargar trabajos de grado:', e);
            error = 'No fue posible cargar los trabajos de grado.';
        } finally {
            cargando = false;
        }
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    function nombreCarrera(idCarrera) {
        const carrera = carreras.find(
            (c) => Number(c.id_carrera) === Number(idCarrera)
        );

        return carrera?.nombre_carrera ?? `Carrera ${idCarrera}`;
    }

    function normalizarFecha(fecha) {
        if (!fecha) return '';

        return String(fecha).slice(0, 10);
    }

    // ==========================================
    // FILTRADO DE REGISTROS
    // ==========================================

    let trabajosFiltrados = $derived(
        trabajosGrado.filter((trabajo) => {
            const estado = (
                trabajo.estado_tramite ?? ''
            ).toLowerCase();

            const titulo = (
                trabajo.titulo ?? ''
            ).toLowerCase();

            const busqueda = filtroBusqueda.trim().toLowerCase();

            const coincideBusqueda = titulo.includes(busqueda);

            const coincideEstado =
                !filtroEstado || estado === filtroEstado;

            const coincidePrograma =
                !filtroPrograma ||
                String(trabajo.id_carrera) === filtroPrograma;

            return (
                coincideBusqueda &&
                coincideEstado &&
                coincidePrograma
            );
        })
    );

    // ==========================================
    // ORDENAMIENTO DE COLUMNAS
    // ==========================================

    function obtenerValorOrden(trabajo, columna) {
        switch (columna) {
            case 'titulo':
                return trabajo.titulo ?? '';

            case 'carrera':
                return nombreCarrera(trabajo.id_carrera);

            case 'estado_tramite':
                return trabajo.estado_tramite ?? '';

            case 'fecha_inicio':
                return trabajo.fecha_inicio ?? '';

            default:
                return '';
        }
    }

    let trabajosOrdenados = $derived(
        [...trabajosFiltrados].sort((a, b) => {
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
    // PAGINACIÓN
    // ==========================================

    let totalRegistros = $derived(
        trabajosOrdenados.length
    );

    let totalPaginas = $derived(
        Math.max(1, Math.ceil(totalRegistros / registrosPorPagina))
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

    let trabajosPaginados = $derived(
        trabajosOrdenados.slice(
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

    // Reiniciar la paginación cuando cambien los filtros.
    $effect(() => {
        filtroBusqueda;
        filtroEstado;
        filtroPrograma;

        paginaActual = 1;
    });

    // ==========================================
    // CREAR TRABAJO
    // ==========================================

    function abrirCrear() {
        modoEdicion = false;
        trabajoIdEditar = null;

        formulario = {
            id_carrera: '',
            titulo: '',
            resumen: '',
            linea_investigacion: '',
            estado_tramite: 'En desarrollo',
            fecha_inicio: '',
            fecha_fin: '',
            fecha_sustentacion: '',
            observaciones_finales: '',
            estado: true
        };

        error = '';
        mensaje = '';
        mostrarFormulario = true;
    }

    // ==========================================
    // EDITAR TRABAJO
    // ==========================================

    function abrirEditar(trabajo) {
        modoEdicion = true;
        trabajoIdEditar = trabajo.id_trabajo_grado;

        formulario = {
            id_carrera: String(trabajo.id_carrera ?? ''),
            titulo: trabajo.titulo ?? '',
            resumen: trabajo.resumen ?? '',
            linea_investigacion:
                trabajo.linea_investigacion ?? '',
            estado_tramite:
                trabajo.estado_tramite ?? 'En desarrollo',
            fecha_inicio: normalizarFecha(trabajo.fecha_inicio),
            fecha_fin: normalizarFecha(trabajo.fecha_fin),
            fecha_sustentacion:
                normalizarFecha(trabajo.fecha_sustentacion),
            observaciones_finales:
                trabajo.observaciones_finales ?? '',
            estado: trabajo.estado ?? true
        };

        error = '';
        mensaje = '';
        mostrarFormulario = true;
    }

    // ==========================================
    // CERRAR FORMULARIO
    // ==========================================

    function cerrarFormulario() {
        if (guardando) return;

        mostrarFormulario = false;
        error = '';
    }

    // ==========================================
    // GUARDAR TRABAJO
    // ==========================================

    async function guardarTrabajo() {
        mensaje = '';
        error = '';

        if (
            !formulario.id_carrera ||
            !formulario.titulo.trim() ||
            !formulario.estado_tramite
        ) {
            error =
                'Completa la carrera, el título y el estado del trámite.';
            return;
        }

        const datos = {
            id_carrera: Number(formulario.id_carrera),
            titulo: formulario.titulo.trim(),
            resumen: formulario.resumen.trim() || null,
            linea_investigacion:
                formulario.linea_investigacion.trim() || null,
            estado_tramite: formulario.estado_tramite,
            fecha_inicio: formulario.fecha_inicio || null,
            fecha_fin: formulario.fecha_fin || null,
            fecha_sustentacion:
                formulario.fecha_sustentacion || null,
            observaciones_finales:
                formulario.observaciones_finales.trim() || null,
            estado: formulario.estado
        };

        guardando = true;

        try {
            if (modoEdicion) {
                await actualizarTrabajoGrado(
                    trabajoIdEditar,
                    datos
                );

                mensaje =
                    'Trabajo de grado actualizado correctamente.';
            } else {
                await crearTrabajoGrado(datos);

                mensaje =
                    'Trabajo de grado creado correctamente.';
            }

            mostrarFormulario = false;

            await cargarDatos();

        } catch (e) {
            console.error(
                'Error al guardar trabajo de grado:',
                e
            );

            error = e?.message ||
                'No fue posible guardar el trabajo de grado.';
        } finally {
            guardando = false;
        }
    }

    // ==========================================
    // ELIMINAR TRABAJO
    // ==========================================

    async function eliminarTrabajo(trabajo) {
        const confirmar = window.confirm(
            `¿Seguro que deseas eliminar el trabajo "${trabajo.titulo}"?`
        );

        if (!confirmar) return;

        error = '';
        mensaje = '';

        try {
            await eliminarTrabajoGrado(
                trabajo.id_trabajo_grado
            );

            mensaje =
                'Trabajo de grado eliminado correctamente.';

            await cargarDatos();

        } catch (e) {
            console.error(
                'Error al eliminar trabajo de grado:',
                e
            );

            error = e?.message ||
                'No fue posible eliminar el trabajo de grado.';
        }
    }
</script>

<!-- ==========================================
     ENCABEZADO
========================================== -->

<div class="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
    <h4 class="fw-bold mb-0">Trabajos de Grado</h4>

    <button
        type="button"
        class="btn btn-primary"
        onclick={abrirCrear}
    >
        <i class="bi bi-plus-circle me-1"></i>
        Nuevo trabajo
    </button>
</div>

<!-- ==========================================
     MENSAJES
========================================== -->

{#if mensaje}
    <div class="alert alert-success alert-dismissible" role="status">
        {mensaje}

        <button
            type="button"
            class="btn-close"
            aria-label="Cerrar mensaje"
            onclick={() => mensaje = ''}
        ></button>
    </div>
{/if}

{#if error && !mostrarFormulario}
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
     FILTROS
========================================== -->

<section class="card mb-4 shadow-sm">
    <div class="card-body">
        <h6 class="fw-bold mb-3">
            <i class="bi bi-funnel me-1"></i>
            Filtros
        </h6>

        <div class="row g-3">
            <div class="col-md-4">
                <label class="form-label small" for="filtroBusqueda">
                    Buscar trabajo
                </label>

                <input
                    id="filtroBusqueda"
                    type="text"
                    class="form-control"
                    placeholder="Buscar por título..."
                    bind:value={filtroBusqueda}
                />
            </div>

            <div class="col-md-4">
                <label class="form-label small" for="filtroEstado">
                    Estado
                </label>

                <select
                    id="filtroEstado"
                    class="form-select"
                    bind:value={filtroEstado}
                >
                    <option value="">Todos</option>

                    {#each [...new Set(
                        trabajosGrado
                            .map((t) => t.estado_tramite)
                            .filter(Boolean)
                    )] as estado}
                        <option value={estado.toLowerCase()}>
                            {estado}
                        </option>
                    {/each}
                </select>
            </div>

            <div class="col-md-4">
                <label class="form-label small" for="filtroPrograma">
                    Carrera
                </label>

                <select
                    id="filtroPrograma"
                    class="form-select"
                    bind:value={filtroPrograma}
                >
                    <option value="">Todas las carreras</option>

                    {#each carreras as carrera}
                        <option value={String(carrera.id_carrera)}>
                            {carrera.nombre_carrera}
                        </option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
</section>

<!-- ==========================================
     DATATABLE
========================================== -->

<section class="card mb-4 shadow-sm">
    <div class="card-body">

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
                <h6 class="fw-bold mb-1">
                    Listado de trabajos de grado
                </h6>

                <small class="text-muted">
                    Trabajos de grado de todas las carreras
                </small>
            </div>

            <div class="d-flex align-items-center gap-2">
                <label for="registrosPorPagina" class="small text-muted">
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
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>

                <span class="small text-muted">registros</span>
            </div>
        </div>

        {#if cargando}
            <div class="text-center py-5">
                <div
                    class="spinner-border text-primary"
                    role="status"
                >
                    <span class="visually-hidden">Cargando...</span>
                </div>

                <p class="text-muted mt-2 mb-0">
                    Cargando trabajos de grado...
                </p>
            </div>

        {:else if totalRegistros === 0}
            <div class="alert alert-info mb-0" role="status">
                <i class="bi bi-info-circle me-2"></i>
                No hay trabajos de grado para los filtros seleccionados.
            </div>

        {:else}

            <div class="table-responsive">
                <table class="table table-hover align-middle datatable">
                    <thead class="table-light">
                        <tr>
                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('titulo')}
                                >
                                    Título
                                    <i class="bi {iconoOrden('titulo')}"></i>
                                </button>
                            </th>

                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('carrera')}
                                >
                                    Carrera
                                    <i class="bi {iconoOrden('carrera')}"></i>
                                </button>
                            </th>

                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('estado_tramite')}
                                >
                                    Estado del trámite
                                    <i class="bi {iconoOrden('estado_tramite')}"></i>
                                </button>
                            </th>

                            <th>
                                <button
                                    type="button"
                                    class="btn-orden"
                                    onclick={() => ordenarPor('fecha_inicio')}
                                >
                                    Fecha de inicio
                                    <i class="bi {iconoOrden('fecha_inicio')}"></i>
                                </button>
                            </th>

                            <th class="text-end">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each trabajosPaginados as trabajo (trabajo.id_trabajo_grado)}
                            <tr>
                                <td class="titulo-celda">
                                    {trabajo.titulo}
                                </td>

                                <td>
                                    {nombreCarrera(trabajo.id_carrera)}
                                </td>

                                <td>
                                    <span class="badge bg-secondary">
                                        {trabajo.estado_tramite ?? 'Sin estado'}
                                    </span>
                                </td>

                                <td>
                                    {normalizarFecha(trabajo.fecha_inicio) || 'Sin fecha'}
                                </td>

                                <td class="text-end text-nowrap">
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-primary me-1"
                                        aria-label="Editar trabajo"
                                        title="Editar"
                                        onclick={() => abrirEditar(trabajo)}
                                    >
                                        <i class="bi bi-pencil-square"></i>
                                    </button>

                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-danger"
                                        aria-label="Eliminar trabajo"
                                        title="Eliminar"
                                        onclick={() => eliminarTrabajo(trabajo)}
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- INFORMACIÓN DE REGISTROS -->

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

                <!-- PAGINACIÓN -->

                <nav aria-label="Paginación de trabajos de grado">
                    <ul class="pagination pagination-sm mb-0">

                        <li class:disabled={paginaActual === 1} class="page-item">
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

                        <li class:disabled={paginaActual === totalPaginas} class="page-item">
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

<!-- ==========================================
     MODAL CREAR / EDITAR
========================================== -->

{#if mostrarFormulario}
    <div
        class="modal d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tituloModalTrabajo"
        style="background-color: rgba(0, 0, 0, 0.5);"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">

                <form
                    class="modal-form"
                    onsubmit={(event) => {
                        event.preventDefault();
                        guardarTrabajo();
                    }}
                >
                    <div class="modal-header">
                        <h5
                            class="modal-title fw-bold"
                            id="tituloModalTrabajo"
                        >
                            {modoEdicion
                                ? 'Editar trabajo de grado'
                                : 'Nuevo trabajo de grado'}
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            aria-label="Cerrar"
                            disabled={guardando}
                            onclick={cerrarFormulario}
                        ></button>
                    </div>

                    <div class="modal-body">

                        {#if error}
                            <div class="alert alert-danger" role="alert">
                                {error}
                            </div>
                        {/if}

                        <div class="row g-3">

                            <div class="col-md-6">
                                <label
                                    class="form-label"
                                    for="carreraTrabajo"
                                >
                                    Carrera *
                                </label>

                                <select
                                    id="carreraTrabajo"
                                    class="form-select"
                                    bind:value={formulario.id_carrera}
                                    required
                                >
                                    <option value="">
                                        Selecciona una carrera
                                    </option>

                                    {#each carreras as carrera}
                                        <option value={String(carrera.id_carrera)}>
                                            {carrera.nombre_carrera}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label
                                    class="form-label"
                                    for="estadoTramite"
                                >
                                    Estado del trámite *
                                </label>

                                <select
                                    id="estadoTramite"
                                    class="form-select"
                                    bind:value={formulario.estado_tramite}
                                    required
                                >
                                    <option value="En desarrollo">
                                        En desarrollo
                                    </option>

                                    <option value="En revisión">
                                        En revisión
                                    </option>

                                    <option value="Aprobado">
                                        Aprobado
                                    </option>

                                    <option value="Rechazado">
                                        Rechazado
                                    </option>

                                    <option value="Finalizado">
                                        Finalizado
                                    </option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label
                                    class="form-label"
                                    for="tituloTrabajo"
                                >
                                    Título *
                                </label>

                                <input
                                    id="tituloTrabajo"
                                    class="form-control"
                                    type="text"
                                    bind:value={formulario.titulo}
                                    maxlength="250"
                                    required
                                />
                            </div>

                            <div class="col-12">
                                <label
                                    class="form-label"
                                    for="resumenTrabajo"
                                >
                                    Resumen
                                </label>

                                <textarea
                                    id="resumenTrabajo"
                                    class="form-control"
                                    rows="3"
                                    bind:value={formulario.resumen}
                                ></textarea>
                            </div>

                            <div class="col-12">
                                <label
                                    class="form-label"
                                    for="lineaInvestigacion"
                                >
                                    Línea de investigación
                                </label>

                                <input
                                    id="lineaInvestigacion"
                                    class="form-control"
                                    type="text"
                                    bind:value={formulario.linea_investigacion}
                                />
                            </div>

                            <div class="col-md-4">
                                <label
                                    class="form-label"
                                    for="fechaInicio"
                                >
                                    Fecha de inicio
                                </label>

                                <input
                                    id="fechaInicio"
                                    class="form-control"
                                    type="date"
                                    bind:value={formulario.fecha_inicio}
                                />
                            </div>

                            <div class="col-md-4">
                                <label
                                    class="form-label"
                                    for="fechaFin"
                                >
                                    Fecha de finalización
                                </label>

                                <input
                                    id="fechaFin"
                                    class="form-control"
                                    type="date"
                                    bind:value={formulario.fecha_fin}
                                />
                            </div>

                            <div class="col-md-4">
                                <label
                                    class="form-label"
                                    for="fechaSustentacion"
                                >
                                    Fecha de sustentación
                                </label>

                                <input
                                    id="fechaSustentacion"
                                    class="form-control"
                                    type="date"
                                    bind:value={formulario.fecha_sustentacion}
                                />
                            </div>

                            <div class="col-12">
                                <label
                                    class="form-label"
                                    for="observacionesFinales"
                                >
                                    Observaciones finales
                                </label>

                                <textarea
                                    id="observacionesFinales"
                                    class="form-control"
                                    rows="3"
                                    bind:value={formulario.observaciones_finales}
                                ></textarea>
                            </div>

                            <div class="col-12">
                                <div class="form-check">
                                    <input
                                        id="trabajoActivo"
                                        class="form-check-input"
                                        type="checkbox"
                                        bind:checked={formulario.estado}
                                    />

                                    <label
                                        class="form-check-label"
                                        for="trabajoActivo"
                                    >
                                        Trabajo de grado activo
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            disabled={guardando}
                            onclick={cerrarFormulario}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={guardando}
                        >
                            {#if guardando}
                                <span
                                    class="spinner-border spinner-border-sm me-1"
                                    aria-hidden="true"
                                ></span>
                                Guardando...
                            {:else}
                                {modoEdicion
                                    ? 'Guardar cambios'
                                    : 'Crear trabajo'}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}

<!-- ==========================================
     ESTILOS
========================================== -->

<style>
    .datatable {
        min-width: 750px;
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
        max-width: 350px;
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

    .modal-form {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
    }

    .modal-form .modal-header,
    .modal-form .modal-footer {
        flex-shrink: 0;
    }

    .modal-form .modal-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
    }
</style>
