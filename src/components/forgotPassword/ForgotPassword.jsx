import {useState} from "react";
import {Link} from "react-router-dom";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState("");

    const handleForgot = (e) => {
        e.preventDefault();
        /*const result = generateResetToken(email);
        if (result.success) {
            setMessage(" Código generado. Úsalo para restablecer la contraseña.");
            setToken(result.token);
            setResetEmail(email);
        } else {
            setMessage(" " + result.message);
        }*/
    };

    return (
        <div className="auth-container">
            <div className="form-card">
                <h2>Olvidaste tu contraseña</h2>
                <form onSubmit={handleForgot}>
                    <input
                        type="email"
                        placeholder="Ingresa tu correo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Enviar código</button>
                </form>
                {token && (
                    <div className="token-box">
                        <p> Tu código es: <strong>{token}</strong></p>
                        <p className="link" >
                            Ingresar código y nueva contraseña
                        </p>
                    </div>
                )}
                <Link className="link" to={"/login"}>
                    Volver al login
                </Link>
                <p className="message">{message}</p>
            </div>
        </div>
    );
}