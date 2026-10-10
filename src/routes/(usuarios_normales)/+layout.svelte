<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import NavBar from '$lib/components/NavBar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import { sesion } from '$lib/sesion.svelte.js';

    let { children } = $props();

    let esLogin = $derived(page.url.pathname === '/login');
    let autorizado = $derived(esLogin || !!sesion.usuario);

    $effect(() => {
        if (!sesion.usuario && !esLogin) {
            goto('/login');
        }
    });
</script>

{#if esLogin}
    {@render children()}
{:else if autorizado}
    <NavBar />

    <div class="d-flex bg-light min-vh-100 position-relative">
        <main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
            {@render children()}
        </main>
    </div>
    <Footer />
{/if}