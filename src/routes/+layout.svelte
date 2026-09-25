<script>
  import favicon from '$lib/assets/favicon.svg';
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../app.css';
  import DevRoleSwitcher from '$lib/components/DevRoleSwitcher.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  />
</svelte:head>
<DevRoleSwitcher></DevRoleSwitcher>
{@render children()}
