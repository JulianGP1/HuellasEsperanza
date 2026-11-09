import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarUsuario = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setCargando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: password,
        options: {
          data: {
            nombre: nombre
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        setMensaje("Cuenta creada correctamente.");
      } else {
        setMensaje(
          "Revisa tu correo electrónico para confirmar tu cuenta."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4 py-12">
      <form
        onSubmit={registrarUsuario}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Crear cuenta
        </h1>

        <p className="mb-8 text-gray-500">
          Únete a Huellas de Esperanza.
        </p>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block font-medium">
              Nombre completo
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 p-3 focus:border-amber-500 focus:outline-none"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Correo electrónico
            </label>

            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 p-3 focus:border-amber-500 focus:outline-none"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full rounded-xl border border-gray-300 p-3 focus:border-amber-500 focus:outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        {error && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {mensaje && (
          <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="mt-7 w-full rounded-xl bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {cargando ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}