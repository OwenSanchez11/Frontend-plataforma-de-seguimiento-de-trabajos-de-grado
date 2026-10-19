
<script>
    import { onMount } from 'svelte';
    import {
        getTrabajos,
        getUsuarios,
        getEquiposTrabajo,
        crearEquipoTrabajo,
        editarEquipoTrabajo,
        eliminarEquipoTrabajo
    } from '$lib/api.js';

    const ROL_PROFESOR_PROYECTO = '14';
    const ROL_ESTUDIANTE_PROYECTO = '15';

    let trabajos = $state([]);
    let usuarios = $state([]);
    let equiposTrabajo = $state([]);

    let trabajoSeleccionadoId = $state('');

    let profesoresSeleccionados = $state([]);
    let estudiantesSeleccionados = $state([]);

    let busquedaProfesor = $state('');
    let busquedaEstudiante = $state('');

    let cargando = $state(true);
    let guardando = $state(false);
    let error = $state('');
    let mensaje = $state('');

    let asignacionEditando = $state(null);
    let observacionesEdit = $state('');
    let fechaFinalizacionEdit = $state('');
    let errorEdicion = $state('');

    function obtenerLista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.data)) return respuesta.data;
        if (Array.isArray(respuesta?.items)) return respuesta.items;
        return [];
    }

    function nombreCompleto(usuario) {
        return `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim();
    }

    function estaActivo(registro) {
        return registro?.estado === true ||
            registro?.estado === 1 ||
            registro?.estado === 'true';
    }

    function obtenerUsuario(idUsuario) {
        return usuarios.find(
            usuario => Number(usuario.id_user) === Number(idUsuario)
        );
    }

    function obtenerTrabajo(idTrabajo) {
        return trabajos.find(
            trabajo =>
                Number(trabajo.id_trabajo_grado) === Number(idTrabajo)
        );
    }

    let trabajoActual = $derived(
        obtenerTrabajo(trabajoSeleccionadoId)
    );

    // En tu sistema los usuarios con rol 3 y 4 son los docentes
    // que ya se utilizaban en el módulo anterior.
    let profesoresDisponibles = $derived(
        usuarios
            .filter(usuario =>
                estaActivo(usuario) &&
                [3, 4].includes(Number(usuario.id_rol))
            )
            .sort((a, b) =>
                nombreCompleto(a).localeCompare(nombreCompleto(b), 'es')
            )
    );

    let estudiantesDisponibles = $derived(
        usuarios
            .filter(usuario =>
                estaActivo(usuario) &&
                Number(usuario.id_rol) === 5
            )
            .sort((a, b) =>
                nombreCompleto(a).localeCompare(nombreCompleto(b), 'es')
            )
    );

    let profesoresFiltrados = $derived(
        profesoresDisponibles.filter(usuario =>
            nombreCompleto(usuario)
                .toLowerCase()
                .includes(busquedaProfesor.toLowerCase())
        )
    );

    let estudiantesFiltrados = $derived(
        estudiantesDisponibles.filter(usuario =>
            nombreCompleto(usuario)
                .toLowerCase()
                .includes(busquedaEstudiante.toLowerCase())
        )
    );

    let asignacionesTrabajo = $derived(
        equiposTrabajo.filter(equipo =>
            Number(equipo.id_trabajo_grado) ===
                Number(trabajoSeleccionadoId) &&
            estaActivo(equipo) &&
            ['14', '15'].includes(String(equipo.id_rol))
        )
    );

    let profesoresAsignados = $derived(
        asignacionesTrabajo
            .filter(equipo =>
                String(equipo.id_rol) === ROL_PROFESOR_PROYECTO
            )
            .sort((a, b) => {
                const numeroA = Number(
                    String(a.observaciones ?? '').match(/\d+/)?.[0] ?? 0
                );
                const numeroB = Number(
                    String(b.observaciones ?? '').match(/\d+/)?.[0] ?? 0
                );

                return numeroA - numeroB ||
                    Number(a.id_equipo) - Number(b.id_equipo);
            })
    );

    let estudiantesAsignados = $derived(
        asignacionesTrabajo.filter(equipo =>
            String(equipo.id_rol) === ROL_ESTUDIANTE_PROYECTO
        )
    );

    let equipoVisible = $derived([
        ...profesoresAsignados.map((equipo, indice) => ({
            ...equipo,
            tipo: equipo.observaciones || `Profesor ${indice + 1}`,
            persona: obtenerUsuario(equipo.id_usuario)
        })),
        ...estudiantesAsignados.map(equipo => ({
            ...equipo,
            tipo: 'Estudiante',
            persona: obtenerUsuario(equipo.id_usuario)
        }))
    ]);

    let totalProfesores = $derived(profesoresSeleccionados.length);
    let totalEstudiantes = $derived(estudiantesSeleccionados.length);

    function sincronizarSeleccion() {
        const asignaciones = equiposTrabajo.filter(equipo =>
            Number(equipo.id_trabajo_grado) ===
                Number(trabajoSeleccionadoId) &&
            estaActivo(equipo)
        );

        profesoresSeleccionados = asignaciones
            .filter(equipo =>
                String(equipo.id_rol) === ROL_PROFESOR_PROYECTO
            )
            .sort((a, b) => {
                const numeroA = Number(
                    String(a.observaciones ?? '').match(/\d+/)?.[0] ?? 0
                );
                const numeroB = Number(
                    String(b.observaciones ?? '').match(/\d+/)?.[0] ?? 0
                );
                return numeroA - numeroB ||
                    Number(a.id_equipo) - Number(b.id_equipo);
            })
            .map(equipo => String(equipo.id_usuario));

        estudiantesSeleccionados = asignaciones
            .filter(equipo =>
                String(equipo.id_rol) === ROL_ESTUDIANTE_PROYECTO
            )
            .map(equipo => String(equipo.id_usuario));

        busquedaProfesor = '';
        busquedaEstudiante = '';
    }

    function seleccionarTrabajo(valor) {
        trabajoSeleccionadoId = valor;
        mensaje = '';
        error = '';
        sincronizarSeleccion();
    }

    function alternarProfesor(idUsuario) {
        const id = String(idUsuario);

        if (profesoresSeleccionados.includes(id)) {
            profesoresSeleccionados =
                profesoresSeleccionados.filter(item => item !== id);
        } else {
            profesoresSeleccionados = [
                ...profesoresSeleccionados,
                id
            ];
        }
    }

    function alternarEstudiante(idUsuario) {
        const id = String(idUsuario);

        if (estudiantesSeleccionados.includes(id)) {
            estudiantesSeleccionados =
                estudiantesSeleccionados.filter(item => item !== id);
        } else {
            estudiantesSeleccionados = [
                ...estudiantesSeleccionados,
                id
            ];
        }
    }

    function quitarProfesor(idUsuario) {
        profesoresSeleccionados =
            profesoresSeleccionados.filter(
                id => id !== String(idUsuario)
            );
    }

    function quitarEstudiante(idUsuario) {
        estudiantesSeleccionados =
            estudiantesSeleccionados.filter(
                id => id !== String(idUsuario)
            );
    }

    async function cargarDatos() {
        cargando = true;
        error = '';

        try {
            const [
                respuestaTrabajos,
                respuestaUsuarios,
                respuestaEquipos
            ] = await Promise.all([
                getTrabajos(),
                getUsuarios(),
                getEquiposTrabajo()
            ]);

            trabajos = obtenerLista(respuestaTrabajos);
            usuarios = obtenerLista(respuestaUsuarios);
            equiposTrabajo = obtenerLista(respuestaEquipos);

            if (
                !trabajoSeleccionadoId ||
                !trabajos.some(t =>
                    String(t.id_trabajo_grado) ===
                    String(trabajoSeleccionadoId)
                )
            ) {
                trabajoSeleccionadoId = String(
                    trabajos[0]?.id_trabajo_grado ?? ''
                );
            }

            sincronizarSeleccion();

        } catch (e) {
            console.error('Error al cargar asignaciones:', e);
            error = e.message ||
                'No fue posible cargar los trabajos y las asignaciones.';
        } finally {
            cargando = false;
        }
    }

    onMount(cargarDatos);

    async function guardarAsignaciones() {
        error = '';
        mensaje = '';

        if (!trabajoSeleccionadoId) {
            error = 'Debes seleccionar un trabajo de grado.';
            return;
        }

        if (profesoresSeleccionados.length === 0) {
            error = 'Debes asignar al menos un profesor.';
            return;
        }

        if (estudiantesSeleccionados.length === 0) {
            error = 'Debes asignar al menos un estudiante.';
            return;
        }

        const todasLasPersonas = [
            ...profesoresSeleccionados,
            ...estudiantesSeleccionados
        ];

        if (new Set(todasLasPersonas).size !== todasLasPersonas.length) {
            error = 'Una misma persona no puede tener dos asignaciones en este trabajo.';
            return;
        }

        guardando = true;

        try {
            const existentes = equiposTrabajo.filter(equipo =>
                Number(equipo.id_trabajo_grado) ===
                    Number(trabajoSeleccionadoId) &&
                estaActivo(equipo) &&
                ['14', '15'].includes(String(equipo.id_rol))
            );

            const profesoresActuales = existentes.filter(equipo =>
                String(equipo.id_rol) === ROL_PROFESOR_PROYECTO
            );

            const estudiantesActuales = existentes.filter(equipo =>
                String(equipo.id_rol) === ROL_ESTUDIANTE_PROYECTO
            );

            // Eliminar profesores que se quitaron del formulario.
            for (const equipo of profesoresActuales) {
                if (
                    !profesoresSeleccionados.includes(
                        String(equipo.id_usuario)
                    )
                ) {
                    await eliminarEquipoTrabajo(equipo.id_equipo);
                }
            }

            // Eliminar estudiantes que se quitaron del formulario.
            for (const equipo of estudiantesActuales) {
                if (
                    !estudiantesSeleccionados.includes(
                        String(equipo.id_usuario)
                    )
                ) {
                    await eliminarEquipoTrabajo(equipo.id_equipo);
                }
            }

            // Crear o actualizar profesores.
            for (let i = 0; i < profesoresSeleccionados.length; i++) {
                const idUsuario = profesoresSeleccionados[i];

                const existente = profesoresActuales.find(equipo =>
                    Number(equipo.id_usuario) === Number(idUsuario)
                );

                const payload = {
                    id_trabajo_grado: Number(trabajoSeleccionadoId),
                    id_usuario: Number(idUsuario),
                    id_rol: ROL_PROFESOR_PROYECTO,
                    observaciones: `Profesor ${i + 1}`,
                    fecha_asignacion:
                        existente?.fecha_asignacion ?? null,
                    fecha_finalizacion:
                        existente?.fecha_finalizacion ?? null,
                    estado: true
                };

                if (existente) {
                    if (
                        existente.observaciones !== payload.observaciones
                    ) {
                        await editarEquipoTrabajo(
                            existente.id_equipo,
                            {
                                ...payload,
                                id_equipo: existente.id_equipo
                            }
                        );
                    }
                } else {
                    await crearEquipoTrabajo(payload);
                }
            }

            // Crear estudiantes que todavía no estén asignados.
            for (const idUsuario of estudiantesSeleccionados) {
                const existente = estudiantesActuales.find(equipo =>
                    Number(equipo.id_usuario) === Number(idUsuario)
                );

                if (!existente) {
                    await crearEquipoTrabajo({
                        id_trabajo_grado: Number(trabajoSeleccionadoId),
                        id_usuario: Number(idUsuario),
                        id_rol: ROL_ESTUDIANTE_PROYECTO,
                        observaciones: 'Estudiante',
                        estado: true
                    });
                }
            }

            mensaje = 'El equipo de trabajo se guardó correctamente.';

            await cargarDatos();

        } catch (e) {
            console.error('Error al guardar el equipo:', e);
            error = e.message ||
                'No fue posible guardar el equipo de trabajo.';
        } finally {
            guardando = false;
        }
    }

    async function eliminarAsignacion(idEquipo) {
        const confirmar = window.confirm(
            '¿Deseas eliminar esta persona del equipo de trabajo?'
        );

        if (!confirmar) return;

        error = '';
        mensaje = '';

        try {
            await eliminarEquipoTrabajo(idEquipo);
            mensaje = 'La asignación se eliminó correctamente.';
            await cargarDatos();
        } catch (e) {
            console.error(e);
            error = e.message || 'No fue posible eliminar la asignación.';
        }
    }

    function abrirEditarAsignacion(equipo) {
        asignacionEditando = equipo;
        observacionesEdit = equipo.observaciones ?? '';
        fechaFinalizacionEdit = equipo.fecha_finalizacion
            ? String(equipo.fecha_finalizacion).slice(0, 10)
            : '';
        errorEdicion = '';
    }

    function cerrarEditarAsignacion() {
        if (guardando) return;

        asignacionEditando = null;
        observacionesEdit = '';
        fechaFinalizacionEdit = '';
        errorEdicion = '';
    }

    async function guardarEdicion() {
        if (!asignacionEditando || guardando) return;

        guardando = true;
        errorEdicion = '';

        try {
            await editarEquipoTrabajo(
                asignacionEditando.id_equipo,
                {
                    id_equipo: Number(asignacionEditando.id_equipo),
                    id_trabajo_grado: Number(
                        asignacionEditando.id_trabajo_grado
                    ),
                    id_usuario: Number(asignacionEditando.id_usuario),
                    id_rol: String(asignacionEditando.id_rol),
                    observaciones: observacionesEdit.trim() || null,
                    fecha_asignacion:
                        asignacionEditando.fecha_asignacion ?? null,
                    fecha_finalizacion:
                        fechaFinalizacionEdit || null,
                    estado: asignacionEditando.estado ?? true
                }
            );

            asignacionEditando = null;
            mensaje = 'La asignación se actualizó correctamente.';

            await cargarDatos();

        } catch (e) {
            console.error(e);
            errorEdicion = e.message ||
                'No fue posible actualizar la asignación.';
        } finally {
            guardando = false;
        }
    }

    function nombreRol(equipo) {
        return String(equipo.id_rol) === ROL_PROFESOR_PROYECTO
            ? 'Profesor'
            : 'Estudiante';
    }
</script>

{#if cargando}
    <div class="alert alert-info">
        Cargando trabajos, profesores y estudiantes...
    </div>
{:else}
    {#if error}
        <div class="alert alert-danger" role="alert">
            {error}
            <button
                type="button"
                class="btn btn-sm btn-outline-danger ms-2"
                onclick={cargarDatos}
                disabled={guardando}
            >
                Reintentar
            </button>
        </div>
    {/if}

    {#if mensaje}
        <div class="alert alert-success" role="status">
            {mensaje}
        </div>
    {/if}

    <section class="card mb-4">
        <div class="card-body">
            <h5 class="fw-bold mb-3">
                <i class="bi bi-folder2-open me-2"></i>
                Asignación de trabajo de grado
            </h5>

            <label for="trabajoSeleccionado" class="form-label">
                Seleccionar trabajo de grado
            </label>

            <select
                id="trabajoSeleccionado"
                class="form-select"
                value={trabajoSeleccionadoId}
                onchange={event =>
                    seleccionarTrabajo(event.currentTarget.value)}
                disabled={guardando}
            >
                <option value="">Selecciona un trabajo</option>

                {#each trabajos as trabajo (trabajo.id_trabajo_grado)}
                    <option value={String(trabajo.id_trabajo_grado)}>
                        {trabajo.titulo}
                    </option>
                {/each}
            </select>

            {#if trabajoActual}
                <div class="mt-3 p-3 bg-light rounded">
                    <p class="mb-1">
                        <strong>Título:</strong>
                        {trabajoActual.titulo}
                    </p>
                    <p class="mb-0">
                        <strong>ID del trabajo:</strong>
                        {trabajoActual.id_trabajo_grado}
                    </p>
                </div>
            {:else}
                <p class="text-muted mt-3">
                    No hay trabajos de grado disponibles.
                </p>
            {/if}
        </div>
    </section>

    {#if trabajoActual}
        <section class="card mb-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h5 class="fw-bold mb-0">
                        <i class="bi bi-person-badge me-2"></i>
                        Profesores
                    </h5>
                    <span class="badge bg-primary">
                        {totalProfesores} seleccionados
                    </span>
                </div>

                <label for="buscarProfesor" class="form-label">
                    Buscar profesor
                </label>

                <input
                    id="buscarProfesor"
                    type="text"
                    class="form-control mb-3"
                    placeholder="Escribe el nombre del profesor..."
                    bind:value={busquedaProfesor}
                    disabled={guardando}
                />

                <div class="lista-personas">
                    {#each profesoresFiltrados as profesor (profesor.id_user)}
                        <label class="persona-opcion">
                            <input
                                type="checkbox"
                                class="form-check-input"
                                checked={profesoresSeleccionados.includes(String(profesor.id_user))}
                                onchange={() => alternarProfesor(profesor.id_user)}
                                disabled={guardando}
                            />

                            <span>
                                <strong>{nombreCompleto(profesor)}</strong>
                                <small>{profesor.email ?? 'Sin correo registrado'}</small>
                            </span>
                        </label>
                    {:else}
                        <p class="text-muted p-3 mb-0">
                            No se encontraron profesores.
                        </p>
                    {/each}
                </div>

                <div class="mt-3">
                    <strong>Profesores seleccionados:</strong>

                    {#if profesoresSeleccionados.length > 0}
                        <div class="d-flex flex-wrap gap-2 mt-2">
                            {#each profesoresSeleccionados as id, i (id)}
                                <span class="badge bg-primary p-2">
                                    Profesor {i + 1}:
                                    {nombreCompleto(obtenerUsuario(id))}

                                    <button
                                        type="button"
                                        class="btn-close btn-close-white ms-2"
                                        aria-label="Quitar profesor"
                                        onclick={() => quitarProfesor(id)}
                                        disabled={guardando}
                                    ></button>
                                </span>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-muted mt-2">
                            Todavía no has seleccionado profesores.
                        </p>
                    {/if}
                </div>
            </div>
        </section>

        <section class="card mb-4">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h5 class="fw-bold mb-0">
                        <i class="bi bi-people me-2"></i>
                        Estudiantes
                    </h5>
                    <span class="badge bg-success">
                        {totalEstudiantes} seleccionados
                    </span>
                </div>

                <label for="buscarEstudiante" class="form-label">
                    Buscar estudiante
                </label>

                <input
                    id="buscarEstudiante"
                    type="text"
                    class="form-control mb-3"
                    placeholder="Escribe el nombre del estudiante..."
                    bind:value={busquedaEstudiante}
                    disabled={guardando}
                />

                <div class="lista-personas">
                    {#each estudiantesFiltrados as estudiante (estudiante.id_user)}
                        <label class="persona-opcion">
                            <input
                                type="checkbox"
                                class="form-check-input"
                                checked={estudiantesSeleccionados.includes(String(estudiante.id_user))}
                                onchange={() => alternarEstudiante(estudiante.id_user)}
                                disabled={guardando}
                            />

                            <span>
                                <strong>{nombreCompleto(estudiante)}</strong>
                                <small>{estudiante.email ?? 'Sin correo registrado'}</small>
                            </span>
                        </label>
                    {:else}
                        <p class="text-muted p-3 mb-0">
                            No se encontraron estudiantes.
                        </p>
                    {/each}
                </div>

                <div class="mt-3">
                    <strong>Estudiantes seleccionados:</strong>

                    {#if estudiantesSeleccionados.length > 0}
                        <div class="d-flex flex-wrap gap-2 mt-2">
                            {#each estudiantesSeleccionados as id (id)}
                                <span class="badge bg-success p-2">
                                    {nombreCompleto(obtenerUsuario(id))}

                                    <button
                                        type="button"
                                        class="btn-close btn-close-white ms-2"
                                        aria-label="Quitar estudiante"
                                        onclick={() => quitarEstudiante(id)}
                                        disabled={guardando}
                                    ></button>
                                </span>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-danger mt-2">
                            Debes seleccionar al menos un estudiante.
                        </p>
                    {/if}
                </div>
            </div>
        </section>

        <div class="d-flex justify-content-end mb-4">
            <button
                type="button"
                class="btn btn-primary btn-lg"
                onclick={guardarAsignaciones}
                disabled={
                    guardando ||
                    !trabajoSeleccionadoId ||
                    profesoresSeleccionados.length === 0 ||
                    estudiantesSeleccionados.length === 0
                }
            >
                {#if guardando}
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Guardando equipo...
                {:else}
                    <i class="bi bi-save me-2"></i>
                    Guardar equipo de trabajo
                {/if}
            </button>
        </div>

        <section class="card mb-4">
            <div class="card-body">
                <h5 class="fw-bold mb-3">
                    <i class="bi bi-clipboard-check me-2"></i>
                    Integrantes asignados
                </h5>

                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo de integrante</th>
                                <th>Observaciones</th>
                                <th>Fecha de asignación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#each equipoVisible as equipo (equipo.id_equipo)}
                                <tr>
                                    <td>
                                        {equipo.persona
                                            ? nombreCompleto(equipo.persona)
                                            : `Usuario #${equipo.id_usuario}`}
                                    </td>
                                    <td>
                                        {#if String(equipo.id_rol) === ROL_PROFESOR_PROYECTO}
                                            <span class="badge bg-primary">
                                                Profesor
                                            </span>
                                        {:else}
                                            <span class="badge bg-success">
                                                Estudiante
                                            </span>
                                        {/if}
                                    </td>
                                    <td>{equipo.observaciones ?? 'Sin observaciones'}</td>
                                    <td>
                                        {equipo.fecha_asignacion
                                            ? String(equipo.fecha_asignacion).slice(0, 10)
                                            : 'Sin fecha'}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            class="btn btn-sm btn-outline-primary me-1"
                                            title="Editar"
                                            onclick={() => abrirEditarAsignacion(equipo)}
                                            disabled={guardando}
                                        >
                                            <i class="bi bi-pencil"></i>
                                        </button>

                                        <button
                                            type="button"
                                            class="btn btn-sm btn-outline-danger"
                                            title="Eliminar"
                                            onclick={() => eliminarAsignacion(equipo.id_equipo)}
                                            disabled={guardando}
                                        >
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            {:else}
                                <tr>
                                    <td colspan="5" class="text-center text-muted">
                                        Este trabajo todavía no tiene integrantes asignados.
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    {/if}
{/if}

{#if asignacionEditando}
    <div class="modal-backdrop-custom">
        <div
            class="modal-content-custom"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloEditar"
        >
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 id="tituloEditar" class="fw-bold mb-0">
                    Editar asignación
                </h5>

                <button
                    type="button"
                    class="btn-close"
                    aria-label="Cerrar"
                    onclick={cerrarEditarAsignacion}
                    disabled={guardando}
                ></button>
            </div>

            <p>
                <strong>Integrante:</strong>
                {nombreCompleto(obtenerUsuario(asignacionEditando.id_usuario))}
            </p>

            <p>
                <strong>Rol:</strong>
                {nombreRol(asignacionEditando)}
            </p>

            <label for="observacionesEdit" class="form-label">
                Observaciones
            </label>

            <input
                id="observacionesEdit"
                class="form-control"
                bind:value={observacionesEdit}
                disabled={guardando}
            />

            <div class="mt-3">
                <label for="fechaFinalizacionEdit" class="form-label">
                    Fecha de finalización
                </label>

                <input
                    id="fechaFinalizacionEdit"
                    type="date"
                    class="form-control"
                    bind:value={fechaFinalizacionEdit}
                    disabled={guardando}
                />
            </div>

            {#if errorEdicion}
                <div class="alert alert-danger mt-3">
                    {errorEdicion}
                </div>
            {/if}

            <div class="d-flex justify-content-end gap-2 mt-4">
                <button
                    type="button"
                    class="btn btn-light"
                    onclick={cerrarEditarAsignacion}
                    disabled={guardando}
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick={guardarEdicion}
                    disabled={guardando}
                >
                    {#if guardando}
                        Guardando...
                    {:else}
                        Guardar cambios
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .lista-personas {
        max-height: 280px;
        overflow-y: auto;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
    }

    .persona-opcion {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .persona-opcion:last-child {
        border-bottom: none;
    }

    .persona-opcion:hover {
        background: #f5f7fa;
    }

    .persona-opcion span {
        display: flex;
        flex-direction: column;
    }

    .persona-opcion small {
        color: #6c757d;
    }

    .persona-opcion input {
        flex-shrink: 0;
    }

    .modal-backdrop-custom {
        position: fixed;
        inset: 0;
        z-index: 1050;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background: rgb(0 0 0 / 50%);
    }

    .modal-content-custom {
        width: min(100%, 32rem);
        padding: 1.5rem;
        border-radius: 1rem;
        background: white;
        box-shadow: 0 1rem 3rem rgb(0 0 0 / 20%);
    }
</style>
