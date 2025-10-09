import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NuvixLogo from "../../img/logo2-Photoroom.png";
import './Navbar.css';

export const Navbar = React.memo(() => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        if (window.stopScannerGlobal && typeof window.stopScannerGlobal === "function") {
            try {
                await window.stopScannerGlobal();
            } catch (err) {
                console.warn("Scanner ya estaba detenido:", err);
            }
        }
        alert("Sesión cerrada. Redirigiendo a la página de inicio.");
        localStorage.removeItem("token");
        navigate("/");
    }, [navigate]);

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
    }, []);

    return (
        <motion.nav
            className="navbar"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
        >
            <div className="navbar-container">
                <motion.div
                    className="navbar-brand"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <a href="/" className="no-underline">
                        <div className="logo-container">
                            <img src={NuvixLogo} alt="Nuvix Logo" className="logo-icon-img" />
                        </div>
                    </a>
                </motion.div>

                <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
                    &#9776;
                </div>

                <ul className={`navbar-links ${isMobileMenuOpen ? "active" : ""}`}>
                    <li>
                        <a href="/scanner" className="nav-link">Escáner</a>
                    </li>
                    <li>
                        <a href="/events" className="nav-link">Eventos</a>
                    </li>
                    <li>
                        <a href="/records" className="nav-link">Registros</a>
                    </li>
                    <li>
                        <button onClick={handleLogout} className="nav-link logout-btn">
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
            </div>
        </motion.nav>
    );
});