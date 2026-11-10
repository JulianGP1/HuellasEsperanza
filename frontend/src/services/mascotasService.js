
import axios from "axios";

const API_URL = import.meta.env.VITE_API_MASCOTAS_URL
  ?.trim()
  .replace(/\/+$/, "");

export const obtenerMascotas = async () => {
  const respuesta = await axios.get(`${API_URL}/mascotas/`);
  return respuesta.data;
};

export const crearMascota = async (datos, accessToken) => {
  const respuesta = await axios.post(
    `${API_URL}/mascotas/`,
    datos,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return respuesta.data;
};
