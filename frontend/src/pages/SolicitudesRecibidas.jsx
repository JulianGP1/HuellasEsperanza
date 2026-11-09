
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import {
  obtenerSolicitudesRecibidas,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../services/adopcionesService";

export default function SolicitudesRecibidas() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const obtenerToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      navigate("/login", {
        replace: true,
        state: { regresarA: "/solicitudes-recibidas" },
      });
      return null;
    }

    return session.access_token;
  };

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      setError("");

      const token = await obtenerToken();
      if (!token) return;

      const datos = await obtenerSolicitudesRecibidas(token);
      setSolicitudes(datos);
    } catch (err) {
      const detalle = err.response?.data?.detail;

      setError(
        typeof detalle === "string"
          ? detalle
          : "No se pudieron cargar las solicitudes."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const gestionarSolicitud = async (id, accion) => {
    const confirmacion = window.confirm(
      accion === "aprobar"
        ? "¿Deseas aprobar esta solicitud de adopción?"
        : "¿Deseas rechazar esta solicitud?"
    );

    if (!confirmacion) return;

    try {
      setProcesando(id);
      setError("");
      setMensaje("");

      const token = await obtenerToken();
      if (!token) return;

      if (accion === "aprobar") {
        await aprobarSolicitud(id, token);
        setMensaje("Solicitud aprobada correctamente.");
      } else {
        await rechazarSolicitud(id, token);
        setMensaje("Solicitud rechazada correctamente.");
      }

      await cargarSolicitudes();
    } catch (err) {
      const detalle = err.response?.data?.detail;

      setError(
        typeof detalle === "string"
          ? detalle
          : "No se pudo gestionar la solicitud."
      );
    } finally {
      setProcesando(null);
    }
  };

  const coloresEstado = {
    pendiente: "bg-yellow-100 text-yellow-800",
    aprobada: "bg-green-100 text-green-800",
    rechazada: "bg-red-100 text-red-800",
  };

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Solicitudes recibidas
        </h1>

        <p className="mt-3 text-gray-600">
          Administra las solicitudes de adopción de las mascotas
          que has publicado.
        </p>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="mt-6 rounded-xl bg-green-50 p-4 text-green-700">
            {mensaje}
          </p>
        )}

        {cargando ? (
          <p className="mt-8 text-gray-500">
            Cargando solicitudes...
          </p>
        ) : solicitudes.length === 0 && !error ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">
              Todavía no has recibido solicitudes de adopción.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md"
              >
                {solicitud.mascota_imagen && (
                  <img
                    src={solicitud.mascota_imagen}
                    alt={solicitud.mascota_nombre}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">
                      {solicitud.mascota_nombre}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        coloresEstado[solicitud.estado] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-gray-700">
                    <p>
                      <strong>Solicitante:</strong>{" "}
                      {solicitud.nombre_solicitante}
                    </p>

                    <p>
                      <strong>Correo:</strong>{" "}
                      {solicitud.correo}
                    </p>

                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {solicitud.telefono}
                    </p>

                    <p>
                      <strong>Motivo:</strong>{" "}
                      {solicitud.motivo}
                    </p>

                    <p className="text-sm text-gray-500">
                      Fecha:{" "}
                      {new Date(
                        solicitud.fecha_solicitud
                      ).toLocaleDateString("es-CO")}
                    </p>
                  </div>

                  {solicitud.estado === "pendiente" && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() =>
                          gestionarSolicitud(
                            solicitud.id,
                            "aprobar"
                          )
                        }
                        disabled={procesando !== null}
                        className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {procesando === solicitud.id
                          ? "Procesando..."
                          : "Aprobar"}
                      </button>

                      <button
                        onClick={() =>
                          gestionarSolicitud(
                            solicitud.id,
                            "rechazar"
                          )
                        }
                        disabled={procesando !== null}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
