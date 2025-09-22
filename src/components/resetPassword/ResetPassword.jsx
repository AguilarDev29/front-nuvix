import {useState} from "react";
import {Link} from "react-router-dom";
import {resetPassword} from "./resetPassword";
import './ResetPassword.css';

export function ResetPassword() {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleReset = (e) => {
        e.preventDefault();
        /*const result = resetPassword(, token, newPassword);
        if (result.success) {
            setMessage(" Contraseña cambiada con éxito");
            navigator.push("/login");
        } else {
            setMessage(" " + result.message);
        }*/
    };

    return (
        <div className="auth-container">
            <div className="form-card">
                <h2>Restablecer contraseña</h2>
                <form onSubmit={handleReset}>
                    <input
                        type="text"
                        placeholder="Código recibido"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Restablecer</button>
                </form>
                <Link className="link" to={"/login"}>
                    Volver al login
                </Link>
                <p className="message">{message}</p>
            </div>
        </div>
    );
}