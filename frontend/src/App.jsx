import Navbar from "./components/navbar";
import Inicio from "./pages/Inicio";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Inicio />

      <footer
        id="nosotros"
        className="bg-gray-900 px-6 py-8 text-center text-sm text-gray-300"
      >
        <p className="font-semibold text-white">
          Fundación Huellas de Esperanza
        </p>
        <p className="mt-2">
          Cada adopción es una nueva oportunidad de vida.
        </p>
      </footer>
    </div>
  );
}

export default App;