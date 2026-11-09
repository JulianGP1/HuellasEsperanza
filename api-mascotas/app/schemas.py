
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


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
    raza: Optional[str]
    edad: Optional[int]
    descripcion: Optional[str]
    imagen_url: Optional[str]
    estado: str
    fecha_registro: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
