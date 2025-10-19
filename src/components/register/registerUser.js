const API_BASE = "https://sistemadeverificacion.onrender.com";

export const registerUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE}/v1/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, token: data.token, message: "Registro exitoso" };
        }

        if (response.status === 409) {
            return { success: false, message: "El correo electrónico ya está en uso." };
        }

        // For other errors, try to parse the body for a message.
        try {
            const errorData = await response.json();
            return { success: false, message: errorData.message || "Ha ocurrido un error durante el registro." };
        } catch (error) {
            // If body is not JSON or empty
            return { success: false, message: "Ha ocurrido un error inesperado en el servidor." };
        }

    } catch (e) {
        return { success: false, message: "Error de red. Verifique su conexión e intente de nuevo." };
    }
};