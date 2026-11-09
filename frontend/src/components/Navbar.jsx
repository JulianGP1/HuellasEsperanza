export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-2xl font-extrabold text-amber-700">
          🐾 Huellas de Esperanza
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="/" className="hover:text-amber-700">Inicio</a>
          <a href="#mascotas" className="hover:text-amber-700">Mascotas</a>
          <a href="#nosotros" className="hover:text-amber-700">Nosotros</a>
        </div>

        <a
          href="#mascotas"
          className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Adoptar
        </a>
      </nav>
    </header>
  );
}