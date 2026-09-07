<script>
    let correo = '';
    let password = '';
    let recordar = false;
    let mostrarPassword = false;
    let tabActiva = 'credenciales';

    function handleLogin() {

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
			<p class="text-secondary small mb-0">Identifícate con tus credenciales universitarias autorizadas.</p>
		</div>

		<div class="bg-light p-1 rounded-3 d-flex mb-4 border">
			<button
				type="button"
				class="btn btn-sm flex-fill rounded-2 fw-medium border-0 py-2 {tabActiva === 'credenciales' ? 'btn-white shadow-sm text-primary' : 'text-secondary'}"
				on:click={() => (tabActiva = 'credenciales')}
			>
				<i class="bi bi-person-vcard me-1"></i> Credenciales
			</button>
			<button
				type="button"
				class="btn btn-sm flex-fill rounded-2 fw-medium border-0 py-2 {tabActiva === 'sso' ? 'btn-white shadow-sm text-primary' : 'text-secondary'}"
				on:click={() => (tabActiva = 'sso')}
			>
				<i class="bi bi-link-45deg me-1"></i> Acceso SSO
			</button>
		</div>

		<form on:submit|preventDefault={handleLogin}>
			<div class="mb-3">
				<div class="d-flex justify-content-between align-items-center mb-1">
					<label for="email" class="form-label small fw-bold mb-0">Correo Institucional</label>
					<span class="text-muted text-end small opacity-75">Dominio @universidad.edu.co</span>
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
						required
					/>
				</div>
			</div>

			<div class="mb-3">
				<div class="d-flex justify-content-between align-items-center mb-1">
					<label for="password" class="form-label small fw-bold mb-0">Contraseña</label>
					<a href="/recuperar" class="text-decoration-none small fw-semibold">¿Olvidaste tu contraseña?</a>
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
						required
					/>
					<button
					  type="button"
						class="input-group-text bg-light border-start-0 text-muted"
						on:click={() => (mostrarPassword = !mostrarPassword)}
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
				/>
				<label class="form-check-label small text-secondary lh-sm" for="remember">
					<strong class="text-dark d-block mb-1">Recordar sesión en este equipo institucional</strong>
					Desmarca esta opción si utilizas una estación de trabajo compartida en aulas o biblioteca.
				</label>
			</div>

			<button type="submit" class="btn btn-primary w-100 py-2.5 fw-semibold rounded-3 mb-4 d-flex align-items-center justify-content-center gap-2">
				Iniciar Sesión en GradosTrack <i class="bi bi-arrow-right"></i>
			</button>
		</form>

		<div class="position-relative text-center mb-4">
			<hr class="text-muted opacity-25 m-0" />
			<span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-uppercase text-muted fw-bold extra-small">
				O autenticación directa
			</span>
		</div>

		<button
			type="button"
			class="btn btn-light border border-1 w-100 py-2 fw-medium text-secondary rounded-3 d-flex align-items-center justify-content-center gap-2"
		>
			<i class="bi bi-person-badge text-primary"></i> Ingresar con Cuenta de Red Universitaria
		</button>
	</div>
</main>

<style>
	.login-card {
		max-width: 440px;
		width: 100%;
	}

	.btn-white {
		background-color: #ffffff;
	}

	.extra-small {
		font-size: 0.70rem;
		letter-spacing: 0.05em;
	}

	/* Ajuste visual para simular los inputs suaves de la imagen */
	.input-group .form-control,
	.input-group .input-group-text {
		background-color: #f8f9fa !important;
		border-color: #dee2e6;
	}

	.input-group .form-control:focus {
		box-shadow: none;
		border-color: #86b7fe;
	}
</style>