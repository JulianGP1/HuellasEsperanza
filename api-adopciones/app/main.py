from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import adopciones

app = FastAPI(
    title="API Adopciones - Huellas de Esperanza",
    description="Servicio para gestionar solicitudes de adopción de mascotas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://huellas-mascotas.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Internal-Key"],
)
app.include_router(adopciones.router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API Adopciones funcionando correctamente",
        "servicio": "Huellas de Esperanza"
    }