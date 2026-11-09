
import os
import requests

from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from psycopg.errors import UniqueViolation

from con_db import obtener_conexion
from app.auth import obtener_usuario_actual
from app.schemas import (
    AdopcionCreate,
    AdopcionResponse,
    MiSolicitudResponse
)

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "")
    
#Conexion con la api de msacotas por puesto 
MASCOTAS_API_URL = os.getenv(
    "MASCOTAS_API_URL",
    "http://127.0.0.1:8000"
).rstrip("/")

router = APIRouter(
    prefix="/adopciones",
    tags=["Adopciones"]
)


def verificar_propietario(cursor, adopcion_id, usuario_id):
    cursor.execute(
        """
        SELECT a.*
        FROM adopciones a
        INNER JOIN mascotas m
            ON m.id = a.mascota_id
        WHERE a.id = %s
        AND m.usuario_id = %s;
        """,
        (adopcion_id, usuario_id)
    )

    adopcion = cursor.fetchone()

    if adopcion is None:
        raise HTTPException(
            status_code=404,
            detail="Solicitud no encontrada o no autorizada"
        )

    return adopcion


@router.post("/", response_model=AdopcionResponse)
def crear_adopcion(
    datos: AdopcionCreate,
    usuario: dict = Depends(obtener_usuario_actual)
):
    try:
        respuesta = requests.get(
            f"{MASCOTAS_API_URL}/mascotas/{datos.mascota_id}",
            timeout=10
        )

        if respuesta.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="La mascota no existe"
            )

        respuesta.raise_for_status()
        mascota = respuesta.json()

    except HTTPException:
        raise

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="No fue posible consultar la API de Mascotas"
        )

    if mascota["estado"] != "disponible":
        raise HTTPException(
            status_code=409,
            detail="La mascota no está disponible para adopción"
        )

    if str(mascota.get("usuario_id")) == str(usuario["id"]):
        raise HTTPException(
            status_code=403,
            detail="No puedes solicitar adoptar tu propia mascota"
        )

    nombre = (
        usuario.get("user_metadata", {}).get("nombre")
        or usuario["email"].split("@")[0]
    )

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            INSERT INTO adopciones (
                mascota_id,
                usuario_id,
                nombre_solicitante,
                correo,
                telefono,
                motivo
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                datos.mascota_id,
                usuario["id"],
                nombre,
                usuario["email"],
                datos.telefono,
                datos.motivo
            )
        )

        adopcion = cursor.fetchone()
        conexion.commit()

        return adopcion

    except HTTPException:
        raise

    except Exception as e:
        if conexion:
            conexion.rollback()

        print("ERROR CREAR ADOPCION:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al registrar la solicitud de adopción"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get(
    "/mis-solicitudes",
    response_model=list[MiSolicitudResponse]
)
def obtener_mis_solicitudes(
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT
                a.*,
                m.nombre AS mascota_nombre
            FROM adopciones a
            LEFT JOIN mascotas m
                ON m.id = a.mascota_id
            WHERE a.usuario_id = %s
            ORDER BY a.fecha_solicitud DESC;
            """,
            (usuario["id"],)
        )

        return cursor.fetchall()

    except Exception as e:
        print("ERROR MIS SOLICITUDES:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al consultar tus solicitudes"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/recibidas")
def obtener_solicitudes_recibidas(
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT
                a.id,
                a.mascota_id,
                a.nombre_solicitante,
                a.correo,
                a.telefono,
                a.motivo,
                a.estado,
                a.fecha_solicitud,
                m.nombre AS mascota_nombre,
                m.imagen_url AS mascota_imagen
            FROM adopciones a
            INNER JOIN mascotas m
                ON m.id = a.mascota_id
            WHERE m.usuario_id = %s
            ORDER BY a.fecha_solicitud DESC;
            """,
            (usuario["id"],)
        )

        return cursor.fetchall()

    except Exception as e:
        print("ERROR SOLICITUDES RECIBIDAS:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al consultar las solicitudes recibidas"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/", response_model=list[AdopcionResponse])
def listar_adopciones(
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT a.*
            FROM adopciones a
            LEFT JOIN mascotas m
                ON m.id = a.mascota_id
            WHERE a.usuario_id = %s
               OR m.usuario_id = %s
            ORDER BY a.fecha_solicitud DESC;
            """,
            (usuario["id"], usuario["id"])
        )

        return cursor.fetchall()

    except Exception as e:
        print("ERROR LISTAR ADOPCIONES:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al consultar las solicitudes"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get(
    "/{adopcion_id}",
    response_model=AdopcionResponse
)
def consultar_adopcion(
    adopcion_id: int,
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT a.*
            FROM adopciones a
            LEFT JOIN mascotas m
                ON m.id = a.mascota_id
            WHERE a.id = %s
            AND (
                a.usuario_id = %s
                OR m.usuario_id = %s
            );
            """,
            (adopcion_id, usuario["id"], usuario["id"])
        )

        adopcion = cursor.fetchone()

        if adopcion is None:
            raise HTTPException(
                status_code=404,
                detail="Solicitud no encontrada"
            )

        return adopcion

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR CONSULTAR ADOPCION:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al consultar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.patch("/{adopcion_id}/aprobar")
def aprobar_adopcion(
    adopcion_id: int,
    usuario: dict = Depends(obtener_usuario_actual)
):
    if not INTERNAL_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="La clave interna de los servicios no está configurada"
        )

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        adopcion = verificar_propietario(
            cursor,
            adopcion_id,
            usuario["id"]
        )

        if adopcion["estado"] != "pendiente":
            raise HTTPException(
                status_code=409,
                detail="La solicitud ya fue gestionada"
            )

        try:
            respuesta = requests.patch(
                f"{MASCOTAS_API_URL}/mascotas/{adopcion['mascota_id']}/reservar",
                headers={
                    "X-Internal-Key": INTERNAL_API_KEY
                },
                timeout=10
            )

            print(
                "ESTADO API MASCOTAS:",
                respuesta.status_code
            )

            if respuesta.status_code == 403:
                raise HTTPException(
                    status_code=502,
                    detail="API Mascotas rechazó la clave interna"
                )

            if respuesta.status_code == 409:
                raise HTTPException(
                    status_code=409,
                    detail="La mascota ya no está disponible"
                )

            respuesta.raise_for_status()

        except HTTPException:
            raise

        except requests.RequestException as e:
            print("ERROR RESERVAR MASCOTA:", repr(e))

            raise HTTPException(
                status_code=502,
                detail="No se pudo reservar la mascota"
            )

        cursor.execute(
            """
            UPDATE adopciones a
            SET estado = 'aprobada'
            FROM mascotas m
            WHERE a.id = %s
            AND a.mascota_id = m.id
            AND m.usuario_id = %s
            AND a.estado = 'pendiente'
            RETURNING a.*;
            """,
            (adopcion_id, usuario["id"])
        )

        resultado = cursor.fetchone()

        if resultado is None:
            raise HTTPException(
                status_code=409,
                detail="La solicitud ya fue gestionada"
            )

        cursor.execute(
            """
            UPDATE adopciones
            SET estado = 'rechazada'
            WHERE mascota_id = %s
            AND id <> %s
            AND estado = 'pendiente';
            """,
            (resultado["mascota_id"], adopcion_id)
        )

        conexion.commit()

        return {
            "mensaje": "Adopción aprobada correctamente",
            "adopcion": resultado
        }

    except UniqueViolation:
        if conexion:
            conexion.rollback()

        raise HTTPException(
            status_code=409,
            detail="Ya existe una adopción aprobada para esta mascota"
        )

    except HTTPException:
        if conexion:
            conexion.rollback()
        raise

    except Exception as e:
        if conexion:
            conexion.rollback()

        print("ERROR APROBAR ADOPCION:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al aprobar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.patch("/{adopcion_id}/rechazar")
def rechazar_adopcion(
    adopcion_id: int,
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            UPDATE adopciones a
            SET estado = 'rechazada'
            FROM mascotas m
            WHERE a.id = %s
            AND a.mascota_id = m.id
            AND m.usuario_id = %s
            AND a.estado = 'pendiente'
            RETURNING a.*;
            """,
            (adopcion_id, usuario["id"])
        )

        adopcion = cursor.fetchone()

        if adopcion is None:
            raise HTTPException(
                status_code=404,
                detail="Solicitud no encontrada o ya gestionada"
            )

        conexion.commit()

        return {
            "mensaje": "Solicitud rechazada correctamente",
            "adopcion": adopcion
        }

    except HTTPException:
        if conexion:
            conexion.rollback()
        raise

    except Exception as e:
        if conexion:
            conexion.rollback()

        print("ERROR RECHAZAR ADOPCION:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al rechazar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
