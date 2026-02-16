import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Inicio", to: "/" },
  { label: "Celulares", to: "/celulares" },
  { label: "Computadoras", to: "/computadoras" },
  { label: "Consolas", to: "/consolas" },
  { label: "Tienda de Accesorios", to: "/tienda" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/logo.png"
              alt="ServiTec Logo"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Texto ServiTec */}
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Servi<span className="text-primary">Tec</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${location.pathname === link.to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/condiciones"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Condiciones Generales
          </Link>
          <Button asChild>
            <Link to="/presupuesto">Presupuesto Online</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t bg-background px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === link.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/condiciones"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Condiciones Generales
            </Link>
            <Button asChild className="mt-2">
              <Link to="/presupuesto" onClick={() => setOpen(false)}>
                Presupuesto Online
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
