
<script>
    import { onMount } from 'svelte';
    import {
        getTrabajos,
        getCarreras,
        crearTrabajoGrado,
        actualizarTrabajoGrado,
        eliminarTrabajoGrado
    } from '$lib/api';

    let filtroEstado = $state('');
    let filtroPrograma = $state('');

    let trabajosGrado = $state([]);
    let carreras = $state([]);
    let cargando = $state(true);
    let error = $state('');
    let mensaje = $state('');
    let guardando = $state(false);

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
        } catch (e) {
            console.error('Error al cargar trabajos de grado:', e);
            error = 'No fue posible cargar los trabajos de grado.';
        } finally {
            cargando = false;
        }
    }

    function nombreCarrera(idCarrera) {
        const carrera = carreras.find(
            (c) => Number(c.id_carrera) === Number(idCarrera)
        );

        return carrera?.nombre_carrera ?? `Carrera ${idCarrera}`;
    }

    let trabajosFiltrados = $derived(
        trabajosGrado.filter((trabajo) => {
            const estado = (
                trabajo.estado_tramite ?? ''
            ).toLowerCase();

            const coincideEstado =
                !filtroEstado || estado === filtroEstado;

            const coincidePrograma =
                !filtroPrograma ||
                String(trabajo.id_carrera) === filtroPrograma;

            return coincideEstado && coincidePrograma;
        })
    );

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

        mensaje = '';
        mostrarFormulario = true;
    }

    function abrirEditar(trabajo) {
        modoEdicion = true;
        trabajoIdEditar = trabajo.id_trabajo_grado;

        formulario = {
            id_carrera: String(trabajo.id_carrera ?? ''),
            titulo: trabajo.titulo ?? '',
            resumen: trabajo.resumen ?? '',
            linea_investigacion: trabajo.linea_investigacion ?? '',
            estado_tramite: trabajo.estado_tramite ?? 'En desarrollo',
            fecha_inicio: normalizarFecha(trabajo.fecha_inicio),
            fecha_fin: normalizarFecha(trabajo.fecha_fin),
            fecha_sustentacion: normalizarFecha(
                trabajo.fecha_sustentacion
            ),
            observaciones_finales: trabajo.observaciones_finales ?? '',
            estado: trabajo.estado ?? true
        };

        mensaje = '';
        mostrarFormulario = true;
    }

    function normalizarFecha(fecha) {
        if (!fecha) return '';

        return String(fecha).slice(0, 10);
    }

    function cerrarFormulario() {
        if (guardando) return;
        mostrarFormulario = false;
    }

    async function guardarTrabajo() {
        mensaje = '';
        error = '';

        if (
            !formulario.id_carrera ||
            !formulario.titulo.trim() ||
            !formulario.estado_tramite
        ) {
            error = 'Completa la carrera, el título y el estado del trámite.';
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
            fecha_sustentacion: formulario.fecha_sustentacion || null,
            observaciones_finales:
                formulario.observaciones_finales.trim() || null,
            estado: formulario.estado
        };

        guardando = true;

        try {
            if (modoEdicion) {
                await actualizarTrabajoGrado(trabajoIdEditar, datos);
                mensaje = 'Trabajo de grado actualizado correctamente.';
            } else {
                await crearTrabajoGrado(datos);
                mensaje = 'Trabajo de grado creado correctamente.';
            }

            mostrarFormulario = false;
            await cargarDatos();
        } catch (e) {
            console.error('Error al guardar trabajo de grado:', e);
            error = e?.message ||
                'No fue posible guardar el trabajo de grado.';
        } finally {
            guardando = false;
        }
    }

    async function eliminarTrabajo(trabajo) {
        const confirmar = window.confirm(
            `¿Seguro que deseas eliminar el trabajo "${trabajo.titulo}"?`
        );

        if (!confirmar) return;

        error = '';
        mensaje = '';

        try {
            await eliminarTrabajoGrado(trabajo.id_trabajo_grado);
            mensaje = 'Trabajo de grado eliminado correctamente.';
            await cargarDatos();
        } catch (e) {
            console.error('Error al eliminar trabajo de grado:', e);
            error = e?.message ||
                'No fue posible eliminar el trabajo de grado.';
        }
    }
</script>

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

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Filtros</h6>

        <div class="row g-3">
            <div class="col-md-6">
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

            <div class="col-md-6">
                <label class="form-label small" for="filtroPrograma">
                    Programa
                </label>

                <select
                    id="filtroPrograma"
                    class="form-select"
                    bind:value={filtroPrograma}
                >
                    <option value="">Todos</option>

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

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">
            Listado de trabajos de grado de su carrera
        </h6>

        {#if cargando}
            <p class="text-muted">Cargando trabajos de grado...</p>
        {:else if trabajosFiltrados.length === 0}
            <div class="alert alert-info" role="status">
                No hay trabajos de grado para los filtros seleccionados.
            </div>
        {:else}
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Programa</th>
                            <th>Estado del trámite</th>
                            <th>Fecha de inicio</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each trabajosFiltrados as trabajo (trabajo.id_trabajo_grado)}
                            <tr>
                                <td>{trabajo.titulo}</td>

                                <td>
                                    {nombreCarrera(trabajo.id_carrera)}
                                </td>

                                <td>
                                    <span class="badge bg-secondary">
                                        {trabajo.estado_tramite ?? 'Sin estado'}
                                    </span>
                                </td>

                                <td>
                                    {trabajo.fecha_inicio ?? 'Sin fecha'}
                                </td>

                                <td class="text-end">
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
        {/if}
    </div>
</section>

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
                <form onsubmit={(event) => {
                    event.preventDefault();
                    guardarTrabajo();
                }}>
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" id="tituloModalTrabajo">
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
                                <label class="form-label" for="carreraTrabajo">
                                    Carrera *
                                </label>

                                <select
                                    id="carreraTrabajo"
                                    class="form-select"
                                    bind:value={formulario.id_carrera}
                                    required
                                >
                                    <option value="">Selecciona una carrera</option>

                                    {#each carreras as carrera}
                                        <option value={String(carrera.id_carrera)}>
                                            {carrera.nombre_carrera}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="estadoTramite">
                                    Estado del trámite *
                                </label>

                                <select
                                    id="estadoTramite"
                                    class="form-select"
                                    bind:value={formulario.estado_tramite}
                                    required
                                >
                                    <option value="En desarrollo">En desarrollo</option>
                                    <option value="En revisión">En revisión</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                    <option value="Finalizado">Finalizado</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label" for="tituloTrabajo">
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
                                <label class="form-label" for="resumenTrabajo">
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
                                <label class="form-label" for="lineaInvestigacion">
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
                                <label class="form-label" for="fechaInicio">
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
                                <label class="form-label" for="fechaFin">
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
                                <label class="form-label" for="fechaSustentacion">
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
                                <label class="form-label" for="observacionesFinales">
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

                                    <label class="form-check-label" for="trabajoActivo">
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
                                Guardando...
                            {:else}
                                {modoEdicion ? 'Guardar cambios' : 'Crear trabajo'}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}
