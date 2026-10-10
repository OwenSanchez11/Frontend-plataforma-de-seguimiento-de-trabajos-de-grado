<script>
    import BannerBienvenida from '$lib/components/BannerBienvenida.svelte';
    import { proyectoActual, sesion } from '$lib/sesion.svelte';
</script>

<div class="d-flex bg-light min-vh-100">


    <main class="flex-grow-1 p-4 overflow-x-hidden">
        <BannerBienvenida usuario={sesion.usuario} proyecto={proyectoActual()} />
    </main>
</div>
