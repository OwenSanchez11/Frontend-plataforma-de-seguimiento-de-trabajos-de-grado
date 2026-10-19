<script>
    import { onMount } from 'svelte';
    import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';

    import {
        getAvances,
        getTrabajos,
        getUsuarios,
        crearAvance,
        editarAvance,
        eliminarAvance
    } from '$lib/api.js';

    // FILTROS
    let filtroTrabajo = $state('');
    let filtroEstudiante = $state('');
    let filtroFase = $state('');

    // DATOS
    let historialAvance = $state([]);
    let trabajos = $state([]);
    let usuarios = $state([]);

    // MODALES
    let avanceSeleccionado = $state(null);
    let avanceEdicion = $state(null);
    let modalFormulario = $state(false);

    // ESTADOS
    let cargando = $state(true);
    let guardando = $state(false);
    let errorCarga = $state('');
    let mensaje = $state('');

    // VALORES PERMITIDOS POR NEON
    const dictamenesPermitidos = [
        'en progreso',
        'en revisión',
        'aprobado',
        'no aprobado'
    ];

    // FORMULARIO
    let formulario = $state({
        id_trabajo_grado: '',
        subido_por: '',
        titulo: '',
        descripcion: '',
        dictamen: '',
        fecha_entrega: new Date().toISOString().slice(0, 10),
        nombre_archivo: '',
        numero_version: 1,
        estado: true
    });

    // NORMALIZAR RESPUESTAS
    function obtenerLista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.data)) return respuesta.data;
        if (Array.isArray(respuesta?.items)) return respuesta.items;
        return [];
    }

    // OBTENER NOMBRE DEL USUARIO
    function obtenerNombreUsuario(idUsuario) {
        const usuario = usuarios.find(
            (item) => Number(item.id_user) === Number(idUsuario)
        );

        if (!usuario) {
            return `Usuario ${idUsuario ?? 'sin identificar'}`;
        }

        return `${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim()
            || usuario.username
            || `Usuario ${idUsuario}`;
    }

    // TRANSFORMAR DATOS
    function transformarAvance(avance) {
        const trabajo = trabajos.find(
            (item) =>
                Number(item.id_trabajo_grado) ===
                Number(avance.id_trabajo_grado)
        );

        return {
            ...avance,
            estudiante: obtenerNombreUsuario(avance.subido_por),
            trabajo: trabajo?.titulo ?? 'Trabajo no encontrado',
            fase: avance.dictamen || 'Sin especificar',
            descripcion: avance.descripcion || avance.titulo || 'Sin descripción',
            fecha: avance.fecha_entrega
                ? String(avance.fecha_entrega).slice(0, 10)
                : avance.fecha_inicio
                    ? String(avance.fecha_inicio).slice(0, 10)
                    : 'Sin fecha'
        };
    }

    // CARGAR INFORMACIÓN
    async function cargarDatos() {
        cargando = true;
        errorCarga = '';

        try {
            const [datosAvances, datosTrabajos, datosUsuarios] =
                await Promise.all([
                    getAvances(),
                    getTrabajos(),
                    getUsuarios()
                ]);

            trabajos = obtenerLista(datosTrabajos);
            usuarios = obtenerLista(datosUsuarios);

            historialAvance = obtenerLista(datosAvances).map(
                transformarAvance
            );

        } catch (error) {
            console.error('Error al cargar los avances:', error);
            errorCarga = error.message || 'No fue posible cargar los avances.';
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        cargarDatos();
    });

    // FILTROS DERIVADOS
    let trabajosFiltrados = $derived(
        trabajos.filter((trabajo) =>
            historialAvance.some(
                (avance) =>
                    Number(avance.id_trabajo_grado) ===
                    Number(trabajo.id_trabajo_grado)
            )
        )
    );

    let estudiantesFiltrados = $derived(
        [...new Set(historialAvance.map((avance) => avance.estudiante))]
    );

    let fasesFiltradas = $derived(
        [...new Set(historialAvance.map((avance) => avance.fase))]
    );

    let avancesFiltrados = $derived(
        historialAvance.filter((avance) =>
            (!filtroTrabajo ||
                String(avance.id_trabajo_grado) === filtroTrabajo) &&
            (!filtroEstudiante ||
                avance.estudiante === filtroEstudiante) &&
            (!filtroFase ||
                avance.fase === filtroFase)
        )
    );

    // ESCAPAR HTML
    function escaparHtml(valor) {
        return String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[caracter]);
    }

    // FILAS PARA DATATABLE
    let filasAvances = $derived(
        avancesFiltrados.map((avance) => ({
            ...avance,
            estudianteHtml: escaparHtml(avance.estudiante),
            trabajoHtml: escaparHtml(avance.trabajo),
            faseHtml: escaparHtml(avance.fase),
            descripcionHtml: escaparHtml(avance.descripcion),
            fechaHtml: escaparHtml(avance.fecha),

            accionesHtml: `
                <div class="d-flex gap-2">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-info"
                        title="Ver detalles"
                        data-accion="ver"
                        data-id="${avance.id_avance}">
                        <i class="bi bi-eye"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        title="Editar avance"
                        data-accion="editar"
                        data-id="${avance.id_avance}">
                        <i class="bi bi-pencil-square"></i>
                    </button>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        title="Eliminar avance"
                        data-accion="eliminar"
                        data-id="${avance.id_avance}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `
        }))
    );

    const columnasAvances = [
        { title: 'Estudiante', data: 'estudianteHtml' },
        { title: 'Trabajo de grado', data: 'trabajoHtml' },
        { title: 'Fase', data: 'faseHtml' },
        { title: 'Descripción', data: 'descripcionHtml' },
        { title: 'Fecha', data: 'fechaHtml' },
        {
            title: 'Acciones',
            data: 'accionesHtml',
            orderable: false,
            searchable: false
        }
    ];

    // ACCIONES DE DATATABLE
    function manejarAccionTabla(accion, id) {
        const avance = historialAvance.find(
            (item) => String(item.id_avance) === String(id)
        );

        if (!avance) return;

        if (accion === 'ver') {
            verDetalles(avance);
        }

        if (accion === 'editar') {
            abrirEditar(avance);
        }

        if (accion === 'eliminar') {
            eliminarRegistro(avance);
        }
    }

    // VER DETALLES
    function verDetalles(avance) {
        avanceSeleccionado = avance;
    }

    // ABRIR FORMULARIO PARA CREAR
    function abrirCrear() {
        avanceEdicion = null;
        errorCarga = '';
        mensaje = '';

        formulario = {
            id_trabajo_grado: '',
            subido_por: '',
            titulo: '',
            descripcion: '',
            dictamen: '',
            fecha_entrega: new Date().toISOString().slice(0, 10),
            nombre_archivo: '',
            numero_version: 1,
            estado: true
        };

        modalFormulario = true;
    }

    // ABRIR FORMULARIO PARA EDITAR
    function abrirEditar(avance) {
        avanceEdicion = avance;
        avanceSeleccionado = null;
        errorCarga = '';
        mensaje = '';

        formulario = {
            id_trabajo_grado: String(avance.id_trabajo_grado ?? ''),
            subido_por: String(avance.subido_por ?? ''),
            titulo: avance.titulo ?? '',
            descripcion: avance.descripcion ?? '',
            dictamen: avance.dictamen ?? '',
            fecha_entrega: avance.fecha_entrega
                ? String(avance.fecha_entrega).slice(0, 10)
                : avance.fecha_inicio
                    ? String(avance.fecha_inicio).slice(0, 10)
                    : '',
            nombre_archivo: avance.nombre_archivo ?? '',
            numero_version: avance.numero_version ?? 1,
            estado: avance.estado ?? true
        };

        modalFormulario = true;
    }

    // CERRAR FORMULARIO
    function cerrarFormulario() {
        if (guardando) return;
        modalFormulario = false;
    }

    // GUARDAR AVANCE
    async function guardarAvance(evento) {
        evento.preventDefault();

        errorCarga = '';
        mensaje = '';

        if (
            !formulario.id_trabajo_grado ||
            !formulario.subido_por ||
            !formulario.titulo.trim() ||
            !formulario.descripcion.trim() ||
            !formulario.fecha_entrega ||
            !dictamenesPermitidos.includes(formulario.dictamen)
        ) {
            errorCarga = 'Completa todos los campos obligatorios y selecciona un dictamen válido.';
            return;
        }

        const payload = {
            id_trabajo_grado: Number(formulario.id_trabajo_grado),
            subido_por: Number(formulario.subido_por),
            titulo: formulario.titulo.trim(),
            descripcion: formulario.descripcion.trim(),
            dictamen: formulario.dictamen,
            fecha_entrega: formulario.fecha_entrega,
            nombre_archivo: formulario.nombre_archivo.trim() || null,
            numero_version: Number(formulario.numero_version) || 1,
            estado: formulario.estado
        };

        guardando = true;

        try {
            if (avanceEdicion) {
                await editarAvance(avanceEdicion.id_avance, payload);
                mensaje = 'Avance actualizado correctamente.';
            } else {
                await crearAvance(payload);
                mensaje = 'Avance creado correctamente.';
            }

            modalFormulario = false;
            await cargarDatos();

        } catch (error) {
            console.error('Error al guardar el avance:', error);
            errorCarga = error.message || 'No fue posible guardar el avance.';
        } finally {
            guardando = false;
        }
    }

    // ELIMINAR AVANCE
    async function eliminarRegistro(avance) {
        const confirmar = window.confirm(
            `¿Deseas eliminar el avance "${avance.titulo || avance.descripcion}"?`
        );

        if (!confirmar) return;

        errorCarga = '';
        mensaje = '';

        try {
            await eliminarAvance(avance.id_avance);

            mensaje = 'Avance eliminado correctamente.';
            avanceSeleccionado = null;

            await cargarDatos();

        } catch (error) {
            console.error('Error al eliminar el avance:', error);
            errorCarga = error.message || 'No fue posible eliminar el avance.';
        }
    }
</script>

<!-- FILTROS -->
<section class="card mb-4">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h6 class="fw-bold mb-0">Filtros</h6>

            <button
                type="button"
                class="btn btn-primary"
                onclick={abrirCrear}
            >
                <i class="bi bi-plus-circle me-1"></i>
                Nuevo avance
            </button>
        </div>

        <div class="row g-3">
            <div class="col-md-4">
                <label for="filtro-trabajo" class="form-label small">
                    Trabajo de grado
                </label>

                <select
                    id="filtro-trabajo"
                    class="form-select"
                    bind:value={filtroTrabajo}
                >
                    <option value="">Todos</option>

                    {#each trabajosFiltrados as trabajo}
                        <option value={String(trabajo.id_trabajo_grado)}>
                            {trabajo.titulo}
                        </option>
                    {/each}
                </select>
            </div>

            <div class="col-md-4">
                <label for="filtro-estudiante" class="form-label small">
                    Estudiante
                </label>

                <select
                    id="filtro-estudiante"
                    class="form-select"
                    bind:value={filtroEstudiante}
                >
                    <option value="">Todos</option>

                    {#each estudiantesFiltrados as estudiante}
                        <option value={estudiante}>{estudiante}</option>
                    {/each}
                </select>
            </div>

            <div class="col-md-4">
                <label for="filtro-fase" class="form-label small">
                    Fase / dictamen
                </label>

                <select
                    id="filtro-fase"
                    class="form-select"
                    bind:value={filtroFase}
                >
                    <option value="">Todas</option>

                    {#each fasesFiltradas as fase}
                        <option value={fase}>{fase}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
</section>

<!-- MENSAJES -->
{#if mensaje}
    <div class="alert alert-success" role="status">
        {mensaje}
    </div>
{/if}

{#if errorCarga && !modalFormulario}
    <div class="alert alert-danger" role="alert">
        {errorCarga}
    </div>
{/if}

<!-- TABLA DE AVANCES -->
<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">
            Historial de avances y entregas de su carrera
        </h6>

        {#if cargando}
            <p class="text-muted mb-0">Cargando avances...</p>
        {:else}
            <div class="table-responsive">
                <DataTableWrapper
                    columnas={columnasAvances}
                    filas={filasAvances}
                    onAccion={manejarAccionTabla}
                />
            </div>
        {/if}
    </div>
</section>

<!-- MODAL VER DETALLES -->
{#if avanceSeleccionado}
    <div
        class="modal d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-avance"
        style="background: rgba(0, 0, 0, 0.5);"
    >
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="titulo-modal-avance">
                        Detalle del avance
                    </h5>

                    <button
                        type="button"
                        class="btn-close"
                        aria-label="Cerrar"
                        onclick={() => avanceSeleccionado = null}
                    ></button>
                </div>

                <div class="modal-body">
                    <p><strong>Estudiante:</strong> {avanceSeleccionado.estudiante}</p>
                    <p><strong>Trabajo de grado:</strong> {avanceSeleccionado.trabajo}</p>
                    <p><strong>Fase / dictamen:</strong> {avanceSeleccionado.fase}</p>
                    <p><strong>Descripción:</strong> {avanceSeleccionado.descripcion}</p>
                    <p><strong>Fecha:</strong> {avanceSeleccionado.fecha}</p>
                    <p><strong>Archivo:</strong> {avanceSeleccionado.nombre_archivo || 'Sin archivo registrado'}</p>
                    <p><strong>Versión:</strong> {avanceSeleccionado.numero_version ?? 'No especificada'}</p>
                </div>

                <div class="modal-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick={() => avanceSeleccionado = null}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- MODAL CREAR / EDITAR -->
{#if modalFormulario}
    <div
        class="modal d-block"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formulario-avance"
        style="background: rgba(0, 0, 0, 0.5);"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <form onsubmit={guardarAvance}>
                    <div class="modal-header">
                        <h5 class="modal-title" id="titulo-formulario-avance">
                            {avanceEdicion ? 'Editar avance' : 'Crear avance'}
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
                        {#if errorCarga}
                            <div class="alert alert-danger" role="alert">
                                {errorCarga}
                            </div>
                        {/if}

                        <div class="row g-3">
                            <div class="col-md-12">
                                <label for="trabajo-avance" class="form-label">
                                    Trabajo de grado *
                                </label>

                                <select
                                    id="trabajo-avance"
                                    class="form-select"
                                    bind:value={formulario.id_trabajo_grado}
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

                            <div class="col-md-6">
                                <label for="usuario-avance" class="form-label">
                                    Usuario que registra *
                                </label>

                                <select
                                    id="usuario-avance"
                                    class="form-select"
                                    bind:value={formulario.subido_por}
                                    required
                                >
                                    <option value="">Selecciona un usuario</option>

                                    {#each usuarios as usuario}
                                        <option value={String(usuario.id_user)}>
                                            {`${usuario.nombre ?? ''} ${usuario.apellido ?? ''}`.trim() || usuario.username}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label for="fecha-avance" class="form-label">
                                    Fecha de entrega *
                                </label>

                                <input
                                    id="fecha-avance"
                                    type="date"
                                    class="form-control"
                                    bind:value={formulario.fecha_entrega}
                                    required
                                />
                            </div>

                            <div class="col-12">
                                <label for="titulo-avance" class="form-label">
                                    Título *
                                </label>

                                <input
                                    id="titulo-avance"
                                    type="text"
                                    class="form-control"
                                    bind:value={formulario.titulo}
                                    required
                                />
                            </div>

                            <div class="col-12">
                                <label for="descripcion-avance" class="form-label">
                                    Descripción *
                                </label>

                                <textarea
                                    id="descripcion-avance"
                                    class="form-control"
                                    rows="3"
                                    bind:value={formulario.descripcion}
                                    required
                                ></textarea>
                            </div>

                            <div class="col-md-6">
                                <label for="fase-avance" class="form-label">
                                    Fase / dictamen *
                                </label>

                                <select
                                    id="fase-avance"
                                    class="form-select"
                                    bind:value={formulario.dictamen}
                                    required
                                >
                                    <option value="">Selecciona un dictamen</option>

                                    <option value="en progreso">En progreso</option>
                                    <option value="en revisión">En revisión</option>
                                    <option value="aprobado">Aprobado</option>
                                    <option value="no aprobado">No aprobado</option>
                                </select>
                            </div>

                            <div class="col-md-6">
                                <label for="archivo-avance" class="form-label">
                                    Nombre del archivo
                                </label>

                                <input
                                    id="archivo-avance"
                                    type="text"
                                    class="form-control"
                                    bind:value={formulario.nombre_archivo}
                                />
                            </div>

                            <div class="col-md-6">
                                <label for="version-avance" class="form-label">
                                    Número de versión
                                </label>

                                <input
                                    id="version-avance"
                                    type="number"
                                    min="1"
                                    class="form-control"
                                    bind:value={formulario.numero_version}
                                />
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
                                <span class="spinner-border spinner-border-sm me-1"></span>
                                Guardando...
                            {:else}
                                {avanceEdicion ? 'Guardar cambios' : 'Crear avance'}
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
{/if}