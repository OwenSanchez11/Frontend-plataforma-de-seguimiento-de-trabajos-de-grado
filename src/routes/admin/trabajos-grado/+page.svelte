<script>

  import {onMount} from 'svelte';
  import {getTrabajos, getCarreras, getFacultades, crearTrabajoGrado, actualizarTrabajoGrado} from '$lib/api'
 
  let trabajos = $state([]);
  let carreras = $state([]);
  let facultades = $state([]);
  let idFacultad = $state("");
  let idCarrera = $state("");
  let cargando = $state(true);
  let error = $state(null);
  let guardando = $state(false);
  let errorFormulario =$state('');
  let desactivando = $state(false);
  let errorDesactivar = $state('');

  onMount(async () => {
    const [resTrabajos, resCarreras, resFacultades] = await Promise.allSettled([
      getTrabajos(),
      getCarreras(),
      getFacultades()
    ]);
    if (resTrabajos.status === 'fulfilled') {
      trabajos = resTrabajos.value;
    } else {
      console.error(resTrabajos.reason);
      error = resTrabajos.reason.message;
    }

    if (resCarreras.status === 'fulfilled') {
      carreras = resCarreras.value;
    }
    else {
      console.error(resCarreras.reason);
      error = resCarreras.reason.message;
    }

    if (resFacultades.status === 'fulfilled') {
      facultades = resFacultades.value;
    } else {
      console.error(resFacultades.reason);
      error = resFacultades.reason.message;
    }

    cargando = false;


  })

  let busqueda = $state("");
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

  let carrerasFiltradas = $derived(
    idFacultad
      ? carreras.filter((carrera) => Number(carrera.id_facultad) === Number(idFacultad))
      : carreras
  );

  let trabajosFiltrados = $derived(
    trabajos.filter((trabajo) => {
      const texto = busqueda.toLowerCase();
      const carreraTrabajo = carreras.find(
        (carrera) => Number(carrera.id_carrera) === Number(trabajo.id_carrera)
      );
      const coincideFacultad = !idFacultad ||
        Number(carreraTrabajo?.id_facultad) === Number(idFacultad);
      const coincideCarrera = !idCarrera ||
        Number(trabajo.id_carrera) === Number(idCarrera);
      const coincideBusqueda =
        (trabajo.titulo ?? "").toLowerCase().includes(texto) ||
        (trabajo.resumen ?? "").toLowerCase().includes(texto) ||
        (trabajo.estado_tramite ?? "").toLowerCase().includes(texto) ||
        obtenerNombreCarrera(trabajo.id_carrera).toLowerCase().includes(texto);

      return coincideFacultad && coincideCarrera && coincideBusqueda;
    })
  );

  function cambiarFacultad() {
    idCarrera = "";
  }

  function obtenerNombreCarrera(id_carrera) {
    const carrera = carreras.find(
      (item) => item.id_carrera === Number(id_carrera)
    );
    return carrera ? carrera.nombre_carrera : "Carrera no encontrada";
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


  function abrirNuevoTrabajo() {
    modoFormulario = "crear";
    errorFormulario = '';

    formulario = {
      id_carrera: "",
      titulo: "",
      resumen: "",
      linea_investigacion:"",
      estado_tramite:"En proceso",
      fecha_inicio: "",
      fecha_fin: "",
      fecha_sustentacion:"",
      observaciones_finales: "",
      estado: true
    };

    modalFormulario = true;
  }

  //función que abre cuando se presiona el icono del lapiz en el frontend, llena el formulario con los datos que ya se tiene
  function abrirEditarTrabajo(trabajo) {
    modoFormulario = "editar";
    errorFormulario = ''

    formulario = {
      id_carrera: trabajo.id_carrera,
      titulo: trabajo.titulo ?? "",
      resumen: trabajo.resumen ?? "",
      linea_investigacion: trabajo.linea_investigacion ?? "",
      estado_tramite: trabajo.estado_tramite ?? "En proceso",
      fecha_inicio: trabajo.fecha_inicio?.slice(0,10) ?? "",
      fecha_fin: trabajo.fecha_fin?.slice(0,10) ?? "",
      fecha_sustentacion: trabajo.fecha_sustentacion?.slice(0,10) ?? "",
      observaciones_finales: trabajo.observaciones_finales ?? "",
      estado: trabajo.estado
    };

    trabajoSeleccionado = trabajo;
    modalFormulario = true;
  }

  function cerrarFormulario() {
    modalFormulario = false;
    trabajoSeleccionado = null;
  }

  //función para guardar o editar trabajos, esta es la que se conecta con la API, y como el modal del frontend es el mismo, la función detecta cual es la opción que se quiere ejecutar
  async function guardarTrabajo() {
    
    if(!formulario.titulo.trim() || !formulario.id_carrera || !formulario.linea_investigacion?.trim()) {
      errorFormulario = "Completa los campos obligatorios: carrera, título y línea de investigación.";
      return;
    }


    guardando = true;
    errorFormulario = '';

    const datos = {
        id_carrera: Number(formulario.id_carrera),
        titulo: formulario.titulo.trim(),
        resumen: formulario.resumen?.trim() || null,
        linea_investigacion: formulario.linea_investigacion.trim(),
        estado_tramite: formulario.estado_tramite,
        fecha_inicio: formulario.fecha_inicio || null,
        fecha_fin: formulario.fecha_fin || null,
        fecha_sustentacion: formulario.fecha_sustentacion || null,
        observaciones_finales: formulario.observaciones_finales?.trim() || null,
        estado: formulario.estado
    };

    //aquí detecta si es editar, ejecuta la función del actualizar, sino la de crear trabajo
    try {
      if (modoFormulario === 'editar') {
        await actualizarTrabajoGrado(trabajoSeleccionado.id_trabajo_grado, datos);
      } else {
        await crearTrabajoGrado(datos);
      }

      //obtiene la lista de trabajos de grado y cierra el formulario
      trabajos = await getTrabajos();
      cerrarFormulario();
    } catch (e) {
      errorFormulario = e.message;
    } finally {
      guardando = false;
    }

  }

  function confirmarDesactivar(trabajo) {
    trabajoSeleccionado = trabajo;
    errorDesactivar = '';
    modalEliminar = true;
  }

  function cerrarEliminar() {
    modalEliminar = false;
    trabajoSeleccionado = null;
    errorDesactivar = '';
  }


  //función que sirve para actualizar el estado del trabajo(activo o inactivo) utilizando el endpoint del PUT
  async function desactivarTrabajo() {
    if (!trabajoSeleccionado) return;

    desactivando = true;
    errorDesactivar = '';

    const t = trabajoSeleccionado;

    try {
      await actualizarTrabajoGrado(t.id_trabajo_grado, {
        id_carrera: t.id_carrera,
        titulo: t.titulo,
        resumen: t.resumen,
        linea_investigacion: t.linea_investigacion,
        estado_tramite: t.estado_tramite,
        fecha_inicio: t.fecha_inicio?.slice(0, 10) || null,
        fecha_fin: t.fecha_fin?.slice(0, 10) || null,
        fecha_sustentacion: t.fecha_sustentacion?.slice(0, 10) || null,
        observaciones_finales: t.observaciones_finales,
        estado: false
      });

      trabajos = await getTrabajos();
      cerrarEliminar();
    } catch (e) {
      errorDesactivar = e.message;
    } finally {
      desactivando = false;
    }
  }


</script>


<div class="container-fluid py-4">


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

    <div class="row g-2 mt-2 align-items-center">
      <div class="col-6 col-md-5">
        <select
          class="form-select"
          aria-label="Filtrar por facultad"
          bind:value={idFacultad}
          onchange={cambiarFacultad}
        >
          <option value="">Todas las facultades</option>
          {#each facultades as facultad (facultad.id_facultad)}
            <option value={facultad.id_facultad}>{facultad.nombre_facultad}</option>
          {/each}
        </select>
      </div>

      <div class="col-6 col-md-5">
        <select class="form-select" aria-label="Filtrar por carrera" bind:value={idCarrera}>
          <option value="">Todas las carreras</option>
          {#each carrerasFiltradas as carrera (carrera.id_carrera)}
            <option value={carrera.id_carrera}>{carrera.nombre_carrera}</option>
          {/each}
        </select>
      </div>

      <div class="col-12 col-md-2 text-md-end">
        <span class="text-muted small">{trabajosFiltrados.length} trabajo(s)</span>
      </div>
    </div>

  </div>



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


          {#if cargando}
            <tr>
              <td colspan="5" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Cargando trabajos de grado...
              </td>
            </tr>

            {:else if error}
              <tr>
                <td colspan="5" class="text-center text-danger py-4">{error}</td>
              </tr>

            {:else if trabajosFiltrados.length === 0}
              <tr>
                <td colspan="5" class="text-center text-muted py-4">
                  {busqueda ? "No se encontraron trabajos de grado con esa búsqueda." : "Aún no hay trabajos de grado registrados."}
                </td>
              </tr>

          {:else}
            {#each trabajosFiltrados as trabajo (trabajo.id_trabajo_grado)}

              <tr>

                <td>

                  <div class="fw-semibold">
                    {trabajo.titulo}
                  </div>

                  <small class="text-muted">
                    ID: {trabajo.id_trabajo_grado}
                  </small>

                </td>


                <td class="text-muted small">
                  {obtenerNombreCarrera(trabajo.id_carrera)}
                </td>


                <td class="text-muted small">
                  {trabajo.estado_tramite ?? "sin estado"}
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

                  <a href={`/admin/trabajos-grado/${trabajo.id_trabajo_grado}`} class="btn btn-sm btn-light" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                  </a>


                  <button
                    class="btn btn-sm btn-light rounded-circle me-1"
                    title="Editar"
                    onclick={() => abrirEditarTrabajo(trabajo)}
                  >
                    <i class="bi bi-pencil"></i>
                  </button>


                  {#if trabajo.estado}
                    <button
                      class="btn btn-sm btn-light rounded-circle"
                      title="Desactivar"
                      onclick={() => confirmarDesactivar(trabajo)}
                    >
                      <i class="bi bi-slash-circle"></i>
                    </button>
                  {/if}

                </td>

              </tr>

            {/each }
          
          {/if}

        </tbody>

      </table>

    </div>

  </div>

</div>


<!-- ventana que abre cuando se presiona o crear o editar trabajo de grado -->
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

        {#if errorFormulario}
          <div class="alert alert-danger py-2">{errorFormulario}</div>
        {/if}


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

            {#each carreras as carrera (carrera.id_carrera)}

              <option value={carrera.id_carrera}>
                {carrera.nombre_carrera}
              </option>

            {/each}

          </select>

        </div>



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
          disabled={guardando}
          onclick={guardarTrabajo}
        >
          <i class="bi bi-check-lg me-1"></i>

          {guardando 
            ? "guardando..." : modoFormulario === "crear"
            ? "Crear Trabajo"
            : "Guardar Cambios"}

        </button>

      </div>

    </div>

  </div>

{/if}


<!-- ventana que se abre para desactivar un trabajo -->
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
        <i class="bi bi-slash-circle"></i>
      </div>

      <h6 id="titulo-eliminar" class="fw-bold">¿Desactivar trabajo de grado?</h6>

      <p class="fw-semibold">{trabajoSeleccionado.titulo}</p>

      <p class="text-muted small">
        Quedará inactivo, pero se conservarán sus avances y su historial.
        Podrás reactivarlo editándolo.
      </p>

      {#if errorDesactivar}
        <div class="alert alert-danger py-2 small">{errorDesactivar}</div>
      {/if}

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
          disabled={desactivando}
          onclick={desactivarTrabajo}
        >
          <i class="bi bi-slash-circle me-1"></i>
          {desactivando ? "Desactivando..." : "Desactivar"}
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
