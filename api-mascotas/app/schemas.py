
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class MascotaCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    especie: str = Field(min_length=1, max_length=50)
    raza: Optional[str] = None
    edad: Optional[int] = Field(default=None, ge=0)
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None


class MascotaResponse(BaseModel):
    id: int
    nombre: str
    especie: str
    raza: Optional[str] = None
    edad: Optional[int] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    estado: str
    fecha_registro: Optional[datetime] = None
    usuario_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)
