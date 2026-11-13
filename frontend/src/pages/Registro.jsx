
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import Footer from "../components/Footer";

export default function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // REGISTRAR USUARIO EN SUPABASE
  const registrarUsuario = async (e) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    // VALIDAR NOMBRE
    if (!nombre.trim()) {
      setError("Debes ingresar tu nombre completo.");
      return;
    }

    // VALIDAR CONTRASEÑA
    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    // VALIDAR CONFIRMACIÓN
    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      const { data, error: registroError } =
        await supabase.auth.signUp({
          email: correo.trim(),
          password,
          options: {
            data: {
              nombre: nombre.trim(),
            },
          },
        });

      if (registroError) {
        throw registroError;
      }

      // SI SUPABASE CREÓ UNA SESIÓN
      if (data.session) {
        navigate("/", { replace: true });
        return;
      }

      // SI SUPABASE REQUIERE CONFIRMACIÓN POR CORREO
      setMensaje(
        "Registro realizado. Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión."
      );

      // LIMPIAR CONTRASEÑAS
      setPassword("");
      setConfirmarPassword("");

    } catch (err) {
      console.error("Error al registrar usuario:", err);

      if (err.message?.includes("already registered")) {
        setError("Este correo electrónico ya está registrado.");
      } else {
        setError(
          err.message || "Ocurrió un error al crear la cuenta."
        );
      }

    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="
        flex min-h-screen flex-col
        bg-amber-50
        transition-colors duration-300
        dark:bg-gray-950
      "
    >

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">

        <form
          onSubmit={registrarUsuario}
          className="
            w-full max-w-md
            rounded-2xl
            border border-gray-100
            bg-white p-8
            shadow-xl
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

            <h1
              className="
                text-3xl font-bold
                text-gray-900
                dark:text-white
              "
            >
              Crear cuenta
            </h1>

            <p
              className="
                mt-3 text-gray-500
                dark:text-gray-300
              "
            >
              Únete a Huellas de Esperanza.
            </p>

          </div>

          {/* CAMPOS DEL FORMULARIO */}
          <div className="space-y-5">

            {/* NOMBRE COMPLETO */}
            <div>
              <label
                htmlFor="nombre"
                className="
                  mb-2 block font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Nombre completo
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoComplete="name"
                placeholder="Tu nombre completo"
                className="
                  w-full rounded-xl
                  border border-gray-300
                  bg-white p-3
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-colors
                  focus:border-amber-500
                  focus:ring-2
                  focus:ring-amber-500/20
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  dark:placeholder-gray-400
                "
              />
            </div>

            {/* CORREO ELECTRÓNICO */}
            <div>
              <label
                htmlFor="correo"
                className="
                  mb-2 block font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                className="
                  w-full rounded-xl
                  border border-gray-300
                  bg-white p-3
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-colors
                  focus:border-amber-500
                  focus:ring-2
                  focus:ring-amber-500/20
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
                className="
                  mb-2 block font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Contraseña
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className="
                    w-full rounded-xl
                    border border-gray-300
                    bg-white p-3 pr-20
                    text-gray-900
                    placeholder-gray-400
                    outline-none
                    transition-colors
                    focus:border-amber-500
                    focus:ring-2
                    focus:ring-amber-500/20
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
                    text-sm font-semibold
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

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label
                htmlFor="confirmarPassword"
                className="
                  mb-2 block font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Confirmar contraseña
              </label>

              <input
                id="confirmarPassword"
                type={mostrarPassword ? "text" : "password"}
                value={confirmarPassword}
                onChange={(e) =>
                  setConfirmarPassword(e.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className="
                  w-full rounded-xl
                  border border-gray-300
                  bg-white p-3
                  text-gray-900
                  placeholder-gray-400
                  outline-none
                  transition-colors
                  focus:border-amber-500
                  focus:ring-2
                  focus:ring-amber-500/20
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  dark:placeholder-gray-400
                "
              />
            </div>

          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div
              role="alert"
              className="
                mt-5 rounded-xl
                border border-red-200
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

          {/* MENSAJE DE ÉXITO */}
          {mensaje && (
            <div
              role="status"
              className="
                mt-5 rounded-xl
                border border-green-200
                bg-green-50 p-4
                text-sm text-green-700
                dark:border-green-800
                dark:bg-green-950
                dark:text-green-300
              "
            >
              {mensaje}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                  mt-3 block font-semibold
                  text-green-800 underline
                  dark:text-green-300
                "
              >
                Ir a iniciar sesión
              </button>
            </div>
          )}

          {/* BOTÓN REGISTRAR */}
          <button
            type="submit"
            disabled={cargando || Boolean(mensaje)}
            className="
              mt-7 w-full rounded-xl
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

                Registrando...

              </span>
            ) : (
              "Crear cuenta"
            )}
          </button>

          {/* ENLACE A LOGIN */}
          <p
            className="
              mt-6 text-center text-sm
              text-gray-600
              dark:text-gray-300
            "
          >
            ¿Ya tienes una cuenta?{" "}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                font-semibold
                text-amber-700
                hover:underline
                dark:text-amber-400
              "
            >
              Inicia sesión
            </button>
          </p>

        </form>
      </main>

     
      <Footer />

    </div>
  );
}
