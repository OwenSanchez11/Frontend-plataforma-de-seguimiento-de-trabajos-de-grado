<script>
    import { page } from '$app/state';
    import AdminNavbar from '$lib/components/AdminNavbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import Guard from '$lib/components/Guard.svelte';

    let { children } = $props();
    const esTablero = $derived(page.route.id === '/admin/tablero-datos');

</script>

<Guard roles={['administrador']}>
    <div class={esTablero ? 'tablero-pantalla' : 'd-contents'}>
        <AdminNavbar />
        <div class={esTablero ? 'tablero-contenido' : 'd-flex bg-light min-vh-100 position-relative'}>
            <main class={esTablero ? 'h-100' : 'flex-grow-1 p-3 p-md-4 overflow-x-hidden'}>
                {@render children()}
            </main>
        </div>
        {#if !esTablero}<Footer />{/if}
    </div>
</Guard>

<style>
    .d-contents {
        display: contents;
    }
</style>
