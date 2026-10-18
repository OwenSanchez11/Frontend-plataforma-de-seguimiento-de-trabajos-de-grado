<script>
    import { page } from '$app/stores'; 
    import AdminNavbar from '$lib/components/AdminNavbar.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import Guard from '$lib/components/Guard.svelte';

    let { children } = $props();

    let sidebarOpen = $state(false);

    let esLogin = $derived($page.url.pathname === '/login');
</script>

<Guard roles={['administrador']}>
     <AdminNavbar />
    <div class="d-flex bg-light min-vh-100 position-relative">
        <main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
            {@render children()}
        </main>
    </div>
    <Footer />
</Guard>