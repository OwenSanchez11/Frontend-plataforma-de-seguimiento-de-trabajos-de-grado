
import {PUBLIC_API_URL} from '$env/static/public';

//función para hacer fetch a las rutas de los get en la DB

async function get(ruta) {
    const res = await fetch(`${PUBLIC_API_URL}${ruta}`)
    if(!res.ok) {
        throw Error(`Error ${res.status} al cargar ${ruta}`);
    }
    return res.json();
}

// funciones para pasarles la ruta a la función del endpoint GET
export const getTrabajos = () => get('/trabajo_grado/');
export const getTrabajoPorId = (id) => get(`/trabajo_grado/${id}/`);
export const getCarreras = () => get('/carreras/');
export const getUsuarios = () => get('/usuarios/');
export const getRoles = () => get('/rol/');
export const getFacultades = () => get("/facultades/");
export const getModulos = () => get("/modulos/");
export const getModulosRol = () => get("/modulo-rol/")

// función para pasarle los PARAMETROS necesarios para obtener el get, en este caso necesitamos 'id_Facultad' y 'id_carrera' para poder filtrarlos
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
        headers: { 'Content-type': 'application/json' },
        body: datos ? JSON.stringify(datos) : undefined
    })

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(
            typeof error?.detail ==='string' ? error.detail : `Error ${res.status} en ${metodo} ${ruta}`
        )
    }

    return res.status === 204 ? null : res.json();

}

// funciones para llamar al POST
export const crearFacultad = (datos) => request('/facultades/', 'POST', datos);
export const crearCarrera = (datos) => request('/carreras/', 'POST', datos);
export const crearTrabajoGrado = (datos) => request('/trabajo_grado/', 'POST', datos);
export const crearRol = (datos) => request('/rol/', 'POST', datos);
export const crearUsuario = (datos) => request('/usuarios/', 'POST', datos);
//funciones para el put aquí
export const actualizarTrabajoGrado = (id, datos) => request(`/trabajo_grado/${id}`, 'PUT', datos);
export const editarRol = (id, datos) => request(`/rol/${id}` , 'PUT', datos )
export const editarUsuario = (id, datos) => request(`/usuarios/${id}`, 'PUT', datos);
//funciones para delete aquí
export const eliminarTrabajoGrado = (id) => request(`/trabajo_grado/${id}/`, 'DELETE');
export const eliminarRol = (id) => request(`/rol/${id}`, 'DELETE');
export const eliminarUsuario  =(id) => request(`/usuarios/${id}`, 'DELETE');