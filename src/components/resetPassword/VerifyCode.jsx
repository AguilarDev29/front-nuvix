import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {verifyCode} from "./verifyCode";
import '../login/Login.css';
export function VerifyCode() {
    const {state} = useLocation();
    const [email] = useState(state?.email ?? "");
    const [message, setMessage] = useState("");
    const [code, setCode] = useState("");
    const navigate = useNavigate();
    const handleVerify = async (e) => {
        e.preventDefault();
        const result = await verifyCode(email, code);

        if(!result.success) setMessage("Código incorrecto");
        else{
            setMessage("Código correcto")
            navigate("/reset-password", {state: {email}});
        }

    };

    return (
        <>
            <div className="auth-container">
                <div className="form-card">
                    <h2>Olvidaste tu contraseña</h2>
                    <form onSubmit={handleVerify}>
                        <input
                            type="text"
                            placeholder="Ingresa su código de verificación"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                        <button type="submit">Enviar código</button>
                    </form>
                    <div className="links-container">
                        <a className="link" href="/login">
                            Volver al login
                        </a>
                    </div>

                    <p className="message">{message}</p>
                </div>
            </div>
        </>

    );
}