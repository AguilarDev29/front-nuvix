import {useState} from "react";
import {useNavigate} from "react-router-dom";

import registerUser from "./registerUser";
import '../login/Login.css';

export function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleRegister = (e) => {
        e.preventDefault();
        const result = registerUser(email, password);
        if (result.success) {
            setMessage(" Registro exitoso, ahora puedes iniciar sesión");
            navigate("/login");
        } else setMessage(" " + result.message);
    };

    return (
        <>
            <div className="auth-container">
                <div className="form-card">
                    <h2>Registro</h2>
                    <form onSubmit={handleRegister}>
                        <input
                            type="email"
                            placeholder="Correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Registrarse</button>
                    </form>
                    <div className="links-container">
                        <a className="link" href="/login">
                            ¿Ya tienes cuenta? Inicia sesión
                        </a>
                    </div>
                    <p className="message">{message}</p>
                </div>
            </div>
        </>

    );
}