<script>
  let { titulo, icono = 'bi-flag', tono = 'primary', children, pie } = $props();
</script>

<div class="card h-100 border-0 shadow-sm rounded-4">
  <div class="card-body d-flex flex-column">
    <div class="d-flex justify-content-between align-items-start mb-3">
      <small class="text-uppercase text-secondary fw-semibold">{titulo}</small>
      <span class="icono bg-{tono}-subtle text-{tono}">
        <i class="bi {icono}"></i>
      </span>
    </div>

    <div class="flex-grow-1">{@render children()}</div>

    {#if pie}
      <small class="text-secondary mt-2">{@render pie()}</small>
    {/if}
  </div>
</div>

<style>
  .icono {
    width: 40px; height: 40px;
    display: grid; place-items: center;
    border-radius: 10px;
  }
</style>