import { useEffect, useState } from "react";
import { obtenerMascotas } from "../services/mascotasService";
import MascotaCard from "../components/MascotaCard";

export default function Inicio() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const datos = await obtenerMascotas();
        setMascotas(Array.isArray(datos) ? datos : []);
      } catch (err) {
        console.error(err);
        setError("No pudimos cargar las mascotas. Intenta nuevamente.");
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
    <main>
      <section className="bg-amber-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 font-semibold uppercase tracking-widest text-amber-700">
            Fundación Huellas de Esperanza
          </p>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl">
            Un nuevo comienzo comienza con una adopción.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            Hay una mascota esperando por ti. Encuentra a tu nuevo compañero
            y cambia su vida para siempre.
          </p>

          <a
            href="#mascotas"
            className="mt-8 inline-block rounded-xl bg-amber-600 px-7 py-3 font-semibold text-white hover:bg-amber-700"
          >
            Conocer mascotas
          </a>
        </div>
      </section>

      <section id="mascotas" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-widest text-amber-700">
            Encuentra tu compañero
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Mascotas disponibles para adopción
          </h2>

          <p className="mt-3 text-gray-500">
            Conoce a los animales que buscan una familia.
          </p>
        </div>

        {cargando && (
          <p className="text-gray-500">Cargando mascotas...</p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
        )}

        {!cargando && !error && disponibles.length === 0 && (
          <p className="rounded-xl bg-gray-50 p-6 text-gray-600">
            Actualmente no hay mascotas disponibles.
          </p>
        )}

        {!cargando && !error && disponibles.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {disponibles.map((mascota) => (
              <MascotaCard key={mascota.id} mascota={mascota} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}