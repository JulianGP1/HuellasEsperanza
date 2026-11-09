from fastapi import APIRouter, HTTPException
from con_db import obtener_conexion
from app.schemas import MascotaCreate, MascotaResponse

router = APIRouter(
    prefix="/mascotas",
    tags=["Mascotas"]
)


# 1. REGISTRAR MASCOTA
@router.post("/", response_model=MascotaResponse)
def registrar_mascota(datos: MascotaCreate):

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
                imagen_url
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                datos.nombre,
                datos.especie,
                datos.raza,
                datos.edad,
                datos.descripcion,
                datos.imagen_url
            )
        )

        mascota = cursor.fetchone()
        conexion.commit()

        return mascota

    except Exception:
        if conexion:
            conexion.rollback()

        raise HTTPException(
            status_code=500,
            detail="Error al registrar la mascota"
        )

    finally:
        if cursor:
            cursor.close()
        if conexion:
            conexion.close()


# 2. LISTAR MASCOTAS
@router.get("/", response_model=list[MascotaResponse])
def listar_mascotas():

    conexion = None
    cursor = None

    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor()

        cursor.execute("""
            SELECT *
            FROM mascotas
            ORDER BY id DESC;
        """)

        resultados = cursor.fetchall()

        return resultados

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
# 3. CONSULTAR MASCOTA POR ID
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


# 4. RESERVAR MASCOTA
@router.patch("/{mascota_id}/reservar")
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
        conexion.commit()

        if mascota is None:
            raise HTTPException(
                status_code=409,
                detail="Mascota inexistente o no disponible"
            )

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