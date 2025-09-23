import React, {useEffect, useState} from 'react';
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import './App.css';
import {Home} from "./components/home/Home";
import {Scanner} from "./components/scanner/Scanner";
import {Records} from "./components/records/Records";
import {Payment} from "./components/payment/Payment";
import {Events} from "./components/events/Events";
import {Login} from "./components/login/Login";
import {Register} from "./components/register/Register";
import {ForgotPassword} from "./components/forgotPassword/ForgotPassword";
import {VerifyCode} from "./components/resetPassword/VerifyCode";
import {ResetPassword} from "./components/resetPassword/ResetPassword";

function App() {
    const [eventos, setEventos] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const path = location.pathname;

        const protectedPaths = ["/scanner", "/events", "/records", "/payment"];
        const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"]; 

        // If no token and trying to access protected routes -> go to login
        if (!token && protectedPaths.includes(path)) {
            if (path !== "/login") navigate("/login", { replace: true });
            return;
        }

        // If token exists and user is on a public page like login, redirect to scanner
        if (token && publicPaths.includes(path)) {
            if (path !== "/scanner") {
                navigate("/scanner", { replace: true });
            }
            return;
        }
        // Otherwise, do nothing and allow navigation
    }, [location, navigate]);

    return (
        <div className="App-container">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route path="/forgot-password" element={<ForgotPassword />}/>
                <Route path="/reset-password" element={<ResetPassword />}/>
                <Route path="/verify-code" element={<VerifyCode />}/>
                <Route
                    path="/scanner"
                    element={<Scanner eventos={eventos} setEventos={setEventos} />}
                />
                <Route
                    path="/events"
                    element={<Events eventos={eventos} setEventos={setEventos} />}
                />
                <Route
                    path="/records"
                    element={<Records eventos={eventos} />}
                />
                <Route
                    path="/payment"
                    element={<Payment />}
                />
            </Routes>
        </div>
    );
}

export default App;
