<script>
     import { page } from '$app/state';

    let { sidebarOpen = $bindable(false) } = $props();
    let rutaActiva = 'dashboard';

    function cerrarSidebar() {
        sidebarOpen = false;
    }

    const menuPrincipal = [
        { id: 'dashboard', name: 'Dashboard / Inicio', icon: 'bi-grid-1x2-fill', href: '/' },
        { id: 'trabajo', name: 'Mi Trabajo de Grado', icon: 'bi-journal-text', href: '/trabajoGrado' },
        { id: 'hitos', name: 'Avances & Cronograma', icon: 'bi-calendar-check',  href: '/hitos'},
        { id: 'entregas', name: 'Entregas & Documentos', icon: 'bi-folder2-open',  href: '/entregas' },
        { id: 'retro', name: 'Retroalimentaciones & Jurados', icon: 'bi-chat-left-text',  href: '/retroalimentaciones' },
        { id: 'calendario', name: 'Calendario Académico', icon: 'bi-calendar3',  href: '#' },
        { id: 'notificaciones', name: 'Notificaciones', icon: 'bi-bell', badge: '3',  href: '#' }
    ];

    const menuRecursos = [
        { id: 'guias', name: 'Guías y Normativas APA', icon: 'bi-book',  href: '#' },
        { id: 'soporte', name: 'Mesa de Ayuda TI', icon: 'bi-headset' ,  href: '#'}
    ];
</script>


{#if sidebarOpen}
    <div
        class="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style="z-index: 1044;"
        onclick={cerrarSidebar}
        role="presentation"
    ></div>
{/if}

<aside class="sidebar-container bg-white border-end d-flex flex-column p-3 {sidebarOpen ? 'sidebar-open' : ''}">
    <div class="sidebar-scroll flex-grow-1 overflow-auto">
        <!-- Botón de cerrar dentro del sidebar (solo móvil) -->
        <div class="d-lg-none d-flex justify-content-end mb-2">
            <button class="btn btn-sm btn-light border-0 text-muted" onclick={cerrarSidebar} aria-label="Cerrar menú">
                <i class="bi bi-x-lg fs-5"></i>
            </button>
        </div>

        <!-- Periodo lectivo -->
        <div class="bg-light rounded-3 p-2 d-flex align-items-center justify-content-between mb-4 border">
            <span class="extra-small text-muted fw-bold text-uppercase">Periodo Lectivo</span>
            <span class="badge bg-white text-primary border fw-semibold">2025-II</span>
        </div>

        <!-- Menú principal -->
        <div class="mb-4">
            <span class="extra-small text-muted fw-bold text-uppercase px-2 mb-2 d-block">Principal</span>
            <ul class="nav nav-pills flex-column gap-1">
                {#each menuPrincipal as item}
                    <li class="nav-item">
                        <a
                            href={item.href}
                            onclick={cerrarSidebar}
                            class="nav-link w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 small fw-medium rounded-3 {page.url.pathname === item.href ? 'active bg-primary text-white' : 'text-secondary btn-hover'}"
                        >
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi {item.icon} fs-6"></i>
                                <span>{item.name}</span>
                            </div>

                            {#if item.badge}
                                <span class="badge rounded-pill bg-danger extra-small">{item.badge}</span>
                            {/if}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- Sección Recursos & Ayuda -->
        <div>
            <span class="extra-small text-muted fw-bold text-uppercase px-2 mb-2 d-block">Recursos & Ayuda</span>
            <ul class="nav nav-pills flex-column gap-1">
                {#each menuRecursos as item}
                    <li class="nav-item">
                        <button
                            class="nav-link w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 small fw-medium rounded-3 {rutaActiva === item.id ? 'active bg-primary text-white' : 'text-secondary btn-hover'}"
                            onclick={() => {
                                rutaActiva = item.id;
                                cerrarSidebar();
                            }}
                        >
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi {item.icon} fs-6"></i>
                                <span>{item.name}</span>
                            </div>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>

    <!-- Pie del Sidebar (fijo, fuera del área con scroll) -->
    <div class="border-top pt-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
            <div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                <i class="bi bi-person-fill"></i>
            </div>
            <div class="lh-1">
                <span class="fw-bold text-dark d-block extra-small">Owen Sanchez</span>
                <small class="text-muted extra-small">Estudiante - Ing. Sistemas y computación</small>
            </div>
        </div>
        <button class="btn btn-sm btn-light border-0 text-muted p-1" aria-label="Configuración">
            <i class="bi bi-gear"></i>
        </button>
    </div>
</aside>

<style>
    .sidebar-container {
        width: 260px;
        flex-shrink: 0;
        /* Garantiza altura fija a la pantalla y soporte para scroll si la pantalla es muy baja */
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
    }

    .sidebar-scroll {
        overflow-y: auto;
        overflow-x: hidden;
    }

    /* Opcional: que la barra de scroll se vea más discreta */
    .sidebar-scroll::-webkit-scrollbar {
        width: 6px;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.15);
        border-radius: 3px;
    }

    @media (max-width: 991.98px) {
        .sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 280px;
            max-width: 85vw;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 1045;
        }

        .sidebar-container.sidebar-open {
            transform: translateX(0);
        }
    }

</style>