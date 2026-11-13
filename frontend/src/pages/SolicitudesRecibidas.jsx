
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  obtenerSolicitudesRecibidas,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../services/adopcionesService";

const coloresEstado = {
  pendiente: "bg-yellow-100 text-yellow-800",
  aprobada: "bg-green-100 text-green-800",
  rechazada: "bg-red-100 text-red-800",
};

export default function SolicitudesRecibidas() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [error, setError] = useState("");

  const cargarSolicitudes = async () => {
    try {
      setCargando(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Debes iniciar sesión.");
        setSolicitudes([]);
        return;
      }

      const datos = await obtenerSolicitudesRecibidas(
        session.access_token
      );

      setSolicitudes(Array.isArray(datos) ? datos : []);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const gestionarSolicitud = async (id, accion) => {
    try {
      setProcesando(id);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Tu sesión ha expirado.");
        return;
      }

      if (accion === "aprobar") {
        await aprobarSolicitud(id, session.access_token);
      } else if (accion === "rechazar") {
        await rechazarSolicitud(id, session.access_token);
      }

      await cargarSolicitudes();
    } catch (err) {
      console.error("Error al gestionar solicitud:", err);
      setError(
        err.response?.data?.detail ||
          "No se pudo actualizar la solicitud."
      );
    } finally {
      setProcesando(null);
    }
  };

  // Este contador solo incluye las solicitudes recibidas
  // que devuelve la API para el usuario autenticado.
  const totalSolicitudes = solicitudes.length;

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "pendiente"
  ).length;

  const solicitudesAprobadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "aprobada"
  ).length;
  const solicitudesRechazadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "rechazada"
  ).length;

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-3 dark:text-white text-3xl font-bold text-gray-900">
          Solicitudes recibidas
        </h1>

        <p className="mb-8 dark:text-gray-300 text-gray-600">
          Gestiona las solicitudes de adopción de tus mascotas.
        </p>

        {/* Estadísticas del usuario */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <p className="text-gray-500 dark:text-gray-300">
              Total de solicitudes recibidas
            </p>
            <h2 className="mt-2 text-4xl font-bold text-blue-600">
              {totalSolicitudes}
            </h2>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <p className="text-gray-500 dark:text-gray-300">
              Por revisar
            </p>
            <h2 className="mt-2 text-4xl font-bold text-yellow-600">
              {solicitudesPendientes}
            </h2>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <p className="text-gray-500 dark:text-gray-300">
              Aprobadas
            </p>
            <h2 className="mt-2 text-4xl font-bold text-green-600">
              {solicitudesAprobadas}
            </h2>
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-md">
            <p className="text-gray-500 dark:text-gray-300">
              Rechazadas
            </p>
            <h2 className="mt-2 text-4xl font-bold text-red-600">
              {solicitudesRechazadas}
            </h2>
          </div>

        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <p className="text-center text-gray-500">
            Cargando solicitudes...
          </p>
        ) : solicitudes.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-10 text-center shadow-md">
            <p className="text-gray-600 dark:text-gray-300">
              Todavía no tienes solicitudes recibidas.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md"
              >

                {solicitud.mascota_imagen && (
                  <img
                    src={solicitud.mascota_imagen}
                    alt={solicitud.mascota_nombre || "Mascota"}
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
                      {solicitud.fecha_solicitud
                        ? new Date(
                            solicitud.fecha_solicitud
                          ).toLocaleDateString("es-CO")
                        : "Sin fecha"}
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
    </div>
  );
}
