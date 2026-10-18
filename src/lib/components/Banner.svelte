<script>
  let { etiqueta = '', titulo, descripcion = '', stats = [], acciones } = $props();
</script>

<section class="hero text-white rounded-4 overflow-hidden mb-4">
  <div class="p-4 p-lg-5 d-flex flex-column flex-lg-row justify-content-between gap-4">
    <div class="hero-texto">
      {#if etiqueta}
        <span class="badge hero-etiqueta mb-3">{etiqueta}</span>
      {/if}
      <h1 class="fw-bold">{titulo}</h1>
      {#if descripcion}<p class="opacity-75 mb-0">{descripcion}</p>{/if}
    </div>

    {#if acciones}
      <div class="d-flex gap-2 align-items-start flex-wrap">
        {@render acciones()}
      </div>
    {/if}
  </div>

  {#if stats.length}
    <div class="row g-0 hero-stats">
      {#each stats as s}
        <div class="col-6 col-lg p-3 border-top border-light border-opacity-10">
          <small class="text-uppercase opacity-75">{s.etiqueta}</small>
          <div class="fs-2 fw-bold">{s.valor}</div>
          {#if s.porcentaje != null}
            <div class="progress" style="height:4px">
              <div class="progress-bar" style="width:{s.porcentaje}%; background:{s.color ?? '#f59e0b'}"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .hero { background: linear-gradient(135deg, #0b1f44, #12356b); }
  .hero-texto { max-width: 520px; }
  .hero-etiqueta { background: rgba(255,255,255,.1); }
  .hero-stats { background: rgba(0,0,0,.2); }
</style>