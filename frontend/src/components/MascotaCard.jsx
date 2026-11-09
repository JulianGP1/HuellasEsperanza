export default function MascotaCard({ mascota }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-52 bg-amber-100">
        {mascota.imagen_url ? (
          <img
            src={mascota.imagen_url}
            alt={mascota.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🐾
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {mascota.nombre}
          </h3>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Disponible
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          {mascota.especie} · {mascota.raza || "Raza no especificada"}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Edad: {mascota.edad}
        </p>

        <p className="mt-3 line-clamp-2 text-sm text-gray-600">
          {mascota.descripcion || "Busca un hogar lleno de amor."}
        </p>

        <button className="mt-5 w-full rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-700">
          Quiero adoptarlo
        </button>
      </div>
    </article>
  );
}