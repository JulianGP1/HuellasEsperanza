import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const obtenerMascotas = async () => {
  const respuesta = await axios.get(`${API_URL}/mascotas/`);
  return respuesta.data;
};