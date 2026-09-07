<script>
    import { page } from '$app/stores'; // <-- CAMBIO CLAVE: Usar $app/stores
    import favicon from '$lib/assets/favicon.svg';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import '../app.css';
    import NavBar from '$lib/components/NavBar.svelte';
    import Footer from '$lib/components/Footer.svelte';

    let { children } = $props();

    let sidebarOpen = $state(false);

    let esLogin = $derived($page.url.pathname === '/login');
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link 
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    />
</svelte:head>

{#if esLogin}
    {@render children()}
{:else}
    <NavBar />

    <div class="d-flex bg-light min-vh-100 position-relative">

        <main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">


            {@render children()}
        </main>
    </div>
    <Footer></Footer>
{/if}