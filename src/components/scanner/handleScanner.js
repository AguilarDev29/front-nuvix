export const verifyEntrada = async (code) => {
    try{
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/v1/entradas/use/${code}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({})
        })
        if(!response.ok) return response.text();

        return await response.json();
    }catch(e){
        throw e;
    }
}