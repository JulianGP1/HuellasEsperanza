import os
import psycopg
from pathlib import Path
from dotenv import load_dotenv
from psycopg.rows import dict_row

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def obtener_conexion():
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        raise ValueError("No se encontró DATABASE_URL en el archivo .env")

    return psycopg.connect(
        DATABASE_URL,
        sslmode="require",
        row_factory=dict_row
    )