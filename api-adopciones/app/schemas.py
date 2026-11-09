
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class AdopcionCreate(BaseModel):
    mascota_id: int = Field(gt=0)
    telefono: str = Field(min_length=7, max_length=30)
    motivo: str = Field(min_length=10)


class AdopcionResponse(BaseModel):
    id: int
    mascota_id: int
    nombre_solicitante: str
    correo: EmailStr
    telefono: str
    motivo: str
    estado: str
    fecha_solicitud: datetime
    usuario_id: UUID | None = None


class MiSolicitudResponse(AdopcionResponse):
    mascota_nombre: str | None = None
