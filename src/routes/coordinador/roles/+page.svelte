<script>
    import { onMount } from 'svelte';
    import {
        getTrabajos,
        getUsuarios,
        getEquiposTrabajo,
        getRolesProyecto,
        crearEquipoTrabajo,
        editarEquipoTrabajo,
        eliminarEquipoTrabajo
    } from '$lib/api.js';

    let { trabajoSeleccionado: trabajoProp = null } = $props();

    let trabajos = $state([]);
    let usuarios = $state([]);
    let equiposTrabajo = $state([]);
    let rolesProyecto = $state([]);

    let trabajoSeleccionadoId = $state('');
    let cargando = $state(true);
    let guardando = $state(false);
    let error = $state('');
    let mensaje = $state('');

    let busquedaDirector = $state('');
    let busquedaJurado1 = $state('');
    let busquedaJurado2 = $state('');

    let directorAsignado = $state(null);
    let jurado1Asignado = $state(null);
    let jurado2Asignado = $state(null);

    let campoEnfocado = $state(false);
    let campoJurado1Enfocado = $state(false);
    let campoJurado2Enfocado = $state(false);

    function obtenerLista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.data)) return respuesta.data;
        if (Array.isArray(respuesta?.items)) return respuesta.items;
        return [];
    }

    function nombreCompleto(usuario) {
        return `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim();
    }

    function obtenerUsuario(idUsuario) {
        return usuarios.find(
            usuario => Number(usuario.id_user) === Number(idUsuario)
        );
    }

    function obtenerRolProyecto(idRolProyecto) {
        return rolesProyecto.find(
            rol => Number(rol.id_rol_proyecto) === Number(idRolProyecto)
        )?.nombre ?? 'Rol no identificado';
    }

    function obtenerTrabajo(idTrabajo) {
        return trabajos.find(
            trabajo =>
                Number(trabajo.id_trabajo_grado) === Number(idTrabajo)
        );
    }

    function estaActivo(registro) {
        return registro?.estado === true
            || registro?.estado === 1
            || registro?.estado === 'true';
    }

    let trabajoActual = $derived(
        trabajos.find(
            trabajo =>
                String(trabajo.id_trabajo_grado) ===
                String(trabajoSeleccionadoId)
        ) ?? null
    );

    let docentesDisponibles = $derived(
        usuarios
            .filter(usuario =>
                estaActivo(usuario) &&
                [3, 4].includes(Number(usuario.id_rol))
            )
            .map(usuario => ({
                ...usuario,
                id: usuario.id_user,
                nombre: nombreCompleto(usuario)
            }))
    );

    let directoresDisponibles = $derived(
        docentesDisponibles.filter(
            docente => Number(docente.id_rol) === 3
        )
    );

    let evaluadoresDisponibles = $derived(
        docentesDisponibles.filter(
            docente => Number(docente.id_rol) === 4
        )
    );

    let asignacionesTrabajo = $derived(
        equiposTrabajo.filter(equipo =>
            Number(equipo.id_trabajo_grado) ===
                Number(trabajoSeleccionadoId) &&
            estaActivo(equipo)
        )
    );

    let historialAsignaciones = $derived(
        asignacionesTrabajo.map(asignacion => {
            const usuario = obtenerUsuario(asignacion.id_usuario);

            return {
                id: asignacion.id_equipo,
                docente: usuario
                    ? nombreCompleto(usuario)
                    : `Usuario #${asignacion.id_usuario}`,
                rol: obtenerRolProyecto(asignacion.id_rol_proyecto),
                fecha: asignacion.fecha_asignacion ?? 'Sin fecha'
            };
        })
    );

    let resultadosDirector = $derived(
        directoresDisponibles.filter(docente =>
            docente.nombre.toLowerCase().includes(
                busquedaDirector.toLowerCase()
            ) &&
            Number(docente.id_user) !== Number(jurado1Asignado?.id_user) &&
            Number(docente.id_user) !== Number(jurado2Asignado?.id_user)
        ).filter(() =>
            busquedaDirector.length > 0 || campoEnfocado
        )
    );

    let resultadosJurado1 = $derived(
        evaluadoresDisponibles.filter(docente =>
            docente.nombre.toLowerCase().includes(
                busquedaJurado1.toLowerCase()
            ) &&
            Number(docente.id_user) !== Number(directorAsignado?.id_user) &&
            Number(docente.id_user) !== Number(jurado2Asignado?.id_user)
        ).filter(() =>
            busquedaJurado1.length > 0 || campoJurado1Enfocado
        )
    );

    let resultadosJurado2 = $derived(
        evaluadoresDisponibles.filter(docente =>
            docente.nombre.toLowerCase().includes(
                busquedaJurado2.toLowerCase()
            ) &&
            Number(docente.id_user) !== Number(directorAsignado?.id_user) &&
            Number(docente.id_user) !== Number(jurado1Asignado?.id_user)
        ).filter(() =>
            busquedaJurado2.length > 0 || campoJurado2Enfocado
        )
    );

    function sincronizarAsignaciones() {
        directorAsignado = null;
        jurado1Asignado = null;
        jurado2Asignado = null;

        const director = asignacionesTrabajo.find(
            equipo => Number(equipo.id_rol_proyecto) === 1
        );

        if (director) {
            const usuario = obtenerUsuario(director.id_usuario);

            if (usuario) {
                directorAsignado = {
                    ...usuario,
                    id: usuario.id_user,
                    nombre: nombreCompleto(usuario)
                };
            }
        }

        const evaluadores = asignacionesTrabajo
            .filter(equipo => Number(equipo.id_rol_proyecto) === 3)
            .sort((a, b) => Number(a.id_equipo) - Number(b.id_equipo));

        if (evaluadores[0]) {
            const usuario = obtenerUsuario(evaluadores[0].id_usuario);

            if (usuario) {
                jurado1Asignado = {
                    ...usuario,
                    id: usuario.id_user,
                    nombre: nombreCompleto(usuario)
                };
            }
        }

        if (evaluadores[1]) {
            const usuario = obtenerUsuario(evaluadores[1].id_usuario);

            if (usuario) {
                jurado2Asignado = {
                    ...usuario,
                    id: usuario.id_user,
                    nombre: nombreCompleto(usuario)
                };
            }
        }
    }

    function seleccionarTrabajo(valor) {
        trabajoSeleccionadoId = valor;
        mensaje = '';
        error = '';

        sincronizarAsignaciones();
    }

    function seleccionarDirector(docente) {
        directorAsignado = docente;
        busquedaDirector = '';
        campoEnfocado = false;
    }

    function seleccionarJurado1(docente) {
        jurado1Asignado = docente;
        busquedaJurado1 = '';
        campoJurado1Enfocado = false;
    }

    function seleccionarJurado2(docente) {
        jurado2Asignado = docente;
        busquedaJurado2 = '';
        campoJurado2Enfocado = false;
    }

    async function cargarDatos() {
        cargando = true;
        error = '';

        try {
            const [
                respuestaTrabajos,
                respuestaUsuarios,
                respuestaEquipos,
                respuestaRoles
            ] = await Promise.all([
                getTrabajos(),
                getUsuarios(),
                getEquiposTrabajo(),
                getRolesProyecto()
            ]);

            trabajos = obtenerLista(respuestaTrabajos);
            usuarios = obtenerLista(respuestaUsuarios);
            equiposTrabajo = obtenerLista(respuestaEquipos);
            rolesProyecto = obtenerLista(respuestaRoles);

            const idInicial =
                trabajoProp?.id_trabajo_grado ??
                trabajoSeleccionadoId ??
                trabajos[0]?.id_trabajo_grado;

            if (idInicial != null && String(idInicial) !== '') {
                trabajoSeleccionadoId = String(idInicial);
            }

            sincronizarAsignaciones();
        } catch (e) {
            console.error('Error al cargar asignaciones:', e);
            error =
                e.message ||
                'No fue posible cargar la información. Verifica que el backend esté funcionando.';
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        cargarDatos();
    });

    async function guardarUnaAsignacion(rolProyecto, usuarioSeleccionado, existentes) {
        const asignacionActual = existentes[0] ?? null;

        if (!usuarioSeleccionado) {
            if (asignacionActual) {
                await eliminarEquipoTrabajo(asignacionActual.id_equipo);
            }
            return;
        }

        const payload = {
            id_trabajo_grado: Number(trabajoSeleccionadoId),
            id_usuario: Number(usuarioSeleccionado.id_user),
            id_rol_proyecto: Number(rolProyecto),
            estado: true
        };

        if (asignacionActual) {
            if (
                Number(asignacionActual.id_usuario) !==
                Number(usuarioSeleccionado.id_user)
            ) {
                await editarEquipoTrabajo(
                    asignacionActual.id_equipo,
                    payload
                );
            }
        } else {
            await crearEquipoTrabajo(payload);
        }
    }

    async function guardarAsignaciones() {
        error = '';
        mensaje = '';

        if (!trabajoSeleccionadoId) {
            error = 'Selecciona un trabajo de grado antes de guardar.';
            return;
        }

        if (directorAsignado && Number(directorAsignado.id_rol) !== 3) {
            error = 'El director seleccionado debe tener el rol de docente director.';
            return;
        }

        if (
            (jurado1Asignado && Number(jurado1Asignado.id_rol) !== 4) ||
            (jurado2Asignado && Number(jurado2Asignado.id_rol) !== 4)
        ) {
            error = 'Los jurados seleccionados deben tener el rol de evaluador.';
            return;
        }

        if (
            directorAsignado &&
            (
                Number(directorAsignado.id_user) === Number(jurado1Asignado?.id_user) ||
                Number(directorAsignado.id_user) === Number(jurado2Asignado?.id_user)
            )
        ) {
            error = 'Una misma persona no puede ser director y jurado del mismo trabajo.';
            return;
        }

        if (
            jurado1Asignado &&
            jurado2Asignado &&
            Number(jurado1Asignado.id_user) === Number(jurado2Asignado.id_user)
        ) {
            error = 'Debes seleccionar dos evaluadores diferentes.';
            return;
        }

        guardando = true;

        try {
            const asignacionesActuales = equiposTrabajo
                .filter(equipo =>
                    Number(equipo.id_trabajo_grado) ===
                        Number(trabajoSeleccionadoId) &&
                    estaActivo(equipo)
                );

            const directoresActuales = asignacionesActuales
                .filter(equipo => Number(equipo.id_rol_proyecto) === 1)
                .sort((a, b) => Number(a.id_equipo) - Number(b.id_equipo));

            const juradosActuales = asignacionesActuales
                .filter(equipo => Number(equipo.id_rol_proyecto) === 3)
                .sort((a, b) => Number(a.id_equipo) - Number(b.id_equipo));

            await guardarUnaAsignacion(
                1,
                directorAsignado,
                directoresActuales
            );

            await guardarUnaAsignacion(
                3,
                jurado1Asignado,
                juradosActuales.slice(0, 1)
            );

            await guardarUnaAsignacion(
                3,
                jurado2Asignado,
                juradosActuales.slice(1, 2)
            );

            mensaje = 'Las asignaciones se guardaron correctamente.';
            await cargarDatos();
        } catch (e) {
            console.error('Error al guardar las asignaciones:', e);
            error =
                e.message ||
                'No fue posible guardar las asignaciones. Verifica las rutas y los datos enviados.';
        } finally {
            guardando = false;
        }
    }

    async function eliminarAsignacion(asignacionId) {
        const confirmar = window.confirm(
            '¿Deseas eliminar esta asignación del trabajo de grado?'
        );

        if (!confirmar) return;

        error = '';
        mensaje = '';

        try {
            await eliminarEquipoTrabajo(asignacionId);
            mensaje = 'Asignación eliminada correctamente.';
            await cargarDatos();
        } catch (e) {
            console.error('Error al eliminar la asignación:', e);
            error = e.message || 'No fue posible eliminar la asignación.';
        }
    }
</script>

{#if cargando}
    <div class="alert alert-info" role="status">
        Cargando trabajos, docentes y asignaciones...
    </div>
{:else if error && trabajos.length === 0}
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
{:else}
    {#if error}
        <div class="alert alert-danger" role="alert">
            {error}
        </div>
    {/if}

    {#if mensaje}
        <div class="alert alert-success" role="status">
            {mensaje}
        </div>
    {/if}

    <section class="card mb-4">
        <div class="card-body">
            <h6 class="fw-bold">Trabajo de grado seleccionado</h6>

            <label for="trabajoSeleccionado" class="form-label">
                Seleccionar trabajo
            </label>

            <select
                id="trabajoSeleccionado"
                class="form-select mb-3"
                value={trabajoSeleccionadoId}
                onchange={event => seleccionarTrabajo(event.currentTarget.value)}
            >
                {#each trabajos as trabajo (trabajo.id_trabajo_grado)}
                    <option value={String(trabajo.id_trabajo_grado)}>
                        {trabajo.titulo}
                    </option>
                {/each}
            </select>

            {#if trabajoActual}
                <p class="mb-1">
                    <strong>Título:</strong> {trabajoActual.titulo}
                </p>
                <p class="mb-1">
                    <strong>ID del trabajo:</strong>
                    {trabajoActual.id_trabajo_grado}
                </p>
                <p class="mb-1">
                    <strong>Estudiantes registrados:</strong>
                    {asignacionesTrabajo
                        .filter(equipo => Number(equipo.id_rol_proyecto) === 2)
                        .map(equipo => {
                            const usuario = obtenerUsuario(equipo.id_usuario);
                            return usuario
                                ? nombreCompleto(usuario)
                                : `Usuario #${equipo.id_usuario}`;
                        })
                        .join(', ') || 'Sin estudiantes registrados'}
                </p>
            {:else}
                <p class="text-muted mb-0">
                    No hay trabajos de grado disponibles.
                </p>
            {/if}
        </div>
    </section>

    <section class="card mb-4">
        <div class="card-body">
            <h6 class="fw-bold">
                Asignar director / asesor
            </h6>

            {#if directorAsignado}
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-primary">
                        {directorAsignado.nombre}
                    </span>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        onclick={() => directorAsignado = null}
                    >
                        Quitar selección
                    </button>
                </div>
            {:else}
                <input
                    type="text"
                    class="form-control"
                    placeholder="Escribe el nombre del docente director..."
                    bind:value={busquedaDirector}
                    onfocus={() => campoEnfocado = true}
                    onblur={() => campoEnfocado = false}
                />

                {#if resultadosDirector.length > 0}
                    <ul class="list-group mt-2">
                        {#each resultadosDirector as docente (docente.id_user)}
                            <li class="list-group-item p-0">
                                <button
                                    type="button"
                                    class="btn text-start w-100"
                                    onclick={() => seleccionarDirector(docente)}
                                >
                                    {docente.nombre}
                                </button>
                            </li>
                        {/each}
                    </ul>
                {:else if busquedaDirector.length > 0}
                    <p class="text-muted mt-2">
                        No se encontraron docentes directores.
                    </p>
                {/if}
            {/if}
        </div>
    </section>

    <section class="card mb-4">
        <div class="card-body">
            <h6 class="fw-bold">
                Asignar jurados
            </h6>

            <div class="row g-3">
                <div class="col-md-6">
                    <label for="buscarJurado1" class="form-label">
                        Jurado 1
                    </label>

                    {#if jurado1Asignado}
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary">
                                {jurado1Asignado.nombre}
                            </span>
                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                onclick={() => jurado1Asignado = null}
                            >
                                Quitar selección
                            </button>
                        </div>
                    {:else}
                        <input
                            id="buscarJurado1"
                            type="text"
                            class="form-control"
                            placeholder="Buscar jurado 1..."
                            bind:value={busquedaJurado1}
                            onfocus={() => campoJurado1Enfocado = true}
                            onblur={() => campoJurado1Enfocado = false}
                        />

                        {#if resultadosJurado1.length > 0}
                            <ul class="list-group mt-2">
                                {#each resultadosJurado1 as docente (docente.id_user)}
                                    <li class="list-group-item p-0">
                                        <button
                                            type="button"
                                            class="btn text-start w-100"
                                            onclick={() => seleccionarJurado1(docente)}
                                        >
                                            {docente.nombre}
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {:else if busquedaJurado1.length > 0}
                            <p class="text-muted mt-2">
                                No se encontraron evaluadores.
                            </p>
                        {/if}
                    {/if}
                </div>

                <div class="col-md-6">
                    <label for="buscarJurado2" class="form-label">
                        Jurado 2
                    </label>

                    {#if jurado2Asignado}
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary">
                                {jurado2Asignado.nombre}
                            </span>
                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger"
                                onclick={() => jurado2Asignado = null}
                            >
                                Quitar selección
                            </button>
                        </div>
                    {:else}
                        <input
                            id="buscarJurado2"
                            type="text"
                            class="form-control"
                            placeholder="Buscar jurado 2..."
                            bind:value={busquedaJurado2}
                            onfocus={() => campoJurado2Enfocado = true}
                            onblur={() => campoJurado2Enfocado = false}
                        />

                        {#if resultadosJurado2.length > 0}
                            <ul class="list-group mt-2">
                                {#each resultadosJurado2 as docente (docente.id_user)}
                                    <li class="list-group-item p-0">
                                        <button
                                            type="button"
                                            class="btn text-start w-100"
                                            onclick={() => seleccionarJurado2(docente)}
                                        >
                                            {docente.nombre}
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {:else if busquedaJurado2.length > 0}
                            <p class="text-muted mt-2">
                                No se encontraron evaluadores.
                            </p>
                        {/if}
                    {/if}
                </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
                <button
                    type="button"
                    class="btn btn-primary"
                    disabled={guardando || !trabajoSeleccionadoId}
                    onclick={guardarAsignaciones}
                >
                    {#if guardando}
                        <span class="spinner-border spinner-border-sm me-1"></span>
                        Guardando...
                    {:else}
                        <i class="bi bi-save me-1"></i>
                        Guardar asignaciones
                    {/if}
                </button>
            </div>
        </div>
    </section>

    <section class="card mb-4">
        <div class="card-body">
            <h6 class="fw-bold">
                Historial de asignaciones de este trabajo
            </h6>

            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol en el proyecto</th>
                            <th>Fecha de asignación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each historialAsignaciones as asignacion (asignacion.id)}
                            <tr>
                                <td>{asignacion.docente}</td>
                                <td>{asignacion.rol}</td>
                                <td>{asignacion.fecha}</td>
                                <td>
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-danger"
                                        title="Eliminar asignación"
                                        aria-label="Eliminar asignación"
                                        disabled={guardando}
                                        onclick={() => eliminarAsignacion(asignacion.id)}
                                    >
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="4" class="text-center text-muted">
                                    Este trabajo no tiene asignaciones activas.
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
{/if}
