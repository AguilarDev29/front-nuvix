export const verifyEntrada = async (code) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`https://sistemadeverificacion.onrender.com/v1/entradas/use/entrada/${code}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al verificar la entrada');
    }

    return response.json();
};

export const verifySalida = async (code) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`https://sistemadeverificacion.onrender.com/v1/entradas/use/salida/${code}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al verificar la salida');
    }

    return response.json();
};