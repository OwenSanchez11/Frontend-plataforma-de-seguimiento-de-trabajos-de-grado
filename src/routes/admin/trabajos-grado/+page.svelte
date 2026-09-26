<script>
  let trabajos = $state([
    {
      id: 1,
      id_carrera: 1,
      titulo: "Sistema de seguimiento de trabajos de grado",
      resumen: "Plataforma web para realizar seguimiento a los trabajos de grado.",
      linea_investigacion: "Desarrollo de software",
      estado_tramite: "En proceso",
      fecha_inicio: "2026-02-10",
      fecha_fin: "",
      fecha_sustentacion: "",
      observaciones_finales: "",
      estado: true
    },
    {
      id: 2,
      id_carrera: 2,
      titulo: "Plataforma web para gestión académica",
      resumen: "Sistema orientado a mejorar la gestión de procesos académicos.",
      linea_investigacion: "Tecnologías de la información",
      estado_tramite: "En proceso",
      fecha_inicio: "2026-03-15",
      fecha_fin: "",
      fecha_sustentacion: "",
      observaciones_finales: "",
      estado: true
    },
    {
      id: 3,
      id_carrera: 3,
      titulo: "Sistema de gestión de proyectos",
      resumen: "Aplicación para administrar proyectos universitarios.",
      linea_investigacion: "Ingeniería de software",
      estado_tramite: "Finalizado",
      fecha_inicio: "2025-08-20",
      fecha_fin: "2026-05-20",
      fecha_sustentacion: "2026-06-05",
      observaciones_finales: "Trabajo aprobado.",
      estado: true
    }
  ]);

  let carreras = $state([
    {
      id: 1,
      nombre: "Ingeniería de Sistemas"
    },
    {
      id: 2,
      nombre: "Ingeniería Industrial"
    },
    {
      id: 3,
      nombre: "Ingeniería Electrónica"
    }
  ]);

  let busqueda = $state("");
  let modalAbierto = $state(false);
  let modalFormulario = $state(false);
  let modalEliminar = $state(false);

  let trabajoSeleccionado = $state(null);
  let modoFormulario = $state("crear");

  let formulario = $state({
    id_carrera: "",
    titulo: "",
    resumen: "",
    linea_investigacion: "",
    estado_tramite: "En proceso",
    fecha_inicio: "",
    fecha_fin: "",
    fecha_sustentacion: "",
    observaciones_finales: "",
    estado: true
  });

  let trabajosFiltrados = $derived(
    trabajos.filter((trabajo) => {
      const texto = busqueda.toLowerCase();

      return (
        trabajo.titulo.toLowerCase().includes(texto) ||
        trabajo.resumen.toLowerCase().includes(texto) ||
        trabajo.linea_investigacion.toLowerCase().includes(texto) ||
        trabajo.estado_tramite.toLowerCase().includes(texto) ||
        obtenerNombreCarrera(trabajo.id_carrera)
          .toLowerCase()
          .includes(texto)
      );
    })
  );

  function obtenerNombreCarrera(idCarrera) {
    const carrera = carreras.find(
      (item) => item.id === Number(idCarrera)
    );

    return carrera ? carrera.nombre : "Carrera no encontrada";
  }

  function obtenerClaseEstado(trabajo) {
    if (trabajo.estado_tramite === "Finalizado") {
      return "text-bg-success";
    }

    if (trabajo.estado_tramite === "Cancelado") {
      return "text-bg-danger";
    }

    return "text-bg-primary";
  }

  function verTrabajo(trabajo) {
    trabajoSeleccionado = trabajo;
    modalAbierto = true;
  }

  function cerrarModal() {
    modalAbierto = false;
    trabajoSeleccionado = null;
  }

  function abrirNuevoTrabajo() {
    modoFormulario = "crear";

    formulario = {
      id_carrera: "",
      titulo: "",
      resumen: "",
      linea_investigacion: "",
      estado_tramite: "En proceso",
      fecha_inicio: "",
      fecha_fin: "",
      fecha_sustentacion: "",
      observaciones_finales: "",
      estado: true
    };

    modalFormulario = true;
  }

  function abrirEditarTrabajo(trabajo) {
    modoFormulario = "editar";

    formulario = {
      id_carrera: trabajo.id_carrera,
      titulo: trabajo.titulo,
      resumen: trabajo.resumen,
      linea_investigacion: trabajo.linea_investigacion,
      estado_tramite: trabajo.estado_tramite,
      fecha_inicio: trabajo.fecha_inicio,
      fecha_fin: trabajo.fecha_fin,
      fecha_sustentacion: trabajo.fecha_sustentacion,
      observaciones_finales: trabajo.observaciones_finales,
      estado: trabajo.estado
    };

    trabajoSeleccionado = trabajo;
    modalFormulario = true;
  }

  function cerrarFormulario() {
    modalFormulario = false;
    trabajoSeleccionado = null;
  }

  function guardarTrabajo() {
    if (
      !formulario.titulo.trim() ||
      !formulario.id_carrera ||
      !formulario.linea_investigacion.trim()
    ) {
      alert("Completa los campos obligatorios.");
      return;
    }

    if (modoFormulario === "crear") {
      const nuevoTrabajo = {
        id: trabajos.length > 0
          ? Math.max(...trabajos.map((trabajo) => trabajo.id)) + 1
          : 1,
        id_carrera: Number(formulario.id_carrera),
        titulo: formulario.titulo,
        resumen: formulario.resumen,
        linea_investigacion: formulario.linea_investigacion,
        estado_tramite: formulario.estado_tramite,
        fecha_inicio: formulario.fecha_inicio,
        fecha_fin: formulario.fecha_fin,
        fecha_sustentacion: formulario.fecha_sustentacion,
        observaciones_finales: formulario.observaciones_finales,
        estado: formulario.estado
      };

      trabajos = [...trabajos, nuevoTrabajo];

    } else {
      trabajos = trabajos.map((trabajo) => {
        if (trabajo.id === trabajoSeleccionado.id) {
          return {
            ...trabajo,
            id_carrera: Number(formulario.id_carrera),
            titulo: formulario.titulo,
            resumen: formulario.resumen,
            linea_investigacion: formulario.linea_investigacion,
            estado_tramite: formulario.estado_tramite,
            fecha_inicio: formulario.fecha_inicio,
            fecha_fin: formulario.fecha_fin,
            fecha_sustentacion: formulario.fecha_sustentacion,
            observaciones_finales: formulario.observaciones_finales,
            estado: formulario.estado
          };
        }

        return trabajo;
      });
    }

    cerrarFormulario();
  }

  function confirmarEliminar(trabajo) {
    trabajoSeleccionado = trabajo;
    modalEliminar = true;
  }

  function cerrarEliminar() {
    modalEliminar = false;
    trabajoSeleccionado = null;
  }

  function eliminarTrabajo() {
    trabajos = trabajos.filter(
      (trabajo) => trabajo.id !== trabajoSeleccionado.id
    );

    cerrarEliminar();
  }

  function cerrarModalConTeclado(event) {
    if (event.key === "Enter" || event.key === " ") {
      cerrarModal();
    }
  }
</script>


<div class="container-fluid py-4">

  <!-- ENCABEZADO -->

  <div class="d-flex justify-content-between align-items-center mb-4">

    <div>
      <h4 class="fw-bold mb-0">
        Gestión de Trabajos de Grado
      </h4>

      <p class="text-muted small mb-0">
        Consulta y administra los trabajos de grado registrados en la plataforma
      </p>
    </div>

    <button
      class="btn btn-primary"
      onclick={abrirNuevoTrabajo}
    >
      <i class="bi bi-plus-lg me-1"></i>
      Nuevo Trabajo
    </button>

  </div>


  <!-- BUSCADOR -->

  <div class="card border-0 shadow-sm rounded-4 p-3 mb-3">

    <div class="input-group">

      <span class="input-group-text bg-white border-end-0">
        <i class="bi bi-search"></i>
      </span>

      <input
        type="text"
        class="form-control border-start-0"
        placeholder="Buscar por título, carrera o estado..."
        bind:value={busqueda}
      />

    </div>

  </div>


  <!-- TABLA -->

  <div class="card border-0 shadow-sm rounded-4 p-3">

    <div class="table-responsive">

      <table class="table align-middle mb-0">

        <thead>

          <tr class="text-muted small text-uppercase">

            <th>Trabajo de Grado</th>
            <th>Carrera</th>
            <th>Estado del trámite</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>

          </tr>

        </thead>


        <tbody>

          {#each trabajosFiltrados as trabajo (trabajo.id)}

            <tr>

              <td>

                <div class="fw-semibold">
                  {trabajo.titulo}
                </div>

                <small class="text-muted">
                  ID: {trabajo.id}
                </small>

              </td>


              <td class="text-muted small">
                {obtenerNombreCarrera(trabajo.id_carrera)}
              </td>


              <td class="text-muted small">
                {trabajo.estado_tramite}
              </td>


              <td>

                <span
                  class="badge rounded-pill
                  {trabajo.estado
                    ? obtenerClaseEstado(trabajo)
                    : 'text-bg-secondary'}"
                >
                  {trabajo.estado
                    ? trabajo.estado_tramite
                    : "Inactivo"}
                </span>

              </td>


              <td class="text-end">

                <button
                  class="btn btn-sm btn-light rounded-circle me-1"
                  title="Ver detalles"
                  onclick={() => verTrabajo(trabajo)}
                >
                  <i class="bi bi-eye"></i>
                </button>


                <button
                  class="btn btn-sm btn-light rounded-circle me-1"
                  title="Editar"
                  onclick={() => abrirEditarTrabajo(trabajo)}
                >
                  <i class="bi bi-pencil"></i>
                </button>


                <button
                  class="btn btn-sm btn-light rounded-circle"
                  title="Eliminar"
                  onclick={() => confirmarEliminar(trabajo)}
                >
                  <i class="bi bi-trash"></i>
                </button>

              </td>

            </tr>

          {/each }


          {#if trabajosFiltrados.length === 0}

            <tr>

              <td
                colspan="5"
                class="text-center text-muted py-4"
              >
                No se encontraron trabajos de grado con esa búsqueda.
              </td>

            </tr>

          {/if}

        </tbody>

      </table>

    </div>

  </div>

</div>


<!-- MODAL DETALLES -->

{#if modalAbierto && trabajoSeleccionado}

  <div
    class="modal-backdrop-custom"
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    onclick={cerrarModal}
    onkeydown={cerrarModalConTeclado}
  >

    <div
      class="modal-content-custom"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-trabajo"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >

      <div class="d-flex justify-content-between align-items-center mb-3">

        <h6
          id="titulo-modal-trabajo"
          class="fw-bold mb-0"
        >
          Detalles del Trabajo
        </h6>

        <button
          type="button"
          class="btn-close"
          aria-label="Cerrar modal"
          onclick={cerrarModal}
        ></button>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Título
        </small>

        <span class="fw-semibold">
          {trabajoSeleccionado.titulo}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Carrera
        </small>

        <span>
          {obtenerNombreCarrera(
            trabajoSeleccionado.id_carrera
          )}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Resumen
        </small>

        <span>
          {trabajoSeleccionado.resumen ||
            "Sin resumen registrado"}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Línea de investigación
        </small>

        <span>
          {trabajoSeleccionado.linea_investigacion}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Estado del trámite
        </small>

        <span>
          {trabajoSeleccionado.estado_tramite}
        </span>

      </div>


      <div class="mb-3">

        <small class="text-muted d-block">
          Fecha de inicio
        </small>

        <span>
          {trabajoSeleccionado.fecha_inicio ||
            "No registrada"}
        </span>

      </div>


      <div>

        <small class="text-muted d-block">
          Estado
        </small>

        <span
          class="badge rounded-pill
          {trabajoSeleccionado.estado
            ? obtenerClaseEstado(trabajoSeleccionado)
            : 'text-bg-secondary'}"
        >
          {trabajoSeleccionado.estado
            ? trabajoSeleccionado.estado_tramite
            : "Inactivo"}
        </span>

      </div>

    </div>

  </div>

{/if}


<!-- MODAL CREAR / EDITAR -->

{#if modalFormulario}

  <div class="modal-backdrop-custom">

    <div
      class="modal-content-custom modal-formulario"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-formulario"
    >

      <div class="d-flex justify-content-between align-items-center mb-3">

        <h6
          id="titulo-formulario"
          class="fw-bold mb-0"
        >
          {modoFormulario === "crear"
            ? "Nuevo Trabajo de Grado"
            : "Editar Trabajo de Grado"}
        </h6>

        <button
          type="button"
          class="btn-close"
          aria-label="Cerrar"
          onclick={cerrarFormulario}
        ></button>

      </div>


      <div class="row g-3">

        <!-- CARRERA -->

        <div class="col-12">

          <label class="form-label fw-semibold">
            Carrera *
          </label>

          <select
            class="form-select"
            bind:value={formulario.id_carrera}
          >

            <option value="">
              Selecciona una carrera
            </option>

            {#each carreras as carrera}

              <option value={carrera.id}>
                {carrera.nombre}
              </option>

            {/each}

          </select>

        </div>


        <!-- TÍTULO -->

        <div class="col-12">

          <label class="form-label fw-semibold">
            Título *
          </label>

          <input
            type="text"
            class="form-control"
            placeholder="Título del trabajo de grado"
            bind:value={formulario.titulo}
          />

        </div>


        <!-- RESUMEN -->

        <div class="col-12">

          <label class="form-label fw-semibold">
            Resumen
          </label>

          <textarea
            class="form-control"
            rows="3"
            placeholder="Resumen del trabajo"
            bind:value={formulario.resumen}
          ></textarea>

        </div>


        <!-- LÍNEA DE INVESTIGACIÓN -->

        <div class="col-12">

          <label class="form-label fw-semibold">
            Línea de investigación *
          </label>

          <input
            type="text"
            class="form-control"
            placeholder="Línea de investigación"
            bind:value={formulario.linea_investigacion}
          />

        </div>


        <!-- ESTADO DEL TRÁMITE -->

        <div class="col-md-6">

          <label class="form-label fw-semibold">
            Estado del trámite
          </label>

          <select
            class="form-select"
            bind:value={formulario.estado_tramite}
          >

            <option value="En proceso">
              En proceso
            </option>

            <option value="Finalizado">
              Finalizado
            </option>

            <option value="Cancelado">
              Cancelado
            </option>

          </select>

        </div>


        <!-- ESTADO -->

        <div class="col-md-6">

          <label class="form-label fw-semibold">
            Estado
          </label>

          <select
            class="form-select"
            bind:value={formulario.estado}
          >

            <option value={true}>
              Activo
            </option>

            <option value={false}>
              Inactivo
            </option>

          </select>

        </div>


        <!-- FECHA INICIO -->

        <div class="col-md-6">

          <label class="form-label fw-semibold">
            Fecha de inicio
          </label>

          <input
            type="date"
            class="form-control"
            bind:value={formulario.fecha_inicio}
          />

        </div>


        <!-- FECHA FIN -->

        <div class="col-md-6">

          <label class="form-label fw-semibold">
            Fecha de finalización
          </label>

          <input
            type="date"
            class="form-control"
            bind:value={formulario.fecha_fin}
          />

        </div>


        <!-- FECHA SUSTENTACIÓN -->

        <div class="col-12">

          <label class="form-label fw-semibold">
            Fecha de sustentación
          </label>

          <input
            type="date"
            class="form-control"
            bind:value={formulario.fecha_sustentacion}
          />

        </div>


        <!-- OBSERVACIONES -->

        <div class="col-12">

          <label class="form-label fw-semibold">
            Observaciones finales
          </label>

          <textarea
            class="form-control"
            rows="3"
            placeholder="Observaciones finales"
            bind:value={formulario.observaciones_finales}
          ></textarea>

        </div>

      </div>


      <div class="d-flex justify-content-end gap-2 mt-4">

        <button
          type="button"
          class="btn btn-light"
          onclick={cerrarFormulario}
        >
          Cancelar
        </button>

        <button
          type="button"
          class="btn btn-primary"
          onclick={guardarTrabajo}
        >
          <i class="bi bi-check-lg me-1"></i>

          {modoFormulario === "crear"
            ? "Crear Trabajo"
            : "Guardar Cambios"}

        </button>

      </div>

    </div>

  </div>

{/if}


<!-- MODAL ELIMINAR -->

{#if modalEliminar && trabajoSeleccionado}

  <div class="modal-backdrop-custom">

    <div
      class="modal-content-custom modal-confirmacion"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-eliminar"
    >

      <div class="text-center">

        <div class="icono-eliminar mb-3">
          <i class="bi bi-trash"></i>
        </div>

        <h6
          id="titulo-eliminar"
          class="fw-bold"
        >
          ¿Eliminar trabajo de grado?
        </h6>

        <p class="text-muted small">
          Estás a punto de eliminar:
        </p>

        <p class="fw-semibold">
          {trabajoSeleccionado.titulo}
        </p>

        <p class="text-muted small">
          Esta acción solo afecta los datos ficticios
          del frontend.
        </p>

      </div>


      <div class="d-flex justify-content-center gap-2 mt-4">

        <button
          type="button"
          class="btn btn-light"
          onclick={cerrarEliminar}
        >
          Cancelar
        </button>

        <button
          type="button"
          class="btn btn-danger"
          onclick={eliminarTrabajo}
        >
          <i class="bi bi-trash me-1"></i>
          Eliminar
        </button>

      </div>

    </div>

  </div>

{/if}


<style>

  .modal-backdrop-custom {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 1rem;
  }

  .modal-content-custom {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-formulario {
    max-width: 700px;
  }

  .modal-confirmacion {
    max-width: 450px;
  }

  .icono-eliminar {
    width: 55px;
    height: 55px;
    margin: 0 auto;
    border-radius: 50%;
    background: #f8d7da;
    color: #dc3545;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
  }

</style>