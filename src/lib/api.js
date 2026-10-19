
    import {PUBLIC_API_URL} from '$env/static/public';
    import { obtenerToken } from '$lib/sesion.svelte.js';

    function headersAutenticados(headers = {}) {
        const token = obtenerToken();
        return {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }


    async function get(ruta) {
        const res = await fetch(`${PUBLIC_API_URL}${ruta}`, {
            headers: headersAutenticados()
        })
        if(!res.ok) {
            const error = await res.json().catch(() => null);
            const mensaje = typeof error?.detail === 'string'
                ? error.detail
                : `Error ${res.status} al cargar ${ruta}`;
            const excepcion = new Error(mensaje);
            excepcion.status = res.status;
            throw excepcion;
        }
        return res.json();
    }

    // funciones para pasarles la ruta a la función del endpoint GET
export const getTrabajos = () => get('/trabajo_grado/');
export const getTrabajoPorId = (id) => get(`/trabajo_grado/${id}/`);
export const getCarreras = () => get('/carreras/');
export const getUsuarios = () => get('/usuarios/');
export const getEquiposTrabajo = () => get('/equipo-trabajo/');
export const getRoles = () => get('/rol/');
export const getFacultades = () => get("/facultades/");
export const getModulos = () => get("/modulos/");
export const getModulosRol = () => get("/modulo-rol/");
export const getTrabajoPorEstudiante = (id_user) => get(`/equipo-trabajo/estudiante/${id_user}`);
export const getAvancePorTrabajo = (id_trabajo_grado) => get(`/avances/trabajo/${id_trabajo_grado}`);
export const getRetroalimentacionPorTrabajo = (id_trabajo_grado) => get(`/retroalimentaciones/trabajo/${id_trabajo_grado}`) 
export const getTrabajoPorDocente = (id_user) => get(`/equipo-trabajo/docente/${id_user}`);
export const getEquipoTrabajoPorId = (id_equipo) => get(`/equipo-trabajo/${id_equipo}`)
export const getEquiposPorTrabajo = (id_trabajo_grado, soloActivos = true) =>
	get(`/equipo-trabajo/trabajo/${id_trabajo_grado}?solo_activos=${soloActivos}`);   

// función para pasarle los parametros necesarios para obtener el get, en este caso necesitamos 'id_Facultad' y 'id_carrera' para poder filtrarlos
export const getEvaluaciones = ({ idFacultad = '', idCarrera = ''} = {}) => {

    //con URLSearchParams armamos la query para luego mandarsela al endpoint
    const params = new URLSearchParams();
    //agregamos el id de la facultad y la carrera en el link a donde se va a hacer la petición
    if (idFacultad) params.append('id_facultad', idFacultad);
    if (idCarrera) params.append('id_carrera', idCarrera);
        
    const query = params.toString();
    return get(`/evaluaciones/${query ? `?${query}`: '' }`);
}

export const getAvances = ({ idTrabajo = '' } = {}) => {
    const params = new URLSearchParams();
    if (idTrabajo) params.append('id_trabajo_grado', idTrabajo);

    const query = params.toString();
    return get(`/avances/${query ? `?${query}` : ''}`);
}


    //función génerica para poder hacer post, put y delete

    async function request(ruta, metodo, datos = null) {
        const res = await fetch(`${PUBLIC_API_URL}${ruta}`, {
            method: metodo,
            headers: headersAutenticados({ 'Content-type': 'application/json' }),
            body: datos ? JSON.stringify(datos) : undefined
        })

        if (!res.ok) {
            const error = await res.json().catch(() => null);
            throw new Error(
                typeof error?.detail ==='string' ? error.detail : `Error ${res.status} en ${metodo} ${ruta}`
            )
        }

        if (res.status === 204) return null;

        // Algunos endpoints confirman el POST con 201/200 y un cuerpo vacío.
        // No tratamos esa respuesta exitosa como un fallo al parsear JSON.
        const texto = await res.text();
        if (!texto) return null;
        try {
            return JSON.parse(texto);
        } catch {
            return texto;
        }

    }

    // funciones para llamar al POST
    export const crearFacultad = (datos) => request('/facultades/', 'POST', datos);
    export const crearCarrera = (datos) => request('/carreras/', 'POST', datos);
    export const crearTrabajoGrado = (datos) => request('/trabajo_grado/', 'POST', datos);
    export const crearRol = (datos) => request('/rol/', 'POST', datos);
    export const crearUsuario = (datos) => request('/usuarios/', 'POST', datos);
    export const crearEvaluacion = (datos) => request(`/evaluaciones/`, 'POST', datos);
    export const crearAvance = (datos) => request('/avances/', 'POST', datos);
    export const crearEquipoTrabajo = (datos) => request('/equipo-trabajo/', 'POST', datos);
    export const crearRetroalimentacion = (datos) => request('/retroalimentaciones/', 'POST', datos)
    //funciones para el put aquí
    export const actualizarTrabajoGrado = (id, datos) => request(`/trabajo_grado/${id}`, 'PUT', datos);
    export const editarRol = (id, datos) => request(`/rol/${id}` , 'PUT', datos )
    export const editarUsuario = (id, datos) => request(`/usuarios/${id}`, 'PUT', datos);
    export const editarEvaluacion = (id, datos) => request(`/evaluaciones/${id}`, 'PUT', datos);
    export const editarAvance = (id, datos) => request(`/avances/${id}`, 'PUT', datos);
    export const editarEquipoTrabajo = (id, datos) => request(`/equipo-trabajo/${id}`, 'PUT', datos);
    export const actualizarFacultad = (id, datos) => request(`/facultades/${id}`, 'PUT', datos);
    export const actualizarCarrera = (id, datos) => request(`/carreras/${id}`, 'PUT', datos);
    export const actualizarAvance= (id, datos) => request(`/avances/${id}`, 'PUT', datos)
    //funciones para delete aquí
    export const eliminarTrabajoGrado = (id) => request(`/trabajo_grado/${id}/`, 'DELETE');
    export const eliminarRol = (id) => request(`/rol/${id}`, 'DELETE');
    export const eliminarUsuario  =(id) => request(`/usuarios/${id}`, 'DELETE');
    export const eliminarEvaluacion = (id) => request(`/evaluaciones/${id}`, 'DELETE');
    export const eliminarAvance = (id) => request(`/avances/${id}`, 'DELETE');
    export const eliminarEquipoTrabajo = (id) => request(`/equipo-trabajo/${id}`, 'DELETE');
    export const getRolesProyecto = () => get('/roles-proyecto/');

    //función para loguearse
    export async function login(email, contrasena) {
        const res = await fetch(`${PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasena })
        })
        
        if (!res.ok) throw new Error('Correo o contraseña incorrectos');
        return await res.json();
    }


