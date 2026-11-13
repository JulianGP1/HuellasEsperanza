
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
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

  const cambiarTema = () => {
    setModoOscuro((anterior) => !anterior);
  };

  return (
    <ThemeContext.Provider
      value={{ modoOscuro, cambiarTema }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider"
    );
  }

  return context;
}
