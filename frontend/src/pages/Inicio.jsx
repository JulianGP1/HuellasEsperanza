
import { useEffect, useState } from "react";
import { obtenerMascotas } from "../services/mascotasService";
import MascotaCard from "../components/MascotaCard";
import Footer from "../components/Footer";

export default function Inicio() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        setCargando(true);
        setError("");

        const datos = await obtenerMascotas();

        setMascotas(Array.isArray(datos) ? datos : []);
      } catch (err) {
        console.error("Error al cargar mascotas:", err);
        setError(
          "No pudimos cargar las mascotas. Intenta nuevamente."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarMascotas();
  }, []);

  const disponibles = mascotas.filter(
    (mascota) => mascota.estado === "disponible"
  );

  return (
    <div
      className="
        flex min-h-screen flex-col
        bg-white text-gray-900
        transition-colors duration-300
        dark:bg-gray-950 dark:text-white
      "
    >
      <main className="flex-1">

        {/* SECCIÓN PRINCIPAL */}
        <section
          className="
            bg-amber-50 px-6 py-20
            transition-colors duration-300
            dark:bg-gray-900
          "
        >
          <div className="mx-auto max-w-6xl">

            <p
              className="
                mb-4 font-semibold uppercase tracking-widest
                text-amber-700 dark:text-amber-400
              "
            >
              Fundación Huellas de Esperanza
            </p>

            <h1
              className="
                max-w-3xl text-4xl font-extrabold
                leading-tight text-gray-900
                dark:text-white md:text-6xl
              "
            >
              Un nuevo comienzo comienza con una adopción.
            </h1>

            <p
              className="
                mt-6 max-w-2xl text-lg
                text-gray-600 dark:text-gray-300
              "
            >
              Hay una mascota esperando por ti.
              Encuentra a tu nuevo compañero y cambia
              su vida para siempre.
            </p>

            <a
              href="#mascotas"
              className="
                mt-8 inline-block rounded-xl
                bg-amber-600 px-7 py-3
                font-semibold text-white
                transition-all duration-300
                hover:bg-amber-700
                hover:shadow-lg
                dark:bg-amber-500
                dark:text-gray-950
                dark:hover:bg-amber-400
              "
            >
              🐾 Conocer mascotas
            </a>

          </div>
        </section>

        {/* SECCIÓN DE MASCOTAS */}
        <section
          id="mascotas"
          className="
            mx-auto max-w-6xl
            px-6 py-16
          "
        >
          <div className="mb-10">

            <p
              className="
                font-semibold uppercase tracking-widest
                text-amber-700 dark:text-amber-400
              "
            >
              Encuentra tu compañero
            </p>

            <h2
              className="
                mt-2 text-3xl font-bold
                text-gray-900 dark:text-white
              "
            >
              Mascotas disponibles para adopción
            </h2>

            <p
              className="
                mt-3 text-gray-500
                dark:text-gray-400
              "
            >
              Conoce a los animales que buscan una familia.
            </p>

          </div>

          {/* CARGANDO */}
          {cargando && (
            <div
              className="
                rounded-2xl bg-gray-50
                p-8 text-center
                dark:bg-gray-800
              "
            >
              <div
                className="
                  mx-auto mb-4 h-10 w-10
                  animate-spin rounded-full
                  border-4 border-amber-500
                  border-t-transparent
                "
              />

              <p className="text-gray-600 dark:text-gray-300">
                Cargando mascotas...
              </p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div
              className="
                rounded-xl bg-red-50
                p-5 text-red-700
                dark:bg-red-950
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

          {/* SIN MASCOTAS */}
          {!cargando && !error && disponibles.length === 0 && (
            <div
              className="
                rounded-2xl bg-gray-50
                p-10 text-center
                dark:bg-gray-800
              "
            >
              <p className="mb-3 text-4xl">
                🐾
              </p>

              <h3
                className="
                  text-xl font-bold
                  text-gray-900 dark:text-white
                "
              >
                No hay mascotas disponibles
              </h3>

              <p
                className="
                  mt-2 text-gray-600
                  dark:text-gray-400
                "
              >
                Actualmente no hay mascotas disponibles
                para adopción. Vuelve pronto.
              </p>
            </div>
          )}

          {/* TARJETAS DE MASCOTAS */}
          {!cargando && !error && disponibles.length > 0 && (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {disponibles.map((mascota) => (
                <MascotaCard
                  key={mascota.id}
                  mascota={mascota}
                />
              ))}
            </div>
          )}

        </section>
      </main>

      {/* PIE DE PÁGINA */}
      <Footer />
    </div>
  );
}
