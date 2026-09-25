<script>
  import { page } from '$app/stores';

  const roles = [
    { nombre: 'Admin', ruta: '/admin/usuarios' },
    { nombre: 'Coordinador', ruta: '/coordinador' },
    { nombre: 'Usuario Normal (Docente/Estudiante)', ruta: '/' }
  ];

  let abierto = $state(false);

  let rolSiguiente = $derived.by(() => {
    const rutaActual = $page.url.pathname;
    const indiceActual = rutaActual.startsWith('/admin')
      ? 0
      : rutaActual.startsWith('/coordinador')
        ? 1
        : 2;

    return roles[(indiceActual + 1) % roles.length];
  });

</script>

<div class="dev-role-switcher">
  <div class="btn-group">
    <a class="btn btn-dark btn-sm" href={rolSiguiente.ruta}>
      Cambiar a {rolSiguiente.nombre}
    </a>
    <button
      class="btn btn-dark btn-sm dropdown-toggle dropdown-toggle-split"
      aria-label="Elegir una vista"
      aria-expanded={abierto}
      onclick={() => (abierto = !abierto)}
    ></button>
  </div>

  {#if abierto}
    <ul class="list-group position-absolute bottom-100 end-0 mb-2">
      {#each roles as rol}
        <li class="list-group-item">
          <a href={rol.ruta} onclick={() => (abierto = false)}>{rol.nombre}</a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .dev-role-switcher {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1030;
  }
</style>
