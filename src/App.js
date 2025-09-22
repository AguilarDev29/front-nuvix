import React, {useState} from 'react';
import {Routes, Route, useNavigate} from 'react-router-dom';
import './App.css';
import {Home} from "./components/home/Home";
import {Scanner} from "./components/scanner/Scanner";
import {Records} from "./components/records/Records";
import {Payment} from "./components/payment/Payment";
import {Events} from "./components/events/Events";
import {Login} from "./components/login/Login";
import {Register} from "./components/register/Register";
import {ForgotPassword} from "./components/forgotPassword/ForgotPassword";

function App() {
    const [eventos, setEventos] = useState([]);
    const navigate = useNavigate();
    /*if(localStorage.getItem("token") === null){
        navigator.push("/login")
    }else navigate("/scanner")
    console.log(
        "Token: " + localStorage.getItem("token")
    )*/

    return (
        <div className="App-container">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route path="/forgot-password" element={<ForgotPassword />}/>
                <Route path="/reset-password" element={<Login />}/>
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
