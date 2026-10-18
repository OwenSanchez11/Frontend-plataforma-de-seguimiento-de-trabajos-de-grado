<script>
  import { onMount } from 'svelte';
  import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

  let { columnas, filas = [], onAccion } = $props();

  let tablaEl;
  let dt; 

  onMount(() => {
    let destruido = false;

    (async () => {
      const { default: DataTable } = await import('datatables.net-bs5');
      if (destruido) return;

      dt = new DataTable(tablaEl, {
        data: $state.snapshot(filas),
        columns: columnas,
        language: {
          search: 'Buscar:',
          lengthMenu: 'Mostrar _MENU_ registros',
          info: 'Mostrando _START_ a _END_ de _TOTAL_',
          infoEmpty: 'Sin registros',
          zeroRecords: 'Sin resultados',
          emptyTable: 'Sin datos',
          paginate: { next: 'Siguiente', previous: 'Anterior' }
        }
      });
    })();

   const alClic = (e) => {
    const btn = e.target.closest('button[data-accion]');
    if (btn) onAccion?.(btn.dataset.accion, btn.dataset.id);
   };
   tablaEl.addEventListener('click', alClic);

   return () => {
    destruido = true;
    tablaEl.removeEventListener('click', alClic);
    dt?.destroy();
   }
});

$effect(() => {
    const datos = $state.snapshot(filas);
    if (dt) {
        dt.clear();
        dt.rows.add(datos);
        dt.draw(false);
    }
})


</script>

<table bind:this={tablaEl} class="table table-striped table-hover align-middle mb-0" style="width:100%"></table>
