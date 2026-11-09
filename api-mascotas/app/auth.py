
import os
import requests

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

seguridad = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(seguridad)
):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase Auth no está configurado"
        )

    try:
        respuesta = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {credenciales.credentials}"
            },
            timeout=10
        )
    except requests.RequestException:
        raise HTTPException(
            status_code=503,
            detail="No fue posible conectar con Supabase Auth"
        )

    if respuesta.status_code in (401, 403):
        raise HTTPException(
            status_code=401,
            detail="Sesión inválida o expirada"
        )

    if respuesta.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Error al verificar la sesión"
        )

    usuario = respuesta.json()

    if not usuario.get("id") or not usuario.get("email"):
        raise HTTPException(
            status_code=401,
            detail="No se pudo identificar al usuario"
        )

    return usuario
