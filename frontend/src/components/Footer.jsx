
import { useEffect, useState } from "react";

const API_MASCOTAS = (
  import.meta.env.VITE_API_MASCOTAS_URL ||
  "https://huellasesperanza-1.onrender.com"
).replace(/\/+$/, "");

const API_ADOPCIONES = (
  import.meta.env.VITE_API_ADOPCIONES_URL ||
  "https://huellas-adopciones-6psq.onrender.com"
).replace(/\/+$/, "");

const servicios = [
  {
    nombre: "API de Mascotas",
    descripcion: "Gestión y consulta de mascotas",
    url: API_MASCOTAS,
    docs: `${API_MASCOTAS}/docs`,
    health: `${API_MASCOTAS}/openapi.json`,
  },
  {
    nombre: "API de Adopciones",
    descripcion: "Solicitudes y gestión de adopciones",
    url: API_ADOPCIONES,
    docs: `${API_ADOPCIONES}/docs`,
    health: `${API_ADOPCIONES}/openapi.json`,
  },
];

function EstadoAPI({ url }) {
  const [estado, setEstado] = useState("verificando");

  useEffect(() => {
    const controller = new AbortController();

    const verificar = async () => {
      try {
        const respuesta = await fetch(url, {
          signal: controller.signal,
        });

        setEstado(respuesta.ok ? "activa" : "error");
      } catch (error) {
        if (error.name !== "AbortError") {
          setEstado("error");
        }
      }
    };

    verificar();

    return () => controller.abort();
  }, [url]);

  const estilos = {
    verificando: "bg-yellow-100 text-yellow-800",
    activa: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };

  const textos = {
    verificando: "Verificando...",
    activa: "Disponible",
    error: "No disponible",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estilos[estado]}`}
    >
      {textos[estado]}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300      bg-white text-gray-900
        transition-colors duration-300
        dark:bg-gray-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Información del proyecto */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-amber-400">
              🐾 Huellas de Esperanza
            </h2>

            
            <p className="mt-5 text-sm leading-tight text-dark-300
                dark:text-white ">
              Desarrollado con React, FastAPI y Supabase.
            </p>
          </div>

          {/* Información de las APIs */}
          <div className="md:col-span-2">
            <h3 className="mb-5 text-lg font-semibold text-black dark:text-white">
              Microservicios y documentación
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 bg-gray-200 dark:bg-gray-800 p-5 rounded-xl">
              {servicios.map((servicio) => (
                <div
                  key={servicio.nombre}
                  className="rounded-xl border border-gray-700 dark:bg-gray-800 bg-white p-5"
                >
                  <div className="mb-3  flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-black dark:text-white">
                      {servicio.nombre}
                    </h4>

                    <EstadoAPI url={servicio.health} />
                  </div>

                  <p className="mb-4 text-sm text-gray-400">
                    {servicio.descripcion}
                  </p>

                  <div className="space-y-2 text-sm">
                    <a
                      href={servicio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-amber-400 hover:underline"
                    >
                      Ver API ↗
                    </a>

                    <a
                      href={servicio.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-amber-400 hover:underline"
                    >
                      Documentación Swagger ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Créditos */}
        <div className="mt-10 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-sm md:flex-row">
            <p>
              © {new Date().getFullYear()} Huellas de Esperanza.
              Todos los derechos reservados.
            </p>

            <p>
              Proyecto académico · Ingeniería de Sistemas
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
