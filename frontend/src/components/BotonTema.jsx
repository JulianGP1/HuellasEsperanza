
import { useEffect, useState } from "react";

export default function BotonTema() {
  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("tema") === "oscuro";
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      modoOscuro
    );

    localStorage.setItem(
      "tema",
      modoOscuro ? "oscuro" : "claro"
    );
  }, [modoOscuro]);

  return (
    <button
      type="button"
      onClick={() => setModoOscuro((anterior) => !anterior)}
      aria-label={
        modoOscuro
          ? "Activar modo claro"
          : "Activar modo oscuro"
      }
      className="
        flex items-center gap-2
        rounded-xl bg-amber-100
        px-4 py-2 font-semibold
        text-amber-900
        transition-colors
        hover:bg-amber-200
        dark:bg-gray-700
        dark:text-white
        dark:hover:bg-gray-600
      "
    >
      <span>{modoOscuro ? " 🌙" : "☀️"}</span>
     
    </button>
  );
}
