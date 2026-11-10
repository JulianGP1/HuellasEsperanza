
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import mascotas

app = FastAPI(
    title="API Mascotas - Huellas de Esperanza",
    description="Servicio para administrar mascotas disponibles para adopción",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://huellas-esperanza.vercel.app",
    ],
    allow_origin_regex=(
        r"^https://(?:huellas-esperanza|huellasesperanzas1)"
        r"-[a-z0-9]+-juliangp1\.vercel\.app$"
    ),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Internal-Key"],
)
app.include_router(mascotas.router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API Mascotas funcionando correctamente",
        "servicio": "Huellas de Esperanza"
    }
