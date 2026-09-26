<script>
    let busqueda = $state('');
    let mostrarModal = $state(false);
    let mostrarModalVer = $state(false);
    let modoEdicion = $state(false);
    let entregaSeleccionada = $state(null);

    let entregas = $state([
        {
            id_entrega: 1,
            id_avances: 1,
            numero_version: 1,
            nombre_archivo: 'planteamiento_proyecto.pdf',
            ruta_archivo: '/archivos/entregas/planteamiento_proyecto.pdf',
            comentarios: 'Entrega realizada correctamente.',
            estado: true,
            fecha_entrega: '2026-03-09T14:30'
        },
        {
            id_entrega: 2,
            id_avances: 2,
            numero_version: 2,
            nombre_archivo: 'diseno_solucion.pdf',
            ruta_archivo: '/archivos/entregas/diseno_solucion.pdf',
            comentarios: 'Se entrega segunda versión con correcciones solicitadas.',
            estado: true,
            fecha_entrega: '2026-04-14T16:45'
        },
        {
            id_entrega: 3,
            id_avances: 3,
            numero_version: 3,
            nombre_archivo: 'implementacion_sistema.zip',
            ruta_archivo: '/archivos/entregas/implementacion_sistema.zip',
            comentarios: 'Entrega pendiente de revisión por parte del coordinador.',
            estado: false,
            fecha_entrega: '2026-05-21T10:15'
        }
    ]);

    let avances = $state([
        {
            id_avance: 1,
            titulo: 'Planteamiento del proyecto'
        },
        {
            id_avance: 2,
            titulo: 'Diseño de la solución'
        },
        {
            id_avance: 3,
            titulo: 'Implementación del sistema'
        }
    ]);

    let formulario = $state({
        id_entrega: null,
        id_avances: '',
        numero_version: '',
        nombre_archivo: '',
        ruta_archivo: '',
        comentarios: '',
        estado: true,
        fecha_entrega: ''
    });

    let entregasFiltradas = $derived(
        entregas.filter((entrega) => {
            const texto = busqueda.toLowerCase();

            const avance = avances.find(
                (item) => item.id_avance === entrega.id_avances
            );

            const tituloAvance = avance ? avance.titulo.toLowerCase() : '';

            return (
                entrega.nombre_archivo.toLowerCase().includes(texto) ||
                entrega.comentarios.toLowerCase().includes(texto) ||
                tituloAvance.includes(texto) ||
                String(entrega.id_entrega).includes(texto)
            );
        })
    );

    function obtenerTituloAvance(idAvance) {
        const avance = avances.find(
            (item) => item.id_avance === Number(idAvance)
        );

        return avance ? avance.titulo : 'Avance no encontrado';
    }

    function abrirCrear() {
        modoEdicion = false;

        formulario = {
            id_entrega: null,
            id_avances: '',
            numero_version: '',
            nombre_archivo: '',
            ruta_archivo: '',
            comentarios: '',
            estado: true,
            fecha_entrega: ''
        };

        mostrarModal = true;
    }

    function abrirEditar(entrega) {
        modoEdicion = true;

        formulario = {
            id_entrega: entrega.id_entrega,
            id_avances: entrega.id_avances,
            numero_version: entrega.numero_version,
            nombre_archivo: entrega.nombre_archivo,
            ruta_archivo: entrega.ruta_archivo,
            comentarios: entrega.comentarios,
            estado: entrega.estado,
            fecha_entrega: entrega.fecha_entrega
        };

        mostrarModal = true;
    }

    function abrirVer(entrega) {
        entregaSeleccionada = entrega;
        mostrarModalVer = true;
    }

    function cerrarModal() {
        mostrarModal = false;
    }

    function cerrarModalVer() {
        mostrarModalVer = false;
        entregaSeleccionada = null;
    }

    function guardarEntrega() {
        if (
            !formulario.id_avances ||
            !formulario.numero_version ||
            !formulario.nombre_archivo ||
            !formulario.ruta_archivo ||
            !formulario.fecha_entrega
        ) {
            alert('Por favor completa los campos obligatorios.');
            return;
        }

        if (modoEdicion) {
            const indice = entregas.findIndex(
                (entrega) => entrega.id_entrega === formulario.id_entrega
            );

            if (indice !== -1) {
                entregas[indice] = {
                    ...formulario,
                    id_avances: Number(formulario.id_avances),
                    numero_version: Number(formulario.numero_version)
                };
            }
        } else {
            const nuevoId =
                entregas.length > 0
                    ? Math.max(...entregas.map((entrega) => entrega.id_entrega)) + 1
                    : 1;

            entregas.push({
                ...formulario,
                id_entrega: nuevoId,
                id_avances: Number(formulario.id_avances),
                numero_version: Number(formulario.numero_version)
            });
        }

        cerrarModal();
    }

    function eliminarEntrega(id) {
        const confirmar = confirm(
            '¿Estás seguro de que deseas eliminar esta entrega?'
        );

        if (!confirmar) {
            return;
        }

        entregas = entregas.filter(
            (entrega) => entrega.id_entrega !== id
        );
    }

    function formatearFecha(fecha) {
        if (!fecha) {
            return 'Sin fecha';
        }

        const fechaObj = new Date(fecha);

        return fechaObj.toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function obtenerEstado(estado) {
        return estado ? 'Activa' : 'Inactiva';
    }
</script>

<div class="container-fluid">

    <!-- Encabezado -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
            <h1 class="fw-bold mb-1">
                <i class="bi bi-cloud-arrow-up me-2"></i>
                Entregas
            </h1>

            <p class="text-muted mb-0">
                Gestiona las entregas realizadas para los avances de los trabajos de grado.
            </p>
        </div>

        <button
            class="btn btn-primary"
            onclick={abrirCrear}
        >
            <i class="bi bi-plus-lg me-1"></i>
            Nueva entrega
        </button>
    </div>

    <!-- Buscador -->
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body">
            <div class="input-group">
                <span class="input-group-text bg-white">
                    <i class="bi bi-search"></i>
                </span>

                <input
                    type="text"
                    class="form-control"
                    placeholder="Buscar por archivo, avance, comentario o ID..."
                    bind:value={busqueda}
                />
            </div>
        </div>
    </div>

    <!-- Tabla -->
    <div class="card shadow-sm border-0">
        <div class="card-body p-0">

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">

                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Avance</th>
                            <th>Versión</th>
                            <th>Archivo</th>
                            <th>Fecha de entrega</th>
                            <th>Estado</th>
                            <th class="text-center">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#if entregasFiltradas.length === 0}

                            <tr>
                                <td colspan="7" class="text-center py-5">
                                    <i class="bi bi-inbox fs-1 text-muted"></i>

                                    <p class="text-muted mt-3 mb-0">
                                        No se encontraron entregas.
                                    </p>
                                </td>
                            </tr>

                        {:else}

                            {#each entregasFiltradas as entrega}

                                <tr>
                                    <td>
                                        <span class="fw-semibold">
                                            #{entrega.id_entrega}
                                        </span>
                                    </td>

                                    <td>
                                        <div class="fw-semibold">
                                            {obtenerTituloAvance(entrega.id_avances)}
                                        </div>

                                        <small class="text-muted">
                                            ID avance: {entrega.id_avances}
                                        </small>
                                    </td>

                                    <td>
                                        <span class="badge text-bg-secondary">
                                            v{entrega.numero_version}
                                        </span>
                                    </td>

                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="bi bi-file-earmark-text fs-5"></i>

                                            <span>
                                                {entrega.nombre_archivo}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        {formatearFecha(entrega.fecha_entrega)}
                                    </td>

                                    <td>
                                        {#if entrega.estado}
                                            <span class="badge text-bg-success">
                                                Activa
                                            </span>
                                        {:else}
                                            <span class="badge text-bg-secondary">
                                                Inactiva
                                            </span>
                                        {/if}
                                    </td>

                                    <td>
                                        <div class="d-flex justify-content-center gap-1">

                                            <button
                                                class="btn btn-sm btn-outline-primary"
                                                title="Ver"
                                                onclick={() => abrirVer(entrega)}
                                            >
                                                <i class="bi bi-eye"></i>
                                            </button>

                                            <button
                                                class="btn btn-sm btn-outline-warning"
                                                title="Editar"
                                                onclick={() => abrirEditar(entrega)}
                                            >
                                                <i class="bi bi-pencil"></i>
                                            </button>

                                            <button
                                                class="btn btn-sm btn-outline-danger"
                                                title="Eliminar"
                                                onclick={() => eliminarEntrega(entrega.id_entrega)}
                                            >
                                                <i class="bi bi-trash"></i>
                                            </button>

                                        </div>
                                    </td>
                                </tr>

                            {/each}

                        {/if}
                    </tbody>

                </table>
            </div>

        </div>
    </div>

    <!-- Modal crear / editar -->
    {#if mostrarModal}

        <div
            class="modal d-block"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
        >
            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            {modoEdicion ? 'Editar entrega' : 'Nueva entrega'}
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            aria-label="Cerrar"
                            onclick={cerrarModal}
                        ></button>
                    </div>

                    <div class="modal-body">

                        <div class="row g-3">

                            <!-- Avance -->
                            <div class="col-md-6">
                                <label for="id_avances" class="form-label">
                                    Avance <span class="text-danger">*</span>
                                </label>

                                <select
                                    id="id_avances"
                                    class="form-select"
                                    bind:value={formulario.id_avances}
                                >
                                    <option value="">
                                        Seleccionar avance
                                    </option>

                                    {#each avances as avance}
                                        <option value={avance.id_avance}>
                                            {avance.titulo}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <!-- Versión -->
                            <div class="col-md-6">
                                <label for="numero_version" class="form-label">
                                    Número de versión <span class="text-danger">*</span>
                                </label>

                                <input
                                    id="numero_version"
                                    type="number"
                                    min="1"
                                    class="form-control"
                                    bind:value={formulario.numero_version}
                                />
                            </div>

                            <!-- Nombre archivo -->
                            <div class="col-md-6">
                                <label for="nombre_archivo" class="form-label">
                                    Nombre del archivo <span class="text-danger">*</span>
                                </label>

                                <input
                                    id="nombre_archivo"
                                    type="text"
                                    class="form-control"
                                    placeholder="Ej: entrega_final.pdf"
                                    bind:value={formulario.nombre_archivo}
                                />
                            </div>

                            <!-- Ruta archivo -->
                            <div class="col-md-6">
                                <label for="ruta_archivo" class="form-label">
                                    Ruta del archivo <span class="text-danger">*</span>
                                </label>

                                <input
                                    id="ruta_archivo"
                                    type="text"
                                    class="form-control"
                                    placeholder="/archivos/entregas/archivo.pdf"
                                    bind:value={formulario.ruta_archivo}
                                />
                            </div>

                            <!-- Fecha -->
                            <div class="col-md-6">
                                <label for="fecha_entrega" class="form-label">
                                    Fecha de entrega <span class="text-danger">*</span>
                                </label>

                                <input
                                    id="fecha_entrega"
                                    type="datetime-local"
                                    class="form-control"
                                    bind:value={formulario.fecha_entrega}
                                />
                            </div>

                            <!-- Estado -->
                            <div class="col-md-6">
                                <label for="estado" class="form-label">
                                    Estado
                                </label>

                                <select
                                    id="estado"
                                    class="form-select"
                                    bind:value={formulario.estado}
                                >
                                    <option value={true}>Activa</option>
                                    <option value={false}>Inactiva</option>
                                </select>
                            </div>

                            <!-- Comentarios -->
                            <div class="col-12">
                                <label for="comentarios" class="form-label">
                                    Comentarios
                                </label>

                                <textarea
                                    id="comentarios"
                                    class="form-control"
                                    rows="4"
                                    placeholder="Escribe los comentarios de la entrega..."
                                    bind:value={formulario.comentarios}
                                ></textarea>
                            </div>

                        </div>

                    </div>

                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick={cerrarModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            class="btn btn-primary"
                            onclick={guardarEntrega}
                        >
                            <i class="bi bi-save me-1"></i>

                            {modoEdicion ? 'Guardar cambios' : 'Crear entrega'}
                        </button>

                    </div>

                </div>

            </div>
        </div>

        <div class="modal-backdrop fade show"></div>

    {/if}

    <!-- Modal ver -->
    {#if mostrarModalVer && entregaSeleccionada}

        <div
            class="modal d-block"
            tabindex="-1"
            role="dialog"
            aria-modal="true"
        >
            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">
                            Detalles de la entrega
                        </h5>

                        <button
                            type="button"
                            class="btn-close"
                            aria-label="Cerrar"
                            onclick={cerrarModalVer}
                        ></button>
                    </div>

                    <div class="modal-body">

                        <div class="row g-3">

                            <div class="col-md-6">
                                <div class="border rounded p-3 h-100">
                                    <small class="text-muted">
                                        ID de entrega
                                    </small>

                                    <div class="fw-semibold mt-1">
                                        #{entregaSeleccionada.id_entrega}
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="border rounded p-3 h-100">
                                    <small class="text-muted">
                                        ID del avance
                                    </small>

                                    <div class="fw-semibold mt-1">
                                        {entregaSeleccionada.id_avances}
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="border rounded p-3">
                                    <small class="text-muted">
                                        Avance relacionado
                                    </small>

                                    <div class="fw-semibold mt-1">
                                        {obtenerTituloAvance(
                                            entregaSeleccionada.id_avances
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="border rounded p-3 h-100">
                                    <small class="text-muted">
                                        Número de versión
                                    </small>

                                    <div class="fw-semibold mt-1">
                                        v{entregaSeleccionada.numero_version}
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="border rounded p-3 h-100">
                                    <small class="text-muted">
                                        Estado
                                    </small>

                                    <div class="mt-1">
                                        {#if entregaSeleccionada.estado}
                                            <span class="badge text-bg-success">
                                                Activa
                                            </span>
                                        {:else}
                                            <span class="badge text-bg-secondary">
                                                Inactiva
                                            </span>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="border rounded p-3">
                                    <small class="text-muted">
                                        Nombre del archivo
                                    </small>

                                    <div class="fw-semibold mt-1">
                                        <i class="bi bi-file-earmark-text me-1"></i>
                                        {entregaSeleccionada.nombre_archivo}
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="border rounded p-3">
                                    <small class="text-muted">
                                        Ruta del archivo
                                    </small>

                                    <div class="mt-1 text-break">
                                        {entregaSeleccionada.ruta_archivo}
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="border rounded p-3 h-100">
                                    <small class="text-muted">
                                        Fecha de entrega
                                    </small>

                                    <div class="mt-1">
                                        {formatearFecha(
                                            entregaSeleccionada.fecha_entrega
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div class="col-12">
                                <div class="border rounded p-3">
                                    <small class="text-muted">
                                        Comentarios
                                    </small>

                                    <div class="mt-1">
                                        {entregaSeleccionada.comentarios ||
                                            'Sin comentarios.'}
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick={cerrarModalVer}
                        >
                            Cerrar
                        </button>

                    </div>

                </div>
            </div>
        </div>

        <div class="modal-backdrop fade show"></div>

    {/if}

</div>