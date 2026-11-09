
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { obtenerMisSolicitudes } from "../services/adopcionesService";

export default function MisSolicitudes() {
  const navigate = useNavigate();

  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          navigate("/login", {
            replace: true,
            state: { regresarA: "/mis-solicitudes" },
          });
          return;
        }

        const datos = await obtenerMisSolicitudes(
          session.access_token
        );

        setSolicitudes(Array.isArray(datos) ? datos : []);
      } catch (err) {
        console.error(err);

        const detalle = err.response?.data?.detail;

        setError(
          typeof detalle === "string"
            ? detalle
            : err.message || "No se pudieron cargar las solicitudes."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarSolicitudes();
  }, [navigate]);

  const coloresEstado = {
    pendiente: "bg-yellow-100 text-yellow-800",
    aprobada: "bg-green-100 text-green-800",
    rechazada: "bg-red-100 text-red-800",
  };

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Mis solicitudes de adopción
        </h1>

        <p className="mt-3 text-gray-600">
          Consulta el estado de tus solicitudes.
        </p>

        {cargando && (
          <p className="mt-8 text-gray-500">
            Cargando solicitudes...
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {!cargando && !error && solicitudes.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">
              Todavía no has realizado solicitudes de adopción.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white"
            >
              Ver mascotas disponibles
            </button>
          </div>
        )}

        {!cargando && !error && solicitudes.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="rounded-2xl bg-white p-6 shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-bold">
                    Solicitud #{solicitud.id}
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

                <p className="mt-4 text-gray-700">
                  <strong>Mascota:</strong>{" "}
                  {solicitud.mascota_nombre ||
                    `ID ${solicitud.mascota_id}`}
                </p>

                <p className="mt-2 text-gray-700">
                  <strong>Teléfono:</strong>{" "}
                  {solicitud.telefono}
                </p>

                <p className="mt-2 text-gray-700">
                  <strong>Motivo:</strong>{" "}
                  {solicitud.motivo}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Fecha:{" "}
                  {solicitud.fecha_solicitud
                    ? new Date(
                        solicitud.fecha_solicitud
                      ).toLocaleDateString("es-CO")
                    : "No disponible"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
