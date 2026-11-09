
from sqlalchemy import Column, BigInteger, String, Integer, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Mascota(Base):

    __tablename__ = "mascotas"

    id = Column(BigInteger, primary_key=True, index=True)

    nombre = Column(String(100), nullable=False)

    especie = Column(String(50), nullable=False)

    raza = Column(String(100))

    edad = Column(Integer)

    descripcion = Column(Text)

    imagen_url = Column(Text)

    estado = Column(
        String(30),
        nullable=False,
        default="disponible"
    )

    fecha_registro = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
