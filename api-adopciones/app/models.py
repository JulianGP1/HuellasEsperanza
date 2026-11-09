from sqlalchemy import Column, BigInteger, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Adopcion(Base):
    __tablename__ = "adopciones"

    id = Column(BigInteger, primary_key=True, index=True)

    # El ID se verifica mediante la API de Mascotas
    mascota_id = Column(BigInteger, nullable=False)

    nombre_solicitante = Column(String(150), nullable=False)
    correo = Column(String(150), nullable=False)
    telefono = Column(String(30), nullable=False)
    motivo = Column(Text, nullable=False)

    estado = Column(String(30), nullable=False, default="pendiente")

    fecha_solicitud = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )