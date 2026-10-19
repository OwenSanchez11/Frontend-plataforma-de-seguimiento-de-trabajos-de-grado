<script>
	let { texto, detalle = '', icono, href } = $props();
</script>

<a class="acceso" {href}>
	<span class="acceso-icono"><i class="bi {icono}"></i></span>
	<span>
		<span class="d-block fw-semibold">{texto}</span>
		{#if detalle}<span class="d-block text-secondary small">{detalle}</span>{/if}
	</span>
</a>

<style>
	.acceso {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1rem;
		background: #fff;
		border: 1px solid #e3e8f0;
		border-radius: 0.75rem;
		color: inherit;
		text-decoration: none;
		transition: border-color 0.15s;
	}
	.acceso:hover {
		border-color: #12356b;
	}
	.acceso-icono {
		flex: none;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.6rem;
		background: #e8eef9;
		color: #12356b;
		font-size: 1.2rem;
	}
</style>