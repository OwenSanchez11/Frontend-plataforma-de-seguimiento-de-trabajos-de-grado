<script>
    import { page } from '$app/stores'; 
    import NavBar from '$lib/components/NavBar.svelte';
    import Footer from '$lib/components/Footer.svelte';

    let { children } = $props();

    let sidebarOpen = $state(false);

    let esLogin = $derived($page.url.pathname === '/login');
</script>

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
