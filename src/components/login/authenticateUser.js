export const authenticateUser = async (email, password) => {
    try {
        const response = await fetch("https://sistemadeverificacion.onrender.com/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, message: data.message || "Error al autenticar el usuario" };
        }
        return { success: true, token: data.token, message: "Login exitoso" };
    } catch (e) {
        return { success: false, message: e.message || "Error de red" };
    }
}