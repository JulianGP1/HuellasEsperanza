import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function MascotaCard({ mascota }) {
  const navigate = useNavigate();

  const solicitarAdopcion = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        navigate("/login", {
          state: {
            regresarA: `/adoptar/${mascota.id}`,
          },
        });
        return;
      }

      navigate(`/adoptar/${mascota.id}`);
    } catch (error) {
      console.error("Error verificando sesión:", error);
      navigate("/login", {
        state: {
          regresarA: `/adoptar/${mascota.id}`,
        },
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <img
        src={mascota.imagen_url}
        alt={mascota.nombre}
        className="h-56 w-full object-cover"
      />

      <div className="p-6">
        <h3 className="text-2xl font-bold">{mascota.nombre}</h3>

        <p className="mt-2 text-gray-600">
          {mascota.especie} · {mascota.raza}
        </p>

        <p className="mt-3 text-gray-500">
          {mascota.descripcion}
        </p>

        <button
          onClick={solicitarAdopcion}
          className="mt-5 w-full rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700"
        >
          Quiero adoptarlo
        </button>
      </div>
    </div>
  );
}