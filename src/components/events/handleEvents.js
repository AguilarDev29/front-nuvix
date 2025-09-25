const API_BASE = "https://sistemadeverificacion.onrender.com"; // unifica host

export const createEvento = async (event) => {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/v1/eventos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            const text = await response.text();
            return text ? { message: text } : {};
        }
    } catch(e) {
        console.error(e);
        return null;
    }
}

export const uploadXLSX = async (eventoId, file) => {
    try{
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/v1/eventos/add/lista/${eventoId}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Fallo al subir XLSX: ${response.status} ${text}`);
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
    } catch(e){
        console.error(e);
        throw e;
    }
}

export const uploadPDF = async (eventoId, file) => {
    try{
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/v1/eventos/add/itinerario/${eventoId}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Fallo al subir PDF: ${response.status} ${text}`);
        }
        return await response.json();
    } catch(e){
        console.error(e);
        throw e;
    }
}


export const createParticipantsFromList = async (eventoId, filePathLike) => {
    try {
        const token = localStorage.getItem("token");

        // Normaliza filePath para manejar tanto strings como objetos de forma más concisa.
        const filePath = typeof filePathLike === 'string'
            ? filePathLike
            : (filePathLike?.filePath ?? filePathLike?.path ?? filePathLike?.url ?? '');

        // Construye la URL de forma segura usando la API URL.
        const url = new URL(`${API_BASE}/v1/participantes/create/${encodeURIComponent(eventoId)}`);
        if (filePath) {
            url.searchParams.set("filePath", filePath);
        }

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            // El cuerpo está vacío porque la información principal (filePath) va en la URL.
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Lanza un error descriptivo para facilitar la depuración.
            throw new Error(`Fallo al crear participantes: ${response.status} - ${errorText}`);
        }

        // Maneja la respuesta de forma flexible, aceptando JSON o texto.
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();

    } catch (e) {
        console.error("Error en createParticipantsFromList:", e);
        // Re-lanza el error para que el código que llama a la función pueda manejarlo.
        throw e;
    }
};

export const finishEvento = async (eventoId) => {
    try{
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/v1/eventos/finish/${eventoId}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            await response.text();
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return await response.json();
        }
        return await response.text();
    } catch(e){
        console.error(e);
        throw e;
    }
}

export const listarEventos = async () => {
    try{
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE}/v1/eventos/all/active`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            // Lanza un error con el mensaje del backend si es posible
            const errorText = await response.text();
            throw new Error(`Error al listar eventos: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch(e){
        console.error(e);
        throw e;
    }
}