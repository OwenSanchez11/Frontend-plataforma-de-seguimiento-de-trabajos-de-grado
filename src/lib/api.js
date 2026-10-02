import {PUBLIC_API_URL} from '$env/static/public';


async function get(ruta) {
    const res = await fetch(`${PUBLIC_API_URL}${ruta}`)
    if(!res.ok) {
        throw Error(`Error ${res.status} al cargar ${ruta}`);
    }
    return res.json();
}

export const getTrabajos = () => get('/trabajo_grado/');
export const getCarreras = () => get('/carreras/');
export const getUsuarios = () => get('/usuarios/');
export const getRoles = () => get('/rol');
export const getFacultades = () => get("/facultades/");
export const getModulos = () => get("/modulos/");
export const getModulosRol = () => get("/modulo-rol/")

async function post(ruta) {
    const res = await fetch(`${PUBLIC_API_URL}${ruta}`, {
        method: metodo,
        headers: { 'Content-type': 'application/json' },
        body: datos ? JSON.stringify(datos) : undefined
    })

    if (!res.ok) {
        throw new Error(`Error ${res.status} en ${metodo} ${ruta}`);
    }

    return res.status === 204 ? null : res.json();

}

