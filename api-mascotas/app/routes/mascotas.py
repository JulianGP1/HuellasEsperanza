
import os
import secrets

from fastapi import APIRouter, HTTPException, Depends, Header
from con_db import obtener_conexion
from app.auth import obtener_usuario_actual
from app.schemas import MascotaCreate, MascotaResponse

router = APIRouter(
    prefix="/mascotas",
    tags=["Mascotas"]
)


def verificar_servicio(
    x_internal_key: str | None = Header(default=None)
):
    clave = os.getenv("INTERNAL_API_KEY")

    if (
        not clave
        or not x_internal_key
        or not secrets.compare_digest(clave, x_internal_key)
    ):
        raise HTTPException(
            status_code=403,
            detail="Acceso interno no autorizado"
        )


@router.post("/", response_model=MascotaResponse)
def registrar_mascota(
    datos: MascotaCreate,
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            INSERT INTO mascotas (
                nombre,
                especie,
                raza,
                edad,
                descripcion,
                imagen_url,
                usuario_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                datos.nombre,
                datos.especie,
                datos.raza,
                datos.edad,
                datos.descripcion,
                datos.imagen_url,
                usuario["id"]
            )
        )

        mascota = cursor.fetchone()
        conexion.commit()
        return mascota

    except Exception as e:
        if conexion:
            conexion.rollback()

        print("ERROR REGISTRANDO MASCOTA:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al registrar la mascota"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/", response_model=list[MascotaResponse])
def listar_mascotas():
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT *
            FROM mascotas
            ORDER BY id DESC;
            """
        )

        return cursor.fetchall()

    except Exception as e:
        print("ERROR AL CONSULTAR MASCOTAS:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Error al consultar las mascotas"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/mis-publicaciones", response_model=list[MascotaResponse])
def mis_publicaciones(
    usuario: dict = Depends(obtener_usuario_actual)
):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT *
            FROM mascotas
            WHERE usuario_id = %s
            ORDER BY fecha_registro DESC;
            """,
            (usuario["id"],)
        )

        return cursor.fetchall()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error al consultar tus publicaciones"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.get("/{mascota_id}", response_model=MascotaResponse)
def consultar_mascota(mascota_id: int):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            SELECT *
            FROM mascotas
            WHERE id = %s;
            """,
            (mascota_id,)
        )

        mascota = cursor.fetchone()

        if mascota is None:
            raise HTTPException(
                status_code=404,
                detail="Mascota no encontrada"
            )

        return mascota

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error al consultar la mascota"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


@router.patch(
    "/{mascota_id}/reservar",
    dependencies=[Depends(verificar_servicio)]
)
def reservar_mascota(mascota_id: int):
    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute(
            """
            UPDATE mascotas
            SET estado = 'reservada'
            WHERE id = %s
            AND estado = 'disponible'
            RETURNING id, nombre, estado;
            """,
            (mascota_id,)
        )

        mascota = cursor.fetchone()

        if mascota is None:
            conexion.rollback()
            raise HTTPException(
                status_code=409,
                detail="Mascota inexistente o no disponible"
            )

        conexion.commit()

        return {
            "mensaje": "Mascota reservada correctamente",
            "mascota": mascota
        }

    except HTTPException:
        raise

    except Exception:
        if conexion:
            conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al reservar la mascota"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()
