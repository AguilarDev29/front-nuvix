import './Scanner.css';
import {useEffect, useRef, useState} from "react";
import {Html5Qrcode} from "html5-qrcode";
import { motion } from "framer-motion";
import {Navbar} from "../navbar/Navbar";
import Footer from "../footer/Footer";

export const Scanner = ({eventos = [], setEventos}) => {
    const [scannedResult, setScannedResult] = useState(null);
    const [started, setStarted] = useState(false);
    const [eventoSeleccionado, setEventoSeleccionado] = useState("");
    const qrCodeRegionRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const scannerActiveRef = useRef(false);

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

        const eventoActual = eventos.find(ev => ev.nombre === eventoSeleccionado);
        if (!eventoActual) {
            alert("Error: No se pudo encontrar el evento seleccionado.");
            return;
        }

        stopScanner().finally(() => {
            const config = { fps: 10, qrbox: 250 };
            const html5QrCode = new Html5Qrcode(qrCodeRegionRef.current.id);
            html5QrCodeRef.current = html5QrCode;

            html5QrCode
                .start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        stopScanner();
                        setScannedResult(`ID Escaneado: ${decodedText}`);

                        const idParticipante = decodedText.trim();
                        const participante = eventoActual.participantes.find(p => p.id.toString() === idParticipante);

                        if (!participante) {
                            alert(`Participante con ID ${idParticipante} no encontrado en la lista del evento.`);
                            return;
                        }

                        const yaRegistrado = eventoActual.asistentes.some(a => a.id.toString() === idParticipante);

                        if (yaRegistrado) {
                            alert(`${participante.nombre} ya ha sido registrado como asistente.`);
                            return;
                        }

                        setEventos(prevEventos => prevEventos.map(ev => {
                            if (ev.nombre === eventoSeleccionado) {
                                return { ...ev, asistentes: [...ev.asistentes, participante] };
                            }
                            return ev;
                        }));

                        alert(`${participante.nombre} registrado como asistente con éxito.`);
                    },
                    (errorMessage) => {
                        // Silenciado para no llenar la consola con errores de "QR not found"
                    }
                )
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
                    <label htmlFor="select-evento" className="label">
                        Selecciona un evento:
                    </label>
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

                    {scannedResult && (
                        <motion.p
                            className="resultado"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {scannedResult}
                        </motion.p>
                    )}
                </div>
            </motion.div>
            <Footer/>
        </>
    );
}