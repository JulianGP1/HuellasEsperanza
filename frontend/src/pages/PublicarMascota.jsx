
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { crearMascota } from "../services/mascotasService";

export default function PublicarMascota() {
  const navigate = useNavigate();

  const [verificando, setVerificando] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    nombre: "",
    especie: "",
    raza: "",
    edad: "",
    descripcion: "",
    imagen_url: "",
  });

  useEffect(() => {
    const verificarSesion = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        navigate("/login", {
          replace: true,
          state: { regresarA: "/publicar-mascota" },
        });
        return;
      }

      setVerificando(false);
    };

    verificarSesion();
  }, [navigate]);

  const cambiarCampo = (e) => {
    setFormulario((anterior) => ({
      ...anterior,
      [e.target.name]: e.target.value,
    }));
  };

  const publicar = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        navigate("/login", {
          state: { regresarA: "/publicar-mascota" },
        });
        return;
      }

      const datos = {
        nombre: formulario.nombre.trim(),
        especie: formulario.especie,
        raza: formulario.raza.trim(),
        edad: Number(formulario.edad),
        descripcion: formulario.descripcion.trim(),
        imagen_url: formulario.imagen_url.trim(),
      };

      await crearMascota(datos, session.access_token);

      alert("¡Mascota registrada correctamente!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);

      const detalle = err.response?.data?.detail;

      if (typeof detalle === "string") {
        setError(detalle);
      } else if (Array.isArray(detalle)) {
        setError(
          detalle.map((item) => item.msg).join(", ")
        );
      } else {
        setError(err.message || "No se pudo registrar la mascota.");
      }
    } finally {
      setCargando(false);
    }
  };

  if (verificando) {
    return <p className="p-10">Verificando sesión...</p>;
  }

  return (
    <main className="min-h-screen dark:bg-gray-950 bg-amber-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl  bg-white dark:bg-gray-800 p-8 shadow-lg">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900">
          Dar una mascota en adopción
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-300">
          Registra los datos de la mascota para encontrarle
          una familia responsable.
        </p>

        <form onSubmit={publicar} className="mt-8 dark:text-white space-y-5">
          <div>
            <label className="font-semibold">
              Nombre de la mascota
            </label>
            <input
              name="nombre"
              value={formulario.nombre}
              onChange={cambiarCampo}
              required
              className="mt-2 w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="font-semibold">Especie</label>
            <select
              name="especie"
              value={formulario.especie}
              onChange={cambiarCampo}
              required
              className="mt-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl border p-3"
            >
              <option value="">Seleccionar especie</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Raza</label>
            <input
              name="raza"
              value={formulario.raza}
              onChange={cambiarCampo}
              required
              className="mt-2 w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="font-semibold">
              Edad en años
            </label>
            <input
              name="edad"
              type="number"
              min="0"
              step="1"
              value={formulario.edad}
              onChange={cambiarCampo}
              required
              className="mt-2 w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="font-semibold">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={cambiarCampo}
              required
              rows={5}
              className="mt-2 w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="font-semibold">
              URL de la imagen
            </label>
            <input
              name="imagen_url"
              type="url"
              value={formulario.imagen_url}
              onChange={cambiarCampo}
              required
              placeholder="https://ejemplo.com/mascota.jpg"
              className="mt-2 w-full rounded-xl border p-3"
            />
          </div>

          {formulario.imagen_url && (
            <img
              src={formulario.imagen_url}
              alt="Vista previa"
              className="h-56 w-full rounded-xl object-cover"
            />
          )}

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
              ? "Publicando..."
              : "Publicar mascota"}
          </button>
        </form>
      </div>
    </main>
  );
}
