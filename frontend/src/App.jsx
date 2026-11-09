
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Adoptar from "./pages/Adoptar";
import PublicarMascota from "./pages/PublicarMascota";
import MisSolicitudes from "./pages/MisSolicitudes";
import SolicitudesRecibidas from "./pages/SolicitudesRecibidas";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adoptar/:id" element={<Adoptar />} />
        <Route
          path="/publicar-mascota"
          element={<PublicarMascota />}
        />
        <Route
          path="/mis-solicitudes"
          element={<MisSolicitudes />}
        />
        <Route
          path="/solicitudes-recibidas"
          element={<SolicitudesRecibidas />}
        />
      </Routes>
    </BrowserRouter>
  );
}
