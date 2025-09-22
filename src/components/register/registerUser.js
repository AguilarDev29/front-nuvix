
export const registerUser = async (email, password) => {

    try {
        const response = await fetch("https://sistemadeverificacion.onrender.com/v1/auth/register", {
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