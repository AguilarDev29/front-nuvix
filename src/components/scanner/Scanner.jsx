import './Scanner.css';
import {useEffect, useRef, useState} from "react";
import {Html5Qrcode} from "html5-qrcode";
import { motion } from "framer-motion";
import {Navbar} from "../navbar/Navbar";
import Footer from "../footer/Footer";
import {verifyEntrada} from "./handleScanner";
import {listarEventos} from "../events/handleEvents";

export const Scanner = ({eventos = [], setEventos}) => {
    const [started, setStarted] = useState(false);
    const [eventoSeleccionado, setEventoSeleccionado] = useState("");
    const [verifiedParticipant, setVerifiedParticipant] = useState(null); // Estado para el participante verificado
    const [scanStatus, setScanStatus] = useState({ type: '', message: '' }); // Estado para mensajes de feedback
    const qrCodeRegionRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const scannerActiveRef = useRef(false);
    // Usamos useEffect para cargar los eventos desde la API cuando el componente se monta.
    useEffect(() => {
        const cargarEventos = async () => {
            try {
                const eventosObtenidos = await listarEventos();
                setEventos(eventosObtenidos || []); // Actualiza el estado con los datos
            } catch (error) {
                console.error("Error al cargar eventos en el scanner:", error);
            }
        };
        cargarEventos();
    }, [setEventos]); // El efecto se ejecuta si la función setEventos cambia.

    // Función para limpiar el estado del participante y los mensajes
    const resetScanResult = () => {
        setVerifiedParticipant(null);
        setScanStatus({ type: '', message: '' });
    };

    const stopScanner = async () => {
        if (!scannerActiveRef.current || !html5QrCodeRef.current) return;
        try {
            await html5QrCodeRef.current.stop();
            await html5QrCodeRef.current.clear();
            html5QrCodeRef.current = null;
            scannerActiveRef.current = false;
            setStarted(false);
            console.log("Scanner detenido correctamente");
        } catch (err) {
            console.log("Error al detener scanner:", err);
        }
    };

    useEffect(() => {
        window.stopScannerGlobal = stopScanner;
        return () => {
            if (scannerActiveRef.current && html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(console.error);
                html5QrCodeRef.current.clear().catch(console.error);
            }
            scannerActiveRef.current = false;
            html5QrCodeRef.current = null;
            delete window.stopScannerGlobal;
        };
    }, []);

    const startScanner = () => {
        if (!eventoSeleccionado) {
            alert("Debes seleccionar un evento antes de escanear.");
            return;
        }

        resetScanResult(); // Limpia resultados anteriores antes de un nuevo escaneo

        stopScanner().finally(() => {
            const config = { fps: 10, qrbox: 250 };
            const html5QrCode = new Html5Qrcode(qrCodeRegionRef.current.id);
            html5QrCodeRef.current = html5QrCode;

            const qrCodeSuccessCallback = async (decodedText) => {
                // Detener el escáner inmediatamente para evitar múltiples lecturas
                stopScanner();

                try {
                    // 2. Enviar el código al backend y esperar la respuesta
                    const response = await verifyEntrada(decodedText);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Error ${response.status}`);
                    }

                    // 3. Si es OK, obtener los datos del participante
                    const participantData = await response.json();

                    // 4. Guardar los datos en el estado y mostrar mensaje de éxito
                    setVerifiedParticipant({
                        participante: participantData.participante,
                        estadoEntrada: participantData.estado
                    });
                    setScanStatus({ type: 'success', message: '¡Acceso verificado!' });

                } catch (error) {
                    // 5. Si falla, mostrar mensaje de error
                    setScanStatus({ type: 'error', message: error.message || 'Código QR no válido o expirado.' });
                    setVerifiedParticipant(null);
                }
            };

            html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
                .then(() => {
                    scannerActiveRef.current = true;
                    setStarted(true);
                })
                .catch((err) => console.error("No se pudo iniciar el escáner", err));
        });
    };

    return (
        <>
            <Navbar/>
            <motion.div
                className="page-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="card">
                    <h2>Escáner QR</h2>
                    <select
                        id="select-evento"
                        value={eventoSeleccionado}
                        onChange={(e) => setEventoSeleccionado(e.target.value)}
                        className="input-field"
                    >
                        <option value="">-- Selecciona un evento --</option>
                        {eventos.map((ev, index) => (
                            <option key={index} value={ev.nombre}>
                                {ev.nombre}
                            </option>
                        ))}
                    </select>

                    <div ref={qrCodeRegionRef} id="reader" className="qr-scan-window"></div>

                    {!started ? (
                        <button
                            onClick={startScanner}
                            className="btn"
                            disabled={!eventoSeleccionado}
                        >
                            Iniciar escaneo
                        </button>
                    ) : (
                        <button onClick={stopScanner} className="btn stop">
                            Detener escaneo
                        </button>
                    )}

                    {/* Sección para mostrar el resultado del escaneo */}
                    {scanStatus.message && (
                        <motion.div
                            className={`scan-status ${scanStatus.type}`}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <p>{scanStatus.message}</p>
                        </motion.div>
                    )}

                    {/* Tarjeta con los datos del participante verificado */}
                    {verifiedParticipant && (
                        <motion.div
                            className="participant-card"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            <h3>Participante Verificado</h3>
                            <p><strong>Nombre:</strong> {verifiedParticipant.nombre} {verifiedParticipant.apellido}</p>
                            <p><strong>DNI:</strong> {verifiedParticipant.dni}</p>
                            <p><strong>Email:</strong> {verifiedParticipant.email}</p>
                            <p><strong>Estado:</strong> {verifiedParticipant.estadoEntrada}</p>
                            <button
                                onClick={resetScanResult}
                                className="btn"
                            >
                                Aceptar
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
            <Footer/>
        </>
    );
}