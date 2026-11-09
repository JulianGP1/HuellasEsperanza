import os
import requests

from fastapi import APIRouter, HTTPException
from psycopg.errors import UniqueViolation

from con_db import obtener_conexion
from app.schemas import AdopcionCreate, AdopcionResponse


router = APIRouter(
    prefix="/adopciones",
    tags=["Adopciones"]
)

MASCOTAS_API_URL = os.getenv(
    "MASCOTAS_API_URL",
    "http://127.0.0.1:8000"
).rstrip("/")


# 1. CREAR SOLICITUD DE ADOPCIÓN
@router.post("/", response_model=AdopcionResponse)
def crear_adopcion(datos: AdopcionCreate):

    # Consultar disponibilidad en API Mascotas
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

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            INSERT INTO adopciones (
                mascota_id,
                nombre_solicitante,
                correo,
                telefono,
                motivo
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                datos.mascota_id,
                datos.nombre_solicitante,
                datos.correo,
                datos.telefono,
                datos.motivo
            )
        )

        adopcion = cursor.fetchone()
        conexion.commit()

        return adopcion

    except Exception:
        if conexion:
            conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al registrar la solicitud de adopción"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


# 2. LISTAR SOLICITUDES
@router.get("/", response_model=list[AdopcionResponse])
def listar_adopciones():

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute("""
            SELECT *
            FROM adopciones
            ORDER BY fecha_solicitud DESC;
        """)

        resultados = cursor.fetchall()

        return resultados

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error al consultar las solicitudes"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


# 3. CONSULTAR SOLICITUD POR ID
@router.get("/{adopcion_id}", response_model=AdopcionResponse)
def consultar_adopcion(adopcion_id: int):

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT *
            FROM adopciones
            WHERE id = %s;
            """,
            (adopcion_id,)
        )

        adopcion = cursor.fetchone()

        if adopcion is None:
            raise HTTPException(
                status_code=404,
                detail="Solicitud de adopción no encontrada"
            )

        return adopcion

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


# 4. APROBAR SOLICITUD
@router.patch("/{adopcion_id}/aprobar")
def aprobar_adopcion(adopcion_id: int):

    conexion = None
    cursor = None

    # Primero consultar la solicitud
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT *
            FROM adopciones
            WHERE id = %s;
            """,
            (adopcion_id,)
        )

        adopcion = cursor.fetchone()

        if adopcion is None:
            raise HTTPException(
                status_code=404,
                detail="Solicitud no encontrada"
            )

        if adopcion["estado"] != "pendiente":
            raise HTTPException(
                status_code=409,
                detail="La solicitud ya fue gestionada"
            )

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()

    # Reservar mascota mediante la API Mascotas
    try:
        respuesta = requests.patch(
            f"{MASCOTAS_API_URL}/mascotas/{adopcion['mascota_id']}/reservar",
            timeout=10
        )

        if respuesta.status_code == 409:
            raise HTTPException(
                status_code=409,
                detail="La mascota ya no está disponible"
            )

        respuesta.raise_for_status()

    except HTTPException:
        raise

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="No se pudo reservar la mascota mediante la API de Mascotas"
        )

    # Actualizar estado de la solicitud
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            UPDATE adopciones
            SET estado = 'aprobada'
            WHERE id = %s
            AND estado = 'pendiente'
            RETURNING *;
            """,
            (adopcion_id,)
        )

        resultado = cursor.fetchone()

        if resultado is None:
            conexion.rollback()
            raise HTTPException(
                status_code=409,
                detail="La solicitud ya fue gestionada"
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
        raise

    except Exception:
        if conexion:
            conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al aprobar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


# 5. RECHAZAR SOLICITUD
@router.patch("/{adopcion_id}/rechazar")
def rechazar_adopcion(adopcion_id: int):

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            UPDATE adopciones
            SET estado = 'rechazada'
            WHERE id = %s
            AND estado = 'pendiente'
            RETURNING *;
            """,
            (adopcion_id,)
        )

        adopcion = cursor.fetchone()

        if adopcion is None:
            conexion.rollback()

            raise HTTPException(
                status_code=409,
                detail="Solicitud inexistente o ya gestionada"
            )

        conexion.commit()

        return {
            "mensaje": "Solicitud rechazada correctamente",
            "adopcion": adopcion
        }

    except HTTPException:
        raise

    except Exception:
        if conexion:
            conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al rechazar la solicitud"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()