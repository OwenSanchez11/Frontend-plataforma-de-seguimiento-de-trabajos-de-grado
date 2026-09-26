<script>
    let facultades = $state([
        {
            id: 1,
            nombre: "Facultad de Ingeniería",
            codigo: "FI",
            estado: true
        },
        {
            id: 2,
            nombre: "Facultad de Ciencias Económicas",
            codigo: "FCE",
            estado: true
        },
        {
            id: 3,
            nombre: "Facultad de Ciencias Sociales",
            codigo: "FCS",
            estado: true
        }
    ]);

    let carreras = $state([
        {
            id: 1,
            id_facultad: 1,
            nombre: "Ingeniería de Sistemas",
            codigo: "IS",
            estado: true
        },
        {
            id: 2,
            id_facultad: 1,
            nombre: "Ingeniería Industrial",
            codigo: "II",
            estado: true
        },
        {
            id: 3,
            id_facultad: 1,
            nombre: "Ingeniería Electrónica",
            codigo: "IE",
            estado: true
        },
        {
            id: 4,
            id_facultad: 2,
            nombre: "Administración de Empresas",
            codigo: "AE",
            estado: true
        }
    ]);

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
            facultad.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            facultad.codigo.toLowerCase().includes(busqueda.toLowerCase())
        )
    );

    let carrerasFiltradas = $derived(
        carreras.filter((carrera) =>
            carrera.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            carrera.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
            obtenerNombreFacultad(carrera.id_facultad)
                .toLowerCase()
                .includes(busqueda.toLowerCase())
        )
    );

    function obtenerNombreFacultad(id) {
        const facultad = facultades.find((item) => item.id === Number(id));
        return facultad ? facultad.nombre : "Sin facultad";
    }

    function abrirNuevaFacultad() {
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
            id: facultad.id,
            nombre: facultad.nombre,
            codigo: facultad.codigo,
            estado: facultad.estado
        };

        mostrarFormulario = true;
    }

    function abrirEditarCarrera(carrera) {
        modoEdicion = true;
        tipoFormulario = "carrera";

        formularioCarrera = {
            id: carrera.id,
            id_facultad: carrera.id_facultad,
            nombre: carrera.nombre,
            codigo: carrera.codigo,
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

    function guardarFacultad() {
        if (!formularioFacultad.nombre.trim()) {
            alert("Ingresa el nombre de la facultad.");
            return;
        }

        if (modoEdicion) {
            const indice = facultades.findIndex(
                (item) => item.id === formularioFacultad.id
            );

            if (indice !== -1) {
                facultades[indice] = {
                    ...formularioFacultad
                };
            }
        } else {
            const nuevoId =
                facultades.length > 0
                    ? Math.max(...facultades.map((item) => item.id)) + 1
                    : 1;

            facultades.push({
                id: nuevoId,
                nombre: formularioFacultad.nombre,
                codigo: formularioFacultad.codigo,
                estado: formularioFacultad.estado
            });
        }

        cerrarFormulario();
    }

    function guardarCarrera() {
        if (
            !formularioCarrera.nombre.trim() ||
            !formularioCarrera.id_facultad
        ) {
            alert("Completa los campos obligatorios.");
            return;
        }

        if (modoEdicion) {
            const indice = carreras.findIndex(
                (item) => item.id === formularioCarrera.id
            );

            if (indice !== -1) {
                carreras[indice] = {
                    ...formularioCarrera,
                    id_facultad: Number(formularioCarrera.id_facultad)
                };
            }
        } else {
            const nuevoId =
                carreras.length > 0
                    ? Math.max(...carreras.map((item) => item.id)) + 1
                    : 1;

            carreras.push({
                id: nuevoId,
                id_facultad: Number(formularioCarrera.id_facultad),
                nombre: formularioCarrera.nombre,
                codigo: formularioCarrera.codigo,
                estado: formularioCarrera.estado
            });
        }

        cerrarFormulario();
    }

    function confirmarEliminar(elemento, tipo) {
        elementoSeleccionado = elemento;
        tipoFormulario = tipo;
        mostrarEliminar = true;
    }

    function eliminarElemento() {
        if (!elementoSeleccionado) return;

        if (tipoFormulario === "facultad") {
            facultades = facultades.filter(
                (item) => item.id !== elementoSeleccionado.id
            );

            carreras = carreras.filter(
                (item) => item.id_facultad !== elementoSeleccionado.id
            );
        } else {
            carreras = carreras.filter(
                (item) => item.id !== elementoSeleccionado.id
            );
        }

        mostrarEliminar = false;
        elementoSeleccionado = null;
    }

    function cerrarFormulario() {
        mostrarFormulario = false;
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
                            {#each facultadesFiltradas as facultad}
                                <tr>
                                    <td>{facultad.id}</td>

                                    <td>
                                        <strong>{facultad.nombre}</strong>
                                    </td>

                                    <td>
                                        <span class="badge bg-light text-dark">
                                            {facultad.codigo || "Sin código"}
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
                            {#each carrerasFiltradas as carrera}
                                <tr>
                                    <td>{carrera.id}</td>

                                    <td>
                                        <strong>{carrera.nombre}</strong>
                                    </td>

                                    <td>
                                        <span class="badge bg-light text-dark">
                                            {carrera.codigo || "Sin código"}
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

                            {#each facultades as facultad}
                                <option value={facultad.id}>
                                    {facultad.nombre}
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

                <button
                    class="btn btn-primary"
                    onclick={() =>
                        tipoFormulario === "facultad"
                            ? guardarFacultad()
                            : guardarCarrera()
                    }
                >
                    <i class="bi bi-check-lg me-2"></i>
                    Guardar
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

                {#if tipoFormulario === "facultad"}

                    <div class="detail-item">
                        <strong>ID:</strong>
                        <span>{elementoSeleccionado.id}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Nombre:</strong>
                        <span>{elementoSeleccionado.nombre}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Código:</strong>
                        <span>
                            {elementoSeleccionado.codigo || "Sin código"}
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
                        <span>{elementoSeleccionado.id}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Nombre:</strong>
                        <span>{elementoSeleccionado.nombre}</span>
                    </div>

                    <div class="detail-item">
                        <strong>Código:</strong>
                        <span>
                            {elementoSeleccionado.codigo || "Sin código"}
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
                    {elementoSeleccionado.nombre}
                </p>

                {#if tipoFormulario === "facultad"}
                    <small class="text-danger d-block mt-2">
                        Al eliminar una facultad también se eliminarán sus carreras ficticias.
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
