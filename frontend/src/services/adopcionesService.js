
import axios from "axios";

const API_URL = "http://127.0.0.1:8001";

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
