
<script>
    import { onMount } from 'svelte';
    import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';

    import {
        getEvaluaciones,
        getTrabajos,
        getUsuarios,
        getAvances,
        crearEvaluacion,
        editarEvaluacion,
        eliminarEvaluacion
    } from '$lib/api.js';

    let evaluaciones = $state([]);
    let trabajos = $state([]);
    let usuarios = $state([]);
    let avances = $state([]);

    let cargando = $state(true);
    let guardando = $state(false);
    let error = $state('');
    let mensaje = $state('');

    let filtroVeredicto = $state('');
    let filtroPeriodo = $state('');

    let modalAbierto = $state(false);
    let modoEdicion = $state(false);
    let evaluacionSeleccionada = $state(null);

    let formulario = $state({
        id_trabajo_grado: '',
        id_avance: '',
        id_usuario: '',
        nota: '',
        veredicto: '',
        observaciones: '',
        fecha_evaluacion: new Date().toISOString().slice(0, 10),
        estado: true
    });

    const columnas = [
        {
            data: 'trabajoHtml',
            title: 'Trabajo de grado'
        },
        {
            data: 'fechaHtml',
            title: 'Fecha de evaluación'
        },
        {
            data: 'notaHtml',
            title: 'Nota'
        },
        {
            data: 'veredictoHtml',
            title: 'Veredicto'
        },
        {
            data: 'accionesHtml',
            title: 'Acciones',
            orderable: false,
            searchable: false
        }
    ];

    function obtenerLista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.data)) return respuesta.data;
        if (Array.isArray(respuesta?.items)) return respuesta.items;
        return [];
    }

    function escaparHtml(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, (caracter) => {
            const entidades = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return entidades[caracter];
        });
    }

    function obtenerNombreTrabajo(idTrabajo) {
        const trabajo = trabajos.find(
            (t) => Number(t.id_trabajo_grado) === Number(idTrabajo)
        );

        return trabajo?.titulo ?? 'Trabajo no encontrado';
    }

    function clasificarVeredicto(veredicto) {
        const valor = String(veredicto ?? '').trim().toLowerCase();

        if (!valor) return 'pendiente';

        if (
            valor.includes('no aprobado')
            || valor.includes('reprob')
            || valor.includes('rechaz')
        ) {
            return 'reprobado';
        }

        if (valor.includes('aprob')) return 'aprobado';

        return 'otros';
    }

    function mostrarVeredicto(veredicto) {
        const valor = String(veredicto ?? '').trim();

        if (!valor) return 'Pendiente';

        return valor.charAt(0).toUpperCase() + valor.slice(1);
    }

    function claseBadgeEstado(estado) {
        if (estado === 'aprobado') return 'bg-success';
        if (estado === 'reprobado') return 'bg-danger';
        if (estado === 'pendiente') return 'bg-warning text-dark';

        return 'bg-secondary';
    }

    function construirResultados() {
        return evaluaciones.map((evaluacion) => {
            const estado = clasificarVeredicto(evaluacion.veredicto);
            const id = evaluacion.id_evaluacion;

            const trabajo = obtenerNombreTrabajo(
                evaluacion.id_trabajo_grado
            );

            const fecha = evaluacion.fecha_evaluacion
                ? String(evaluacion.fecha_evaluacion).slice(0, 10)
                : '';

            const nota = evaluacion.nota ?? '—';
            const veredicto = mostrarVeredicto(evaluacion.veredicto);

            return {
                id,
                fecha,
                estado,

                trabajoHtml: escaparHtml(trabajo),
                fechaHtml: escaparHtml(fecha || '—'),
                notaHtml: escaparHtml(nota),

                veredictoHtml: `
                    <span class="badge ${claseBadgeEstado(estado)}">
                        ${escaparHtml(veredicto)}
                    </span>
                `,

                accionesHtml: `
                    <div class="d-flex gap-2">
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            data-accion="editar"
                            data-id="${escaparHtml(id)}"
                            title="Editar evaluación"
                            aria-label="Editar evaluación"
                        >
                            <i class="bi bi-pencil-square"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-accion="eliminar"
                            data-id="${escaparHtml(id)}"
                            title="Eliminar evaluación"
                            aria-label="Eliminar evaluación"
                        >
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `
            };
        });
    }

    let resultadosSustentacion = $derived(construirResultados());

    let periodos = $derived(
        [
            ...new Set(
                resultadosSustentacion
                    .map((resultado) => resultado.fecha?.slice(0, 4))
                    .filter(Boolean)
            )
        ].sort((a, b) => b.localeCompare(a))
    );

    let resultadosFiltrados = $derived(
        resultadosSustentacion.filter((resultado) => {
            const evaluacion = evaluaciones.find(
                (e) => Number(e.id_evaluacion) === Number(resultado.id)
            );

            const coincideVeredicto =
                filtroVeredicto === ''
                || resultado.estado === filtroVeredicto;

            const coincidePeriodo =
                filtroPeriodo === ''
                || resultado.fecha.startsWith(filtroPeriodo);

            return coincideVeredicto && coincidePeriodo && evaluacion;
        })
    );

    let avancesDelTrabajo = $derived(
        avances.filter(
            (avance) =>
                Number(avance.id_trabajo_grado) ===
                Number(formulario.id_trabajo_grado)
        )
    );

    async function cargarDatos() {
        cargando = true;
        error = '';

        try {
            const [
                respuestaEvaluaciones,
                respuestaTrabajos,
                respuestaUsuarios,
                respuestaAvances
            ] = await Promise.all([
                getEvaluaciones(),
                getTrabajos(),
                getUsuarios(),
                getAvances()
            ]);

            evaluaciones = obtenerLista(respuestaEvaluaciones);
            trabajos = obtenerLista(respuestaTrabajos);
            usuarios = obtenerLista(respuestaUsuarios);
            avances = obtenerLista(respuestaAvances);

        } catch (e) {
            console.error('Error al cargar las evaluaciones:', e);

            error = 'No fue posible cargar las evaluaciones. Verifica que el backend esté funcionando.';
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        cargarDatos();
    });

    function abrirCrear() {
        modoEdicion = false;
        evaluacionSeleccionada = null;
        error = '';
        mensaje = '';

        formulario = {
            id_trabajo_grado: '',
            id_avance: '',
            id_usuario: '',
            nota: '',
            veredicto: '',
            observaciones: '',
            fecha_evaluacion: new Date().toISOString().slice(0, 10),
            estado: true
        };

        modalAbierto = true;
    }

    function abrirEditar(evaluacion) {
        modoEdicion = true;
        evaluacionSeleccionada = evaluacion;
        error = '';
        mensaje = '';

        formulario = {
            id_trabajo_grado: String(evaluacion.id_trabajo_grado ?? ''),
            id_avance: String(evaluacion.id_avance ?? ''),
            id_usuario: String(evaluacion.id_usuario ?? ''),
            nota: String(evaluacion.nota ?? ''),
            veredicto: evaluacion.veredicto ?? '',
            observaciones: evaluacion.observaciones ?? '',
            fecha_evaluacion: evaluacion.fecha_evaluacion
                ? String(evaluacion.fecha_evaluacion).slice(0, 10)
                : '',
            estado: evaluacion.estado ?? true
        };

        modalAbierto = true;
    }

    function manejarAccion(accion, id) {
        const original = evaluaciones.find(
            (e) => Number(e.id_evaluacion) === Number(id)
        );

        if (!original) return;

        if (accion === 'editar') {
            abrirEditar(original);
        }

        if (accion === 'eliminar') {
            eliminarRegistro(original);
        }
    }

    function cambiarTrabajo() {
        formulario.id_avance = '';
    }

    function cerrarModal() {
        if (guardando) return;

        modalAbierto = false;
    }

    async function guardarEvaluacion(evento) {
        evento.preventDefault();

        error = '';
        mensaje = '';

        if (
            !formulario.id_trabajo_grado
            || !formulario.id_avance
            || !formulario.id_usuario
            || formulario.nota === ''
            || !formulario.fecha_evaluacion
            || !formulario.veredicto.trim()
        ) {
            error = 'Completa todos los campos obligatorios antes de guardar.';
            return;
        }

        const nota = Number(formulario.nota);

        if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
            error = 'La nota debe ser un número entre 0 y 5.';
            return;
        }

        const payload = {
            id_trabajo_grado: Number(formulario.id_trabajo_grado),
            id_avance: Number(formulario.id_avance),
            nota,
            veredicto: formulario.veredicto.trim(),
            observaciones: formulario.observaciones.trim() || null,
            fecha_evaluacion: formulario.fecha_evaluacion,
            estado: formulario.estado
        };

        guardando = true;

        try {
            if (modoEdicion) {
                await editarEvaluacion(
                    evaluacionSeleccionada.id_evaluacion,
                    payload
                );

                mensaje = 'Evaluación actualizada correctamente.';
            } else {
                await crearEvaluacion(payload);

                mensaje = 'Evaluación creada correctamente.';
            }

            modalAbierto = false;

            await cargarDatos();

        } catch (e) {
            console.error('Error al guardar la evaluación:', e);

            error = e.message || 'No fue posible guardar la evaluación.';
        } finally {
            guardando = false;
        }
    }

    async function eliminarRegistro(evaluacion) {
        const confirmar = window.confirm(
            `¿Deseas eliminar la evaluación #${evaluacion.id_evaluacion}?`
        );

        if (!confirmar) return;

        error = '';
        mensaje = '';

        try {
            await eliminarEvaluacion(evaluacion.id_evaluacion);

            mensaje = 'Evaluación eliminada correctamente.';

            await cargarDatos();

        } catch (e) {
            console.error('Error al eliminar la evaluación:', e);

            error = e.message || 'No fue posible eliminar la evaluación.';
        }
    }
</script>

<section class="card mb-4">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h6 class="fw-bold mb-0">
                Filtros
            </h6>

            <button
                type="button"
                class="btn btn-primary"
                onclick={abrirCrear}
            >
                <i class="bi bi-plus-circle me-1"></i>
                Nueva evaluación
            </button>
        </div>

        <div class="row g-3">
            <div class="col-md-6">
                <label class="form-label small" for="filtroVeredicto">
                    Veredicto
                </label>

                <select
                    id="filtroVeredicto"
                    class="form-select"
                    bind:value={filtroVeredicto}
                >
                    <option value="">Todos</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="reprobado">Reprobado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="otros">Otros veredictos</option>
                </select>
            </div>

            <div class="col-md-6">
                <label class="form-label small" for="filtroPeriodo">
                    Año de evaluación
                </label>

                <select
                    id="filtroPeriodo"
                    class="form-select"
                    bind:value={filtroPeriodo}
                >
                    <option value="">Todos los años</option>

                    {#each periodos as periodo}
                        <option value={periodo}>{periodo}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
</section>

{#if mensaje}
    <div class="alert alert-success alert-dismissible" role="status">
        {mensaje}

        <button
            type="button"
            class="btn-close"
            aria-label="Cerrar"
            onclick={() => mensaje = ''}
        ></button>
    </div>
{/if}

{#if error && !modalAbierto}
    <div class="alert alert-danger" role="alert">
        {error}
    </div>
{/if}

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">
            Resultados de evaluaciones de trabajos de grado
        </h6>

        {#if cargando}
            <div class="text-center py-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>

                <p class="text-muted mt-2">Cargando evaluaciones...</p>
            </div>
        {:else if error && evaluaciones.length === 0}
            <div class="alert alert-danger" role="alert">
                {error}
            </div>
        {:else}
            <p class="text-muted small">
                Evaluaciones encontradas: {resultadosFiltrados.length}
            </p>

            <DataTableWrapper
                {columnas}
                filas={resultadosFiltrados}
                onAccion={manejarAccion}
            />
        {/if}
    </div>
</section>

{#if modalAbierto}
    <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <form onsubmit={guardarEvaluacion}>
                    <div class="modal-header">
                        <h5 class="modal-title">
                            {modoEdicion ? 'Editar evaluación' : 'Nueva evaluación'}
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            aria-label="Cerrar"
                            disabled={guardando}
                            onclick={cerrarModal}
                        ></button>
                    </div>

                    <div class="modal-body">
                        {#if error}
                            <div class="alert alert-danger" role="alert">
                                {error}
                            </div>
                        {/if}

                        <div class="row g-3">
                            <div class="col-md-12">
                                <label class="form-label" for="trabajo">
                                    Trabajo de grado *
                                </label>

                                <select
                                    id="trabajo"
                                    class="form-select"
                                    bind:value={formulario.id_trabajo_grado}
                                    onchange={cambiarTrabajo}
                                    required
                                >
                                    <option value="">Selecciona un trabajo</option>

                                    {#each trabajos as trabajo}
                                        <option value={String(trabajo.id_trabajo_grado)}>
                                            {trabajo.titulo}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <div class="col-md-12">
                                <label class="form-label" for="avance">
                                    Avance que se va a evaluar *
                                </label>

                                <select
                                    id="avance"
                                    class="form-select"
                                    bind:value={formulario.id_avance}
                                    required
                                    disabled={!formulario.id_trabajo_grado}
                                >
                                    <option value="">Selecciona un avance</option>

                                    {#each avancesDelTrabajo as avance}
                                        <option value={String(avance.id_avance)}>
                                            {avance.titulo ?? `Avance #${avance.id_avance}`}
                                        </option>
                                    {/each}
                                </select>

                                {#if formulario.id_trabajo_grado && avancesDelTrabajo.length === 0}
                                    <small class="text-danger">
                                        Este trabajo no tiene avances registrados.
                                    </small>
                                {/if}
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="evaluador">
                                    Evaluador *
                                </label>

                                <select
                                    id="evaluador"
                                    class="form-select"
                                    bind:value={formulario.id_usuario}
                                    required
                                >
                                    <option value="">Selecciona un evaluador</option>

                                    {#each usuarios as usuario}
                                        <option value={String(usuario.id_user)}>
                                            {`${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim() || usuario.username}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="nota">
                                    Nota (0 a 5) *
                                </label>

                                <input
                                    id="nota"
                                    class="form-control"
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.01"
                                    bind:value={formulario.nota}
                                    required
                                />
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="fecha">
                                    Fecha de evaluación *
                                </label>

                                <input
                                    id="fecha"
                                    class="form-control"
                                    type="date"
                                    bind:value={formulario.fecha_evaluacion}
                                    required
                                />
                            </div>

                            <div class="col-md-6">
                                <label class="form-label" for="veredicto">
                                    Veredicto *
                                </label>

                                <select
                                    id="veredicto"
                                    class="form-select"
                                    bind:value={formulario.veredicto}
                                    required
                                >
                                    <option value="">Selecciona un veredicto</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Reprobado">Reprobado</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label" for="observaciones">
                                    Observaciones
                                </label>

                                <textarea
                                    id="observaciones"
                                    class="form-control"
                                    rows="3"
                                    bind:value={formulario.observaciones}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            disabled={guardando}
                            onclick={cerrarModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                            disabled={guardando || avancesDelTrabajo.length === 0}
                        >
                            {#if guardando}
                                <span class="spinner-border spinner-border-sm me-1"></span>
                                Guardando...
                            {:else}
                                {modoEdicion ? 'Guardar cambios' : 'Crear evaluación'}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="modal-backdrop show"></div>
{/if}
