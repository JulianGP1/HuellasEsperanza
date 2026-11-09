import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: correo,
        password,
      });

      if (error) throw error;

      const destino = location.state?.regresarA || "/";

      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Iniciar sesión
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Bienvenido a Huellas de Esperanza
        </p>

        <form onSubmit={iniciarSesion} className="mt-8 space-y-5">
          <div>
            <label className="font-medium">Correo electrónico</label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3"
            />
          </div>

          <div>
            <label className="font-medium">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-amber-600 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link
            to="/Registro"
            state={location.state}
            className="font-semibold text-amber-700"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}