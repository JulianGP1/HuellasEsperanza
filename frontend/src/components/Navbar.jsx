
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarSesion = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (activo) {
          setUsuario(data.session?.user || null);
        }
      } catch (error) {
        console.error("Error al obtener sesión:", error);

        if (activo) {
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setVerificando(false);
        }
      }
    };

    cargarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (activo) {
        setUsuario(session?.user || null);
        setVerificando(false);
      }
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  const cerrarSesion = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setUsuario(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar la sesión.");
    }
  };

  const irAMascotas = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();

      document
        .getElementById("mascotas")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/"
          className="text-xl font-extrabold text-amber-700"
        >
          Huellas de Esperanza
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="font-medium text-gray-700 transition hover:text-amber-700"
          >
            Inicio
          </Link>

          <Link
            to="/#mascotas"
            onClick={irAMascotas}
            className="font-medium text-gray-700 transition hover:text-amber-700"
          >
            Mascotas
          </Link>

          {!verificando &&
            (usuario ? (
              <>
                <Link
                  to="/mis-solicitudes"
                  className="font-medium text-gray-700 transition hover:text-amber-700"
                >
                  Mis solicitudes
                </Link>
                <Link
  to="/solicitudes-recibidas"
  className="font-medium text-gray-700 hover:text-amber-700"
>
  Solicitudes recibidas
</Link>
                <Link
                  to="/publicar-mascota"
                  className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Dar en adopción
                </Link>

                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium text-gray-700 transition hover:text-amber-700"
                >
                  Iniciar sesión
                </Link>

                <Link
                  to="/Registro"
                  className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Registrarme
                </Link>
              </>
            ))}
        </div>
      </nav>
    </header>
  );
}
