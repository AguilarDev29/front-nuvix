const API_BASE = "http://localhost:8080/api";

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
        })
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                return { success: false, message: "El correo electrónico ya está registrado." };
            }
            return { success: false, message: data.message || "Error al registrar el usuario" };
        }
        return { success: true, token: data.token, message: "Registro exitoso" };
    }catch (e){
        return { success: false, message: e.message || "Error de red" };
    }
}