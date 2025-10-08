const BASE_PRUEBA = "http://localhost:8080"
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
        })
        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message || "Error al registrar el usuario" };
        }
        return { success: true, token: data.token, message: "Registro exitoso" };
    }catch (e){
        return { success: false, message: e.message || "Error de red" };
    }
}
export default registerUser;