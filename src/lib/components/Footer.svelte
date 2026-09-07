<script>

	const anoActual = new Date().getFullYear();

	const enlacesFooter = [
		{ nombre: 'Contacto', href: '#' },
		{ nombre: 'Políticas de Privacidad', href: '#' },
		{ nombre: 'Soporte Técnico TI', href: '#' }
	];
</script>

<footer class="bg-white border-top py-3 mt-auto">
	<div class="container-fluid px-3 px-md-4">
		<div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-center text-md-start">
			<!-- Información de Copyright y Versión del Sistema -->
			<div>
				<div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
					<span class="fw-bold text-dark extra-small">GradosTrack</span>
					<span class="badge bg-light text-muted border extra-small">v1.0.0-prototype</span>
				</div>
				<p class="text-muted extra-small mb-0">
					&copy; {anoActual} Portal de Gestión de Trabajos de Grado. Todos los derechos reservados.
				</p>
			</div>

			<!-- Enlaces Secundarios Institucionales -->
			<ul class="list-inline mb-0 d-flex flex-wrap justify-content-center justify-content-md-end gap-3">
				{#each enlacesFooter as enlace}
					<li class="list-inline-item me-0">
						<a href={enlace.href} class="text-secondary text-decoration-none extra-small hover-primary transition-all">
							{enlace.nombre}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</footer>

<style>
	.extra-small {
		font-size: 0.72rem;
	}

	.hover-primary:hover {
		color: #0d6efd !important;
		text-decoration: underline !important;
	}

	.transition-all {
		transition: all 0.2s ease-in-out;
	}
</style>