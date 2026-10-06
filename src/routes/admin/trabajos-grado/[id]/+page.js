//tom el numero de la url y se lo entrega a la pagina del id, que es el que recibe $props()
export function load({ params }) {
    return { id: params.id };
}