
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import Flooter from "../components/Footer";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      const { error: authError } =
        await supabase.auth.signInWithPassword({
          email: correo.trim(),
          password,
        });

      if (authError) throw authError;

      const destino = location.state?.regresarA || "/";

      navigate(destino, { replace: true });

    } catch (err) {
      console.error("Error al iniciar sesión:", err);

      if (err.message === "Invalid login credentials") {
        setError("Correo electrónico o contraseña incorrectos.");
      } else if (err.message === "Email not confirmed") {
        setError(
          "Debes confirmar tu correo electrónico antes de iniciar sesión."
        );
      } else {
        setError(
          err.message || "Ocurrió un error al iniciar sesión."
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-amber-50 transition-colors duration-300 dark:bg-gray-950">

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">

        <div
          className="
            w-full max-w-md rounded-2xl
            border border-gray-100
            bg-white p-8 shadow-xl
            transition-colors duration-300
            dark:border-gray-700
            dark:bg-gray-800
            dark:shadow-black/30
          "
        >

          {/* ENCABEZADO */}
          <div className="mb-8 text-center">

            <div className="mb-4 text-5xl">
              🐾
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Iniciar sesión
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-300">
              Bienvenido a Huellas de Esperanza
            </p>

          </div>

          {/* FORMULARIO */}
          <form onSubmit={iniciarSesion} className="space-y-5">

            {/* CORREO */}
            <div>
              <label
                htmlFor="correo"
                className="block font-medium text-gray-700 dark:text-gray-200"
              >
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                required
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="
                  mt-2 w-full rounded-xl
                  border border-gray-300
                  bg-white p-3
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-colors
                  focus:border-amber-500
                  focus:ring-2 focus:ring-amber-500/20
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  dark:placeholder-gray-400
                "
              />
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label
                htmlFor="password"
                className="block font-medium text-gray-700 dark:text-gray-200"
              >
                Contraseña
              </label>

              <div className="relative mt-2">

                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="
                    w-full rounded-xl
                    border border-gray-300
                    bg-white p-3 pr-20
                    text-gray-900
                    placeholder-gray-400
                    outline-none
                    transition-colors
                    focus:border-amber-500
                    focus:ring-2 focus:ring-amber-500/20
                    dark:border-gray-600
                    dark:bg-gray-700
                    dark:text-white
                    dark:placeholder-gray-400
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarPassword(!mostrarPassword)
                  }
                  className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    text-sm font-medium
                    text-amber-700
                    hover:text-amber-800
                    dark:text-amber-400
                    dark:hover:text-amber-300
                  "
                >
                  {mostrarPassword ? "Ocultar" : "Mostrar"}
                </button>

              </div>
            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
              <div
                role="alert"
                className="
                  rounded-xl border border-red-200
                  bg-red-50 p-4
                  text-sm text-red-700
                  dark:border-red-800
                  dark:bg-red-950
                  dark:text-red-300
                "
              >
                {error}
              </div>
            )}

            {/* BOTÓN INICIAR SESIÓN */}
            <button
              type="submit"
              disabled={cargando}
              className="
                w-full rounded-xl
                bg-amber-600 py-3
                font-semibold text-white
                transition-all duration-300
                hover:bg-amber-700
                hover:shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:bg-amber-500
                dark:text-gray-950
                dark:hover:bg-amber-400
              "
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-3">

                  <span
                    className="
                      h-5 w-5 animate-spin
                      rounded-full
                      border-2 border-current
                      border-t-transparent
                    "
                  />

                  Ingresando...

                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>

          </form>

          {/* REGISTRO */}
          <div className="mt-7 border-t border-gray-200 pt-6 text-center dark:border-gray-700">

            <p className="text-gray-600 dark:text-gray-300">
              ¿No tienes cuenta?{" "}

              <Link
                to="/Registro"
                state={location.state}
                className="
                  font-semibold
                  text-amber-700
                  hover:underline
                  dark:text-amber-400
                "
              >
                Regístrate
              </Link>
            </p>

          </div>

        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <Flooter />

    </div>
  );
}
