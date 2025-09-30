import "./Events.css";
import {useState, useEffect} from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {motion} from "framer-motion";
import Footer from "../footer/Footer";
import {Navbar} from "../navbar/Navbar";
import "./handleEvents";
import {createEvento, createParticipantsFromList, uploadPDF, uploadXLSX, finishEvento, listarEventos} from "./handleEvents";
import {isDisabled} from "@testing-library/user-event/dist/utils";

export function Events({eventos, setEventos}) {
    const [registrarEventoVisible, setRegistrarEventoVisible] = useState(false);
    const [nuevoEvento, setNuevoEvento] = useState("");
    const [objEvento, setObjEvento] = useState({});
    const [fecha, setFecha] = useState("");
    const [dataFile, setDataFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [filtroEvento, setFiltroEvento] = useState("");
    const parseCSV = (file) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const data = results.data.filter(row => row.id && row.nombre);
                if (data.length === 0) {
                    alert("El archivo CSV debe contener las columnas 'id' y 'nombre'.");
                    setParsedData(null);
                    setDataFile(null);
                } else {
                    setParsedData(data);
                }
            },
            error: (err) => console.error("Error al leer CSV:", err),
        });
    };

    const parseXLSX = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: "array"});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Extraer encabezados reales de la primera fila
            const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: ""});
            const headerRow = rows[0] || [];
            // Normalización robusta (quita tildes y espacios, conserva letras)
            const normalize = str => str && str.toString().trim().toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const requiredColumnsRaw = ["Apellido", "Nombre", "DNI", "Email", "Telefono"];
            const requiredColumns = requiredColumnsRaw.map(normalize);
            const normalizedHeaders = headerRow.map(normalize);
            // Mapeo de encabezados normalizados a reales
            const headerMap = {};
            normalizedHeaders.forEach((h, i) => { headerMap[h] = headerRow[i]; });
            // Validar encabezados
            const missingColumns = requiredColumns.filter(col => !normalizedHeaders.includes(col));
            if (missingColumns.length > 0) {
                // Mostrar los nombres normalizados faltantes y los reales detectados
                alert(`El archivo XLSX debe contener las columnas: ${requiredColumnsRaw.join(", ")}\nDetectadas: ${headerRow.join(", ")}\nFaltan (normalizados): ${missingColumns.join(", ")}`);
                setParsedData(null);
                setDataFile(null);
                return;
            }
            // Mapear los nombres requeridos a los reales usando el valor normalizado
            const colMap = {};
            requiredColumns.forEach((col, i) => {
                if (headerMap[col]) colMap[requiredColumnsRaw[i]] = headerMap[col];
            });
            // Definir qué columnas son obligatorias (Telefono opcional)
            const requiredColumnsMandatory = ["Apellido", "Nombre", "DNI", "Email"];
            // Convertir el resto de filas a objetos usando los encabezados reales
            const dataRows = rows.slice(1)
                .filter(row => row.length > 0 && row.some(cell => cell !== "" && cell !== null && cell !== undefined))
                .map(row => {
                    // Rellenar la fila con celdas vacías si faltan columnas al final
                    if (row.length < headerRow.length) {
                        return [...row, ...Array(headerRow.length - row.length).fill("")];
                    }
                    return row;
                });
            // Mostrar en consola las filas leídas
            const data_ = dataRows.map(row => {
                const obj = {};
                Object.entries(colMap).forEach(([key, realCol]) => {
                    const idx = headerRow.indexOf(realCol);
                    obj[realCol] = row[idx] !== undefined ? row[idx] : "";
                });
                return obj;
            }).filter(row => requiredColumnsMandatory.every(col => {
                const realCol = colMap[col];
                // Permitir espacios vacíos pero no celdas realmente vacías
                return row[realCol] !== undefined && row[realCol] !== null && row[realCol].toString().trim() !== "";
            }));
            // Mostrar en consola las filas válidas
            if (data_.length === 0) {
                alert(`El archivo XLSX no contiene filas válidas con todos los campos requeridos.\nFilas leídas: ${dataRows.length}`);
                setParsedData(null);
                setDataFile(null);
            } else {
                setParsedData(data_);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = async (file) => {
        if (!file) return;
        if (file.name.endsWith(".csv")) parseCSV(file);
        else if (file.name.endsWith(".xlsx")) {
            parseXLSX(file);
        }
        else {
            alert("Formato no soportado. Solo se permiten .csv o .xlsx");
            setDataFile(null);
        }

        setDataFile(file);
    };

    const handlePdfChange = (file) => {
        if (!file || !file.name.endsWith(".pdf")) {
            alert("Solo se permiten archivos en formato PDF");
            return;
        }
        setPdfFile(file);
    };

    const handleConfirmarRegistro = async () => {
        const nombreNormalizado = nuevoEvento.trim();
        if (!nombreNormalizado) {
            alert("Debes ingresar un nombre de evento.");
            return;
        }

        if(!fecha) {
            alert("Debes ingresar una fecha para el evento.");
            return;
        }
        if (eventos.some(e => e.nombre.toLowerCase() === nombreNormalizado.toLowerCase())) {
            alert("Ya existe un evento con este nombre. Por favor, elige otro.");
            return;
        }
        if (!dataFile || !parsedData || parsedData.length === 0) {
            alert("Debes cargar un archivo de participantes válido y con datos.");
            return;
        }
        if (!pdfFile) {
            alert("Debes cargar un PDF con el itinerario del evento.");
            return;
        }

        try {
            const fechaISO = new Date(fecha).toISOString();
            const eventoData = {
                nombre: nombreNormalizado,
                fecha: fechaISO
            };


            let lista;
            const nuevoEventoCreado = await createEvento(eventoData);
            if (nuevoEventoCreado && nuevoEventoCreado.id) {
                const eventoId = nuevoEventoCreado.id;

                if (dataFile) {
                    lista = await uploadXLSX(eventoId, dataFile);
                }

                if (pdfFile) {
                    await uploadPDF(eventoId, pdfFile);
                }

                // Crear el objeto completo del nuevo evento tal como se espera en la lista
                const eventoParaUI = {
                    ...nuevoEventoCreado, // Datos del backend (id, nombre, etc.)
                    listaParticipantes: lista, // La ruta del archivo XLSX devuelta por el backend
                    participantes: [], // Inicialmente no hay participantes confirmados
                    itinerario: pdfFile.name // O la ruta que devuelva el backend para el PDF
                };

                // Actualizar el estado de eventos de forma inmutable
                setEventos(eventosAnteriores => [...eventosAnteriores, eventoParaUI]);

                setNuevoEvento("");
                setFecha("");
                setDataFile(null);
                setPdfFile(null);
                setParsedData(null);
                setRegistrarEventoVisible(false);
                alert(`Evento "${nombreNormalizado}" registrado con éxito!`);
            } else {
                alert("Hubo un error al crear el evento. Intente nuevamente.");
            }
        } catch (error) {
            console.error("Error en el registro del evento:", error);
            alert("Hubo un error en el registro del evento. Revise la consola para más detalles.");
        }
    };

    const descargarPlantilla = async () => {
        try {
            const token = localStorage.getItem("token");
            const response =
                await fetch("https://sistemadeverificacion.onrender.com/v1/participantes/download-template", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Error al descargar la plantilla");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "plantilla-participantes.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert("No se pudo descargar la plantilla. Intenta nuevamente más tarde.");
        }
    }

    // Usamos useEffect para cargar los eventos una sola vez cuando el componente se monta.
    useEffect(() => {
        const cargarEventos = async () => {
            try {
                const eventosObtenidos = await listarEventos();
                console.log("Eventos obtenidos:", eventosObtenidos);
                setEventos(eventosObtenidos || []); // Aseguramos que sea un array
            } catch (error) {
                console.error("Error al cargar los eventos:", error);
                alert(`No se pudieron cargar los eventos: ${error.message}`);
            }
        };
        cargarEventos();
    }, [setEventos]); // El efecto se ejecuta si setEventos cambia (lo cual no debería pasar)

    return (
        <>
            <Navbar/>
            <motion.div
                className="page-container"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.5}}
            >
                <div className="card">
                    <h2>Gestión de Eventos</h2>
                    <button
                        onClick={() => setRegistrarEventoVisible(!registrarEventoVisible)}
                        className={"btn" + (registrarEventoVisible ? " cancel" : "")}
                    >
                        {registrarEventoVisible ? "Cancelar" : "Registrar nuevo evento"}
                    </button>

                    {registrarEventoVisible && (
                        <motion.div
                            className="registro-evento-form"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5}}
                        >
                            <label className="label" htmlFor={ "nombre"}>
                                Nombre del evento
                                <input
                                    name="nombre"
                                    type="text"
                                    placeholder="Evento..."
                                    value={nuevoEvento}
                                    onChange={(e) => setNuevoEvento(e.target.value)}
                                    className="input-field"
                                />
                            </label>

                            <label className="label" htmlFor={"fecha"}>
                                Fecha del evento
                                <input type={"date"} className="input-field" style={{marginBottom: "10px"}}
                                       onChange={(e) => setFecha(e.target.value)}
                                        required={true}
                                />

                            </label>
                                <button className="btn" onClick={descargarPlantilla}>
                                    Descarga plantilla de participantes
                                </button>
                            <label className="file-input-label">
                                Seleccionar archivo CSV o XLSX (participantes)
                                <input
                                    type="file"
                                    accept=".csv, .xlsx"
                                    onChange={(e) => handleFileChange(e.target.files[0])}
                                    style={{display: "none"}}
                                />
                            </label>
                            {dataFile && <p className="file-name">{dataFile.name}</p>}

                            <label className="file-input-label">
                                Seleccionar archivo PDF (itinerario)
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => handlePdfChange(e.target.files[0])}
                                    style={{display: "none"}}
                                />
                            </label>
                            {pdfFile && <p className="file-name">{pdfFile.name}</p>}

                            <button onClick={handleConfirmarRegistro} className="btn">
                                Confirmar registro
                            </button>
                        </motion.div>
                    )}

                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar evento..."
                            value={filtroEvento}
                            onChange={(e) => setFiltroEvento(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <h3>Eventos Registrados</h3>
                    <ul className="eventos-list">
                        {eventos.length > 0 ? (
                            eventos.map((ev, index) => (
                                <motion.li
                                    key={index}
                                    className="event-item"
                                    initial={{x: -100, opacity: 0}}
                                    animate={{x: 0, opacity: 1}}
                                    transition={{
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 100,
                                    }}
                                >
                                    <span className="event-text">
                                        {ev.nombre} ({(() => {
                                            // Lógica segura para mostrar el número de participantes
                                            const count = ev.participantes?.length || 0;
                                            if (count === 0) return "Envia los emails para registrar los participantes";
                                            if (count === 1) return "1 participante";
                                            return `${count} participantes`;
                                        })()})
                                    </span>
                                    <button
                                        onClick={async () => {
                                            // Manejo de error y comprobación de la propiedad necesaria
                                            if (!ev.listaParticipantes) {
                                                alert("Error: No se encontró la ruta del archivo de participantes para este evento.");
                                                return;
                                            }
                                            try {
                                                await createParticipantsFromList(ev.id, ev.listaParticipantes);
                                                alert("¡Proceso de envío de invitaciones iniciado con éxito!");
                                                // Actualiza el estado para marcar este evento como "invitaciones enviadas"
                                                setEventos(eventosAnteriores =>
                                                    eventosAnteriores.map(evento =>
                                                        evento.id === ev.id
                                                            ? { ...evento, invitacionesEnviadas: true }
                                                            : evento
                                                    )
                                                );
                                            } catch (error) {
                                                alert(`Error al enviar invitaciones: ${error.message}`);
                                            }
                                        }}
                                        className={`btn ${ev.invitacionesEnviadas ? "btn-disabled" : "btn-pending"}`}
                                        disabled={ev.invitacionesEnviadas}

                                    >
                                        {ev.invitacionesEnviadas ? "Invitaciones enviadas" : "Enviar invitaciones"}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await finishEvento(ev.id);
                                                // Actualiza el estado para remover el evento de la UI
                                                setEventos(eventosAnteriores =>
                                                    eventosAnteriores.filter(evento => evento.id !== ev.id)
                                                );
                                                alert("Evento finalizado con éxito.");
                                            } catch (error) {
                                                alert(`Error al finalizar el evento: ${error.message}`);
                                            }
                                        }}
                                        className="btn"
                                    >
                                        Finalizar evento
                                    </button>

                                </motion.li>
                            ))
                        ) : (
                            <p className="no-events-message">No se encontraron eventos.</p>
                        )}
                    </ul>
                </div>
            </motion.div>
            <Footer/>
        </>

    );
}