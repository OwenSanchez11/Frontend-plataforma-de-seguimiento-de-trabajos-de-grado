<script>
	import { getDescargaEntregable } from '$lib/api';

	let { avance, clase = 'btn btn-sm btn-outline-secondary', texto = 'Descargar' } = $props();
	let descargando = $state(false);
	let error = $state('');

	async function descargar() {
		descargando = true;
		error = '';
		try {
			const { url } = await getDescargaEntregable(avance.id_avance);
			window.location.assign(url);
		} catch (excepcion) {
			error = excepcion.message;
		} finally {
			descargando = false;
		}
	}
</script>

{#if avance.ruta_archivo?.startsWith('entregables/')}
	<button type="button" class={clase} onclick={descargar} disabled={descargando}>
		<i class="bi bi-download me-1" aria-hidden="true"></i>
		{descargando ? 'Preparando…' : texto}
	</button>
	{#if error}<div class="small text-danger mt-1" role="alert">{error}</div>{/if}
{:else if /^https?:\/\//i.test(avance.ruta_archivo ?? '')}
	<a href={avance.ruta_archivo} target="_blank" rel="noopener noreferrer" class={clase}>
		<i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>{texto}
	</a>
{:else}
	<span class="small text-muted">Sin archivo</span>
{/if}
