export const verifyCode = async (email, code) => {
    try {
        const response =
            await fetch("https://sistemadeverificacion.onrender.com/v1/auth/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email:email,
                    code:code
                })
            })

        const data = await response.json();

        if (!response.ok) return { success: false, message: data.message || "Error verificar codigo" };

        return { success: true, token: data.token, message: "Codigo verificado con exito" };
    }catch (e){
        return { success: false, message: e.message || "Error de red" };
    }
}