import {useState} from "react";
import {authenticateUser} from "./authenticateUser";
import {useNavigate} from "react-router-dom";
import './Login.css';

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await authenticateUser(email, password);

        if(!result.success)
            setMessage("Error al autenticar el usuario");
        else{
            localStorage.setItem("token", result.token);
            navigate("/scanner");
        }
    };

    return (
        <>
            <div className="auth-container">
                <div className="form-card">
                    <h2>Iniciar Sesión</h2>
                    <form onSubmit={handleLogin}>
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
                        <button type="submit">Entrar</button>
                    </form>
                    <div className="links-container">
                        <a className="link" href="/register">
                            ¿No tienes cuenta? Regístrate
                        </a>
                        <a className="link" href="/forgot-password">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <p className="message">{message}</p>
                </div>
            </div>
        </>
    );
}