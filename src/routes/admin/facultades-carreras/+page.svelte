<script>

    //importas el onMount y los endpoint que necesitas
    import {onMount} from 'svelte';
    import {getFacultades, getCarreras, crearFacultad, crearCarrera, actualizarFacultad, actualizarCarrera} from '$lib/api';

    //variables para guardar lo que obtengas del endpoint
    let facultades = $state([]);
    let carreras = $state([]);
    let cargando = $state(true);
    let error = $state(null);
    let guardando = $state(false);
    let errorFormulario = $state('');

    //función asincronica que va si o si para obtener cuando se cumpla la promesa del fetch(en este caso, van las rutas que necesitas utilizar, por ejemplo,
    //aquí utilizo getFacultades y getCarreras)
    onMount(async () => {
        const [resFacultades, resCarreras] = await Promise.allSettled([
            getFacultades(),
            getCarreras()
        ])

        if (resFacultades.status === 'fulfilled') {
            facultades = resFacultades.value;
        } else {
            console.error(resFacultades.reason);
            error = resFacultades.reason.message;
        }

        if (resCarreras.status === 'fulfilled') {
            carreras = resCarreras.value;
        } else {
            console.error(resCarreras.reason)
        }

        cargando = false;

    });


    let busqueda = $state("");
    let pestanaActiva = $state("facultades");

    let mostrarFormulario = $state(false);
    let mostrarDetalle = $state(false);
    let mostrarEliminar = $state(false);

    let modoEdicion = $state(false);
    let tipoFormulario = $state("facultad");

    let elementoSeleccionado = $state(null);

    let formularioFacultad = $state({
        id: null,
        nombre: "",
        codigo: "",
        estado: true
    });

    let formularioCarrera = $state({
        id: null,
        id_facultad: "",
        nombre: "",
        codigo: "",
        estado: true
    });

    let facultadesFiltradas = $derived(
        facultades.filter((facultad) =>
            (facultad.nombre_facultad ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (facultad.codigo_facultad ?? "").toLowerCase().includes(busqueda.toLowerCase())
        )
    );

    let carrerasFiltradas = $derived(
        carreras.filter((carrera) =>
            (carrera.nombre_carrera ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
            (carrera.codigo_carrera ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
            obtenerNombreFacultad(carrera.id_facultad).toLowerCase().includes(busqueda.toLowerCase())
        )
    );


    function obtenerNombreFacultad(id_facultad) {
        const facultad = facultades.find((item) => item.id_facultad === Number(id_facultad));
        return facultad ? facultad.nombre_facultad : "Sin facultad";
    }

    function abrirNuevaFacultad() {
        errorFormulario = '';
        modoEdicion = false;
        tipoFormulario = "facultad";

        formularioFacultad = {
            id: null,
            nombre: "",
            codigo: "",
            estado: true
        };

        mostrarFormulario = true;
    }

    function abrirNuevaCarrera() {
        errorFormulario = '';
        modoEdicion = false;
        tipoFormulario = "carrera";

        formularioCarrera = {
            id: null,
            id_facultad: "",
            nombre: "",
            codigo: "",
            estado: true
        };

        mostrarFormulario = true;
    }

    function abrirEditarFacultad(facultad) {
        modoEdicion = true;
        tipoFormulario = "facultad";

        formularioFacultad = {
            id: facultad.id_facultad,
            nombre: facultad.nombre_facultad,
            codigo: facultad.codigo_facultad,
            estado: facultad.estado
        };

        mostrarFormulario = true;
    }

    function abrirEditarCarrera(carrera) {
        modoEdicion = true;
        tipoFormulario = "carrera";

        formularioCarrera = {
            id: carrera.id_carrera,
            id_facultad: carrera.id_facultad,
            nombre: carrera.nombre_carrera,
            codigo: carrera.codigo_carrera,
            estado: carrera.estado
        };

        mostrarFormulario = true;
    }

    function verFacultad(facultad) {
        elementoSeleccionado = facultad;
        tipoFormulario = "facultad";
        mostrarDetalle = true;
    }

    function verCarrera(carrera) {
        elementoSeleccionado = carrera;
        tipoFormulario = "carrera";
        mostrarDetalle = true;
    }

    async function guardarFacultad() {
        //si no colocas el nombre de la facultad da error
        if (!formularioFacultad.nombre.trim()) {
            errorFormulario = "Ingresa el nombre de la facultad.";
            return;
        }

        guardando = true;
        errorFormulario = '';

        const datos = {
            nombre_facultad: formularioFacultad.nombre.trim(),
            codigo_facultad: formularioFacultad.codigo.trim() || null,
            estado: formularioFacultad.estado
        };

        try {
            if (modoEdicion) {
                await actualizarFacultad(formularioFacultad.id, datos);
            } else {
                await crearFacultad(datos);
            }
            facultades = await getFacultades();
            cerrarFormulario();
        } catch(e) {
            errorFormulario = e.message;
        } finally {
            guardando = false;
        }
    }

    async function guardarCarrera() {
        //si no colocas el nombre de la carrera da error
        if (!formularioCarrera.nombre.trim() || !formularioCarrera.id_facultad) {
            errorFormulario = "Completa los campos obligatorios";
            return;
        }

        guardando = true;
        errorFormulario = '';
        const datos = {
            nombre_carrera: formularioCarrera.nombre.trim(),
            codigo_carrera: formularioCarrera.codigo?.trim() || null,
            id_facultad: Number(formularioCarrera.id_facultad),
            estado: formularioCarrera.estado
        };

        try {
            if (modoEdicion) {
                await actualizarCarrera(formularioCarrera.id, datos);
            } else {
                await crearCarrera(datos);
            }
            carreras = await getCarreras();
            cerrarFormulario();
        } catch(e) {
            errorFormulario = e.message
        } finally {
            guardando = false;
        }
    }

    function confirmarEliminar(elemento, tipo) {
        elementoSeleccionado = elemento;
        tipoFormulario = tipo;
        mostrarEliminar = true;
    }

    async function eliminarElemento() {
        if (!elementoSeleccionado) return;
        guardando = true;

        try {
            if(tipoFormulario === "facultad") {
                await actualizarFacultad(elementoSeleccionado.id_facultad,{
                    nombre_facultad: elementoSeleccionado.nombre_facultad,
                    codigo_facultad: elementoSeleccionado.codigo_facultad,
                    estado: false
                });
            } else {
                await actualizarCarrera(elementoSeleccionado.id_carrera, {
                    nombre_carrera: elementoSeleccionado.nombre_carrera,
                    codigo_carrera: elementoSeleccionado.codigo_carrera,
                    id_facultad: elementoSeleccionado.id_facultad,
                    estado: false
                });
                carreras = await getCarreras();
                
            }
            cerrarEliminar();
        } catch (e) {
            console.error(e)
            alert(e.message)
        } finally {
            guardando = false;
        }
    }

    function cerrarFormulario() {
        mostrarFormulario = false;
        errorFormulario = '';
    }

    function cerrarDetalle() {
        mostrarDetalle = false;
        elementoSeleccionado = null;
    }

    function cerrarEliminar() {
        mostrarEliminar = false;
        elementoSeleccionado = null;
    }
</script>

<svelte:head>
    <title>Facultades y Carreras</title>
</svelte:head>

<div class="container-fluid py-3">

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-1">Facultades & Carreras</h2>
            <p class="text-muted mb-0">
                Administración de facultades y carreras de la universidad
            </p>
        </div>

        <button
            class="btn btn-primary"
            onclick={() =>
                pestanaActiva === "facultades"
                    ? abrirNuevaFacultad()
                    : abrirNuevaCarrera()
            }
        >
            <i class="bi bi-plus-lg me-2"></i>
            Nuevo {pestanaActiva === "facultades" ? "Facultad" : "Carrera"}
        </button>
    </div>

    <div class="card border-0 shadow-sm">

        <div class="card-body">

            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                <div class="btn-group">
                    <button
                        class:active-tab={pestanaActiva === "facultades"}
                        class="btn btn-outline-primary"
                        onclick={() => {
                            pestanaActiva = "facultades";
                            busqueda = "";
                        }}
                    >
                        <i class="bi bi-building me-2"></i>
                        Facultades
                    </button>

                    <button
                        class:active-tab={pestanaActiva === "carreras"}
                        class="btn btn-outline-primary"
                        onclick={() => {
                            pestanaActiva = "carreras";
                            busqueda = "";
                        }}
                    >
                        <i class="bi bi-mortarboard me-2"></i>
                        Carreras
                    </button>
                </div>

                <div class="search-box">
                    <i class="bi bi-search"></i>

                    <input
                        type="text"
                        class="form-control"
                        placeholder="Buscar..."
                        bind:value={busqueda}
                    />
                </div>

            </div>

            {#if pestanaActiva === "facultades"}

                <div class="table-responsive">
                    <table class="table table-hover align-middle">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Facultad</th>
                                <th>Código</th>
                                <th>Estado</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                        <!-- condicional necesario para que aparezca en la pantalla 'cargando' mientras llega la respuesta de la API -->
                            {#if cargando}
                                <tr>
                                    <td colspan="5" class="text-center py-5 text-muted">Cargando facultades...</td>
                                </tr>
                            <!-- condicional por si da error -->
                            {:else if error}
                                <tr>
                                    <td colspan="5" class="text-center py-5 text-danger">{error}</td>
                                </tr>
                                <!-- el condicional para que cuando ya tenga la respuesta de la API, renderice todo en el frontend -->
                            {:else}
                                {#each facultadesFiltradas as facultad (facultad.id_facultad)}
                                    <tr>
                                        <td>{facultad.id_facultad}</td>

                                        <td>
                                            <strong>{facultad.nombre_facultad}</strong>
                                        </td>

                                        <td>
                                            <span class="badge bg-light text-dark">
                                                {facultad.codigo_facultad || "Sin código"}
                                            </span>
                                        </td>

                                        <td>
                                            {#if facultad.estado}
                                                <span class="badge bg-success-subtle text-success">
                                                    Activa
                                                </span>
                                            {:else}
                                                <span class="badge bg-danger-subtle text-danger">
                                                    Inactiva
                                                </span>
                                            {/if}
                                        </td>

                                        <td class="text-center">
                                            <div class="btn-group">

                                                <button
                                                    class="btn btn-sm btn-outline-secondary"
                                                    title="Ver"
                                                    onclick={() => verFacultad(facultad)}
                                                >
                                                    <i class="bi bi-eye"></i>
                                                </button>

                                                <button
                                                    class="btn btn-sm btn-outline-primary"
                                                    title="Editar"
                                                    onclick={() => abrirEditarFacultad(facultad)}
                                                >
                                                    <i class="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    class="btn btn-sm btn-outline-danger"
                                                    title="Eliminar"
                                                    onclick={() =>
                                                        confirmarEliminar(
                                                            facultad,
                                                            "facultad"
                                                        )
                                                    }
                                                >
                                                    <i class="bi bi-trash"></i>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                {:else}
                                    <tr>
                                        <td colspan="5" class="text-center py-5 text-muted">
                                            No se encontraron facultades.
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>

                    </table>
                </div>

            {:else}

                <div class="table-responsive">
                    <table class="table table-hover align-middle">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Carrera</th>
                                <th>Código</th>
                                <th>Facultad</th>
                                <th>Estado</th>
                                <th class="text-center">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {#if cargando}
                                <tr>
                                    <td colspan="5" class="text-center py-5 text-muted"> cargando facultades...</td>
                                </tr>
                            {:else if error}
                                <tr>
                                    <td colspan="5" class="text-center py-5 text-danger">{error}</td>
                                </tr>
                            {:else}
                                {#each carrerasFiltradas as carrera (carrera.id_carrera)}
                                    <tr>
                                        <td>{carrera.id_carrera}</td>

                                        <td>
                                            <strong>{carrera.nombre_carrera}</strong>
                                        </td>

                                        <td>
                                            <span class="badge bg-light text-dark">
                                                {carrera.codigo_carrera || "Sin código"}
                                            </span>
                                        </td>

                                        <td>
                                            {obtenerNombreFacultad(carrera.id_facultad)}
                                        </td>

                                        <td>
                                            {#if carrera.estado}
                                                <span class="badge bg-success-subtle text-success">
                                                    Activa
                                                </span>
                                            {:else}
                                                <span class="badge bg-danger-subtle text-danger">
                                                    Inactiva
                                                </span>
                                            {/if}
                                        </td>

                                        <td class="text-center">
                                            <div class="btn-group">

                                                <button
                                                    class="btn btn-sm btn-outline-secondary"
                                                    title="Ver"
                                                    onclick={() => verCarrera(carrera)}
                                                >
                                                    <i class="bi bi-eye"></i>
                                                </button>

                                                <button
                                                    class="btn btn-sm btn-outline-primary"
                                                    title="Editar"
                                                    onclick={() => abrirEditarCarrera(carrera)}
                                                >
                                                    <i class="bi bi-pencil"></i>
                                                </button>

                                                <button
                                                    class="btn btn-sm btn-outline-danger"
                                                    title="Eliminar"
                                                    onclick={() =>
                                                        confirmarEliminar(
                                                            carrera,
                                                            "carrera"
                                                        )
                                                    }
                                                >
                                                    <i class="bi bi-trash"></i>
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                {:else}
                                    <tr>
                                        <td colspan="6" class="text-center py-5 text-muted">
                                            No se encontraron carreras.
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>

            {/if}

        </div>
    </div>
</div>

{#if mostrarFormulario}

    <div class="modal-backdrop-custom">

        <div class="modal-content-custom">

            <div class="modal-header-custom">
                <h5 class="fw-bold mb-0">
                    {modoEdicion ? "Editar" : "Nuevo"}
                    {tipoFormulario === "facultad" ? " Facultad" : " Carrera"}
                </h5>

                <button
                    class="btn-close"
                    aria-label="Cerrar"
                    onclick={cerrarFormulario}
                ></button>
            </div>

            <div class="modal-body-custom">

                <!-- condicional por si nos da error algo -->
                {#if errorFormulario} 
                    <div class="alert alert-danger py-2">{errorFormulario}</div>
                {/if}

                <!-- condicional para saber el tipo del formulario, en caso de estar en el de facultad, será el formulario de facultad -->
                {#if tipoFormulario === "facultad"}

                    <div class="mb-3">
                        <label for="nombre-facultad" class="form-label">
                            Nombre de la facultad *
                        </label>

                        <input
                            id="nombre-facultad"
                            type="text"
                            class="form-control"
                            placeholder="Ej. Facultad de Ingeniería"
                            bind:value={formularioFacultad.nombre}
                        />
                    </div>

                    <div class="mb-3">
                        <label for="codigo-facultad" class="form-label">
                            Código
                        </label>

                        <input
                            id="codigo-facultad"
                            type="text"
                            class="form-control"
                            placeholder="Ej. FI"
                            bind:value={formularioFacultad.codigo}
                        />
                    </div>

                    <div class="mb-3">
                        <label for="estado-facultad" class="form-label">
                            Estado
                        </label>

                        <select
                            id="estado-facultad"
                            class="form-select"
                            bind:value={formularioFacultad.estado}
                        >
                            <option value={true}>Activa</option>
                            <option value={false}>Inactiva</option>
                        </select>
                    </div>

                {:else}
                <!-- si no es el formulario facultad, entonces nos encontramos en el formulario de crear carreras -->

                    <div class="mb-3">
                        <label for="nombre-carrera" class="form-label">
                            Nombre de la carrera *
                        </label>

                        <input
                            id="nombre-carrera"
                            type="text"
                            class="form-control"
                            placeholder="Ej. Ingeniería de Sistemas"
                            bind:value={formularioCarrera.nombre}
                        />
                    </div>

                    <div class="mb-3">
                        <label for="codigo-carrera" class="form-label">
                            Código
                        </label>

                        <input
                            id="codigo-carrera"
                            type="text"
                            class="form-control"
                            placeholder="Ej. IS"
                            bind:value={formularioCarrera.codigo}
                        />
                    </div>

                    <div class="mb-3">
                        <label for="facultad-carrera" class="form-label">
                            Facultad *
                        </label>

                        <select
                            id="facultad-carrera"
                            class="form-select"
                            bind:value={formularioCarrera.id_facultad}
                        >
                            <option value="">Selecciona una facultad</option>

                            {#each facultades as facultad (facultad.id_facultad)}
                                <option value={facultad.id_facultad}>
                                    {facultad.nombre_facultad}
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="estado-carrera" class="form-label">
                            Estado
                        </label>

                        <select
                            id="estado-carrera"
                            class="form-select"
                            bind:value={formularioCarrera.estado}
                        >
                            <option value={true}>Activa</option>
                            <option value={false}>Inactiva</option>
                        </select>
                    </div>

                {/if}

            </div>

            <div class="modal-footer-custom">

                <button
                    class="btn btn-secondary"
                    onclick={cerrarFormulario}
                >
                    Cancelar
                </button>

                <!-- botón para guardar los datos, y según el formulario o guarda facultades o guarda carreras -->
                <button
                    class="btn btn-primary"
                    disabled={guardando}
                    onclick={() =>
                        tipoFormulario === "facultad"
                            ? guardarFacultad()
                            : guardarCarrera()
                    }
                >
                    <i class="bi bi-check-lg me-2"></i>
                    {guardando ? "Guardando..." : "Guardar"}
                </button>

            </div>

        </div>

    </div>

{/if}

{#if mostrarDetalle && elementoSeleccionado}

    <div class="modal-backdrop-custom">

        <div class="modal-content-custom">

            <div class="modal-header-custom">

                <h5 class="fw-bold mb-0">
                    Detalles
                </h5>

                <button
                    class="btn-close"
                    aria-label="Cerrar"
                    onclick={cerrarDetalle}
                ></button>

            </div>

            <div class="modal-body-custom">

                {#if tipoFormulario === "facultad"
                    ? elementoSeleccionado.nombre_facultad
                    : elementoSeleccionado.nombre_carrera}

                    <div class="detail-item">
                        <strong>ID:</strong>
                        <span>{elementoSeleccionado.id_facultad}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Nombre:</strong>
                        <span>{elementoSeleccionado.nombre_facultad}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Código:</strong>
                        <span>
                            {elementoSeleccionado.codigo_facultad || "Sin código"}
                        </span>
                    </div>

                    <div class="detail-item">
                        <strong>Estado:</strong>

                        <span>
                            {elementoSeleccionado.estado
                                ? "Activa"
                                : "Inactiva"}
                        </span>
                    </div>

                {:else}

                    <div class="detail-item">
                        <strong>ID:</strong>
                        <span>{elementoSeleccionado.id_carrera}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Nombre:</strong>
                        <span>{elementoSeleccionado.nombre_carrera}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Código:</strong>
                        <span>
                            {elementoSeleccionado.codigo_carrera|| "Sin código"}
                        </span>
                    </div>

                    <div class="detail-item">
                        <strong>Facultad:</strong>
                        <span>
                            {obtenerNombreFacultad(
                                elementoSeleccionado.id_facultad
                            )}
                        </span>
                    </div>

                    <div class="detail-item">
                        <strong>Estado:</strong>

                        <span>
                            {elementoSeleccionado.estado
                                ? "Activa"
                                : "Inactiva"}
                        </span>
                    </div>

                {/if}

            </div>

            <div class="modal-footer-custom">

                <button
                    class="btn btn-secondary"
                    onclick={cerrarDetalle}
                >
                    Cerrar
                </button>

            </div>

        </div>

    </div>

{/if}

{#if mostrarEliminar && elementoSeleccionado}

    <div class="modal-backdrop-custom">

        <div class="modal-content-custom modal-small">

            <div class="modal-header-custom">

                <h5 class="fw-bold mb-0">
                    Confirmar eliminación
                </h5>

                <button
                    class="btn-close"
                    aria-label="Cerrar"
                    onclick={cerrarEliminar}
                ></button>

            </div>

            <div class="modal-body-custom text-center">

                <div class="delete-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>

                <h5 class="mt-3">
                    ¿Deseas eliminar este registro?
                </h5>

                <p class="text-muted mb-0">
                    {elementoSeleccionado.nombre_facultad}
                </p>

                {#if tipoFormulario === "facultad"}
                    <small class="text-danger d-block mt-2">
                        Al eliminar una facultad también se eliminarán sus carreras.
                    </small>
                {/if}

            </div>

            <div class="modal-footer-custom">

                <button
                    class="btn btn-secondary"
                    onclick={cerrarEliminar}
                >
                    Cancelar
                </button>

                <button
                    class="btn btn-danger"
                    onclick={eliminarElemento}
                    disabled={guardando}
                >
                    <i class="bi bi-trash me-2"></i>
                    Eliminar
                </button>

            </div>

        </div>

    </div>

{/if}

<style>
    .search-box {
        position: relative;
        width: 280px;
    }

    .search-box i {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
        z-index: 2;
    }

    .search-box input {
        padding-left: 38px;
    }

    .active-tab {
        color: white !important;
        background-color: #0d6efd !important;
        border-color: #0d6efd !important;
    }

    .modal-backdrop-custom {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        z-index: 1050;
    }

    .modal-content-custom {
        width: 100%;
        max-width: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        overflow: hidden;
    }

    .modal-small {
        max-width: 450px;
    }

    .modal-header-custom {
        padding: 20px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-body-custom {
        padding: 25px;
        max-height: 70vh;
        overflow-y: auto;
    }

    .modal-footer-custom {
        padding: 16px 20px;
        border-top: 1px solid #dee2e6;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 0;
        border-bottom: 1px solid #eee;
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .delete-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto;
        border-radius: 50%;
        background: #fff3cd;
        color: #dc3545;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
    }

    @media (max-width: 768px) {
        .search-box {
            width: 100%;
        }

        .detail-item {
            flex-direction: column;
            gap: 5px;
        }
    }
</style>
