from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime


class AdopcionCreate(BaseModel):
    mascota_id: int
    nombre_solicitante: str = Field(min_length=2, max_length=150)
    correo: EmailStr
    telefono: str = Field(min_length=7, max_length=30)
    motivo: str = Field(min_length=10)


class AdopcionResponse(BaseModel):
    id: int
    mascota_id: int
    nombre_solicitante: str
    correo: str
    telefono: str
    motivo: str
    estado: str
    fecha_solicitud: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)