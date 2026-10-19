<script>
    import { goto } from '$app/navigation';
    import { iniciarSesion } from '$lib/sesion.svelte.js';
    import { login } from '$lib/api.js';

    let correo = $state('');
    let password = $state('');
    let recordar = $state(false);
    let mostrarPassword = $state(false);
    let errorLogin = $state('');
    let cargandoLogin = $state(false);

    const roles = {
        1: { nombre: 'administrador', ruta: '/admin' },
        2: { nombre: 'coordinador', ruta: '/coordinador' },
        4: { nombre: 'docente', ruta: '/' },
        5: { nombre: 'estudiante', ruta: '/' }
    };

    async function handleLogin(e) {
        e.preventDefault();

        errorLogin = '';

        if (!correo.trim() || !password) {
            errorLogin = 'Ingresa tu correo y contraseña.';
            return;
        }

        cargandoLogin = true;

        try {
            const datos = await login(correo.trim(), password);

            if (!datos?.access_token || !datos?.usuario) {
                throw new Error('El servidor no devolvió los datos de sesión esperados.');
            }

            const rol = roles[datos.usuario.id_rol];

            if (!rol) {
                throw new Error('Tu usuario no tiene un rol válido.');
            }

            // Guardar usuario y token en la sesión.
            iniciarSesion(
                {
                    ...datos.usuario,
                    rol: rol.nombre
                },
                datos.access_token
            );

            // Redirigir según el rol.
            await goto(rol.ruta);

        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            errorLogin = error.message || 'No fue posible iniciar sesión.';
        } finally {
            cargandoLogin = false;
        }
    }
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    />
</svelte:head>

<main class="login-wrapper d-flex align-items-center justify-content-center min-vh-100 bg-light p-3">
    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 login-card">
        <div class="text-start mb-4">
            <h1 class="h3 fw-bold text-dark mb-1">Acceso al Sistema</h1>
            <p class="text-secondary small mb-0">
                Identifícate con tus credenciales universitarias autorizadas.
            </p>
        </div>

        <form onsubmit={handleLogin}>
            {#if errorLogin}
                <div class="alert alert-danger py-2 small" role="alert">
                    {errorLogin}
                </div>
            {/if}

            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <label for="email" class="form-label small fw-bold mb-0">
                        Correo Institucional
                    </label>
                    <span class="text-muted text-end small opacity-75">
                        Dominio @universidad.edu.co
                    </span>
                </div>

                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted fs-6">
                        <i class="bi bi-at"></i>
                    </span>

                    <input
                        type="email"
                        id="email"
                        bind:value={correo}
                        class="form-control bg-light border-start-0 ps-0"
                        placeholder="ejemplo@universidad.edu.co"
                        autocomplete="username"
                        required
                        disabled={cargandoLogin}
                    />
                </div>
            </div>

            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <label for="password" class="form-label small fw-bold mb-0">
                        Contraseña
                    </label>

                    <a href="/recuperar" class="text-decoration-none small fw-semibold">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                <div class="input-group">
                    <span class="input-group-text bg-light border-end-0 text-muted fs-6">
                        <i class="bi bi-lock"></i>
                    </span>

                    <input
                        type={mostrarPassword ? 'text' : 'password'}
                        id="password"
                        bind:value={password}
                        class="form-control bg-light border-start-0 border-end-0 ps-0"
                        placeholder="••••••••••••"
                        autocomplete="current-password"
                        required
                        disabled={cargandoLogin}
                    />

                    <button
                        type="button"
                        class="input-group-text bg-light border-start-0 text-muted"
                        onclick={() => (mostrarPassword = !mostrarPassword)}
                        aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        <i class="bi {mostrarPassword ? 'bi-eye-slash' : 'bi-eye'}"></i>
                    </button>
                </div>
            </div>

            <div class="form-check mb-4">
                <input
                    type="checkbox"
                    class="form-check-input"
                    id="remember"
                    bind:checked={recordar}
                    disabled={cargandoLogin}
                />

                <label class="form-check-label small text-secondary lh-sm" for="remember">
                    <strong class="text-dark d-block mb-1">
                        Recordar sesión en este equipo institucional
                    </strong>
                    Desmarca esta opción si utilizas una estación de trabajo compartida en aulas o biblioteca.
                </label>
            </div>

            <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold rounded-3 mb-4 d-flex align-items-center justify-content-center gap-2"
                disabled={cargandoLogin}
            >
                {#if cargandoLogin}
                    Verificando credenciales...
                    <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
                {:else}
                    Iniciar Sesión en GradosTrack
                    <i class="bi bi-arrow-right"></i>
                {/if}
            </button>
        </form>
    </div>
</main>

<style>
    .login-card {
        max-width: 440px;
        width: 100%;
    }

    .login-wrapper {
        min-height: 100vh;
    }

    .input-group .form-control,
    .input-group .input-group-text {
        background-color: #f8f9fa !important;
        border-color: #dee2e6;
    }

    .input-group .form-control:focus {
        box-shadow: none;
        border-color: #86b7fe;
    }

    button:disabled {
        cursor: not-allowed;
    }
</style>
