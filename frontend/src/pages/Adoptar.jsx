
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { crearAdopcion } from "../services/adopcionesService";

export default function Adoptar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mascota, setMascota] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    telefono: "",
    motivo: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (authError || !data.user) {
          navigate("/login", {
            replace: true,
            state: { regresarA: `/adoptar/${id}` },
          });
          return;
        }

        const respuesta = await fetch(
          `http://127.0.0.1:8000/mascotas/${id}`
        );

        if (!respuesta.ok) {
          throw new Error("No se encontró la mascota.");
        }

        setMascota(await respuesta.json());
      } catch (err) {
        setError(err.message || "Ocurrió un error.");
      } finally {
        setVerificando(false);
      }
    };

    cargarDatos();
  }, [id, navigate]);

  const cambiarCampo = (e) => {
    setFormulario((anterior) => ({
      ...anterior,
      [e.target.name]: e.target.value,
    }));
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate("/login", {
          state: { regresarA: `/adoptar/${id}` },
        });
        return;
      }

      await crearAdopcion(
        {
          mascota_id: Number(id),
          telefono: formulario.telefono.trim(),
          motivo: formulario.motivo.trim(),
        },
        session.access_token
      );

      alert("¡Solicitud de adopción enviada correctamente!");
      navigate("/mis-solicitudes", { replace: true });
    } catch (err) {
      console.error(err);

      const detalle = err.response?.data?.detail;

      if (typeof detalle === "string") {
        setError(detalle);
      } else if (Array.isArray(detalle)) {
        setError(
          detalle
            .map((item) => item.msg || JSON.stringify(item))
            .join(", ")
        );
      } else {
        setError(
          err.message || "No se pudo enviar la solicitud."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  if (verificando) {
    return <p className="p-10">Cargando información...</p>;
  }

  if (error && !mascota) {
    return <p className="p-10 text-red-600">{error}</p>;
  }

  if (!mascota) return null;

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Solicitud de adopción
        </h1>

        <p className="mt-3 text-gray-500">
          Completa los siguientes datos para solicitar la adopción.
        </p>

        <div className="mt-8 flex items-center gap-5 rounded-xl bg-amber-50 p-4">
          <img
            src={mascota.imagen_url}
            alt={mascota.nombre}
            className="h-24 w-24 rounded-xl object-cover"
          />

          <div>
            <h2 className="text-xl font-bold">
              {mascota.nombre}
            </h2>

            <p className="text-gray-600">
              {mascota.especie} · {mascota.raza}
            </p>
          </div>
        </div>

        {mascota.estado !== "disponible" ? (
          <p className="mt-8 rounded-xl bg-yellow-50 p-4 text-yellow-800">
            Esta mascota ya no está disponible para adopción.
          </p>
        ) : (
          <form
            onSubmit={enviarSolicitud}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="font-semibold">
                Teléfono de contacto
              </label>

              <input
                name="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={cambiarCampo}
                required
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="font-semibold">
                ¿Por qué deseas adoptar esta mascota?
              </label>

              <textarea
                name="motivo"
                value={formulario.motivo}
                onChange={cambiarCampo}
                required
                rows={5}
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-4 text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {cargando
                ? "Enviando..."
                : "Enviar solicitud de adopción"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
