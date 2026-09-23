<script>
    let { trabajoSeleccionado = { titulo: 'Sistema de Inventarios', estudiante: 'Juan Pérez' } } = $props();

    let docentesDisponibles = [
        {id: 1, nombre: 'Carlos Ramirez'},
        {id: 2, nombre: 'Maria Torres'},
        {id: 3, nombre: 'Luis Fernandez'}
    ]

    let busquedaDirector = $state('');
    let directorAsignado = $state(null);


          // Jurado 1
    let busquedaJurado1 = $state('');
    let jurado1Asignado = $state(null);
    let campoJurado1Enfocado = $state(false);

        // Jurado 2
    let busquedaJurado2 = $state('');
    let jurado2Asignado = $state(null);
    let campoJurado2Enfocado = $state(false);

    let campoEnfocado = $state(false);


    function seleccionarDirector(docente) {
        directorAsignado = docente;
        busquedaDirector = '';
    }


    let resultadosDirector = $derived(
        (busquedaDirector.length > 0
            ? docentesDisponibles.filter(d =>
                d.nombre.toLowerCase().includes(busquedaDirector.toLowerCase())
            )
            : campoEnfocado
            ? docentesDisponibles
            : []
        ).filter(d =>
            d.id !== jurado1Asignado?.id && d.id !== jurado2Asignado?.id
        )
    );

        let resultadosJurado1 = $derived(
            (busquedaJurado1.length > 0
                ? docentesDisponibles.filter(d =>
                    d.nombre.toLowerCase().includes(busquedaJurado1.toLowerCase())
                )
                : campoJurado1Enfocado
                ? docentesDisponibles
                : []
            ).filter(d =>
                d.id !== directorAsignado?.id && d.id !== jurado2Asignado?.id
            )
        );

        let resultadosJurado2 = $derived(
            (busquedaJurado2.length > 0
                ? docentesDisponibles.filter(d =>
                    d.nombre.toLowerCase().includes(busquedaJurado2.toLowerCase())
                )
                : campoJurado2Enfocado
                ? docentesDisponibles
                : []
            ).filter(d =>
                d.id !== directorAsignado?.id && d.id !== jurado1Asignado?.id
            )
        );
</script>

<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Trabajo de grado seleccionado</h6>
        <p class="mb-1"><strong>Titulo : </strong>{trabajoSeleccionado.titulo}</p>
        <p class="mb-1"><strong>Estudiante : </strong>{trabajoSeleccionado.estudiante}</p>
    </div>

</section>

<section class="card mb-4">
    <div class="card-body">
    <h6 class="fw-bold">Asignar director / asesor (Buscar docente)</h6>
        {#if directorAsignado}
            <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary">{directorAsignado.nombre}</span>
                <button class="btn btn-sm btn-outline-danger" onclick={() => directorAsignado = null}>Quitar</button>
            </div>
        {:else}
            <input
                type="text"
                class="form-control"
                placeholder="Escribe el nombre del docente..."
                bind:value={busquedaDirector}
                onfocus={() => campoEnfocado = true}
                onblur={() => setTimeout(() => campoEnfocado = false, 150)}
            />
            {#if resultadosDirector.length > 0}
                <ul class="list-group mt-2">
                    {#each resultadosDirector as docente }
                        <li class="list-group-item" style="cursor: pointer;" onclick={() => seleccionarDirector(docente)}>{docente.nombre}</li>
                    {/each}
                </ul>
            {/if}
        {/if}
    </div>
</section>

<section class="card mb-4">
  <div class="card-body">
    <h6 class="fw-bold">Asignar Jurado(s) (buscar docente)</h6>
    <div class="row g-3">

      <!-- Jurado 1 -->
      <div class="col-md-6">
        {#if jurado1Asignado}
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary">{jurado1Asignado.nombre}</span>
            <button class="btn btn-sm btn-outline-danger" onclick={() => jurado1Asignado = null}>Quitar</button>
          </div>
        {:else}
          <input
            type="text"
            class="form-control"
            placeholder="Buscar jurado 1..."
            bind:value={busquedaJurado1}
            onfocus={() => campoJurado1Enfocado = true}
            onblur={() => setTimeout(() => campoJurado1Enfocado = false, 150)}
          />
          {#if resultadosJurado1.length > 0}
            <ul class="list-group mt-2">
              {#each resultadosJurado1 as docente}
                <li class="list-group-item" style="cursor: pointer;"
                    onclick={() => { jurado1Asignado = docente; busquedaJurado1 = ''; }}>
                  {docente.nombre}
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>

      <!-- Jurado 2 -->
      <div class="col-md-6">
        {#if jurado2Asignado}
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-primary">{jurado2Asignado.nombre}</span>
            <button class="btn btn-sm btn-outline-danger" onclick={() => jurado2Asignado = null}>Quitar</button>
          </div>
        {:else}
          <input
            type="text"
            class="form-control"
            placeholder="Buscar jurado 2..."
            bind:value={busquedaJurado2}
            onfocus={() => campoJurado2Enfocado = true}
            onblur={() => setTimeout(() => campoJurado2Enfocado = false, 150)}
          />
          {#if resultadosJurado2.length > 0}
            <ul class="list-group mt-2">
              {#each resultadosJurado2 as docente}
                <li class="list-group-item" style="cursor: pointer;"
                    onclick={() => { jurado2Asignado = docente; busquedaJurado2 = ''; }}>
                  {docente.nombre}
                </li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>

    </div>
  </div>
</section>







