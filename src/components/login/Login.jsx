import {useState} from "react";
import {authenticateUser} from "./authenticateUser";
import {Link, useNavigate} from "react-router-dom";
import './Login.css';

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await authenticateUser(email, password);

        if(!result.success){
            setMessage(result.message);
        }else{
            setMessage("Login exitoso");
            localStorage.setItem("token", result.token);
            console.log(localStorage.getItem("token"));
            navigate("/scanner");
        }
    };

    return (
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
                <Link className="link" to={"/register"}>
                    ¿No tienes cuenta? Regístrate
                </Link>
                <Link className="link" to={"/forgot-password"}>
                    ¿Olvidaste tu contraseña?
                </Link>
                <p className="message">{message}</p>
            </div>
        </div>
    );
}