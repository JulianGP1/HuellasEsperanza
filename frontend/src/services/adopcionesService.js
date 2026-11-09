
import axios from "axios";

// URL de la API de Adopciones en Render
const API_URL = import.meta.env.VITE_API_ADOPCIONES_URL
  ?.trim()
  .replace(/\/+$/, "");

// Crear una solicitud de adopción
export const crearAdopcion = async (datos, accessToken) => {
  const respuesta = await axios.post(
    `${API_URL}/adopciones/`,
    datos,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return respuesta.data;
};

// Obtener las solicitudes realizadas por el usuario
export const obtenerMisSolicitudes = async (accessToken) => {
  const respuesta = await axios.get(
    `${API_URL}/adopciones/mis-solicitudes`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return respuesta.data;
};

// Obtener las solicitudes recibidas
export const obtenerSolicitudesRecibidas = async (accessToken) => {
  const respuesta = await axios.get(
    `${API_URL}/adopciones/recibidas`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return respuesta.data;
};

// Aprobar una solicitud de adopción
export const aprobarSolicitud = async (id, accessToken) => {
  const respuesta = await axios.patch(
    `${API_URL}/adopciones/${id}/aprobar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return respuesta.data;
};

// Rechazar una solicitud de adopción
export const rechazarSolicitud = async (id, accessToken) => {
  const respuesta = await axios.patch(
    `${API_URL}/adopciones/${id}/rechazar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return respuesta.data;
};
