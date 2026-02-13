import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-display text-xl font-bold">
                Servi<span className="text-primary">tec</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              Servicio técnico especializado en reparación de dispositivos electrónicos con garantía escrita.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">Servicios</h4>
            <nav className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/celulares" className="transition-opacity hover:opacity-100">Celulares</Link>
              <Link to="/computadoras" className="transition-opacity hover:opacity-100">Computadoras</Link>
              <Link to="/consolas" className="transition-opacity hover:opacity-100">Consolas</Link>
              <Link to="/tienda" className="transition-opacity hover:opacity-100">Tienda de Accesorios</Link>
              <Link to="/condiciones" className="transition-opacity hover:opacity-100">Condiciones Generales</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">Contacto</h4>
            <div className="space-y-3 text-sm opacity-80">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>Av. García del Río 4001, Saavedra, CABA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary" />
                <a href="tel:+5491124873190" className="hover:underline">11 2487-3190</a>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-primary" />
                <span>Lun a Sáb: 10:00 – 19:00</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">Ubicación</h4>
            <div className="overflow-hidden rounded-lg">
              <iframe
                title="Ubicación Servitec"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.5!2d-58.4836!3d-34.5553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDMzJzE5LjAiUyA1OMKwMjknMDEuMCJX!5e0!3m2!1ses!2sar!4v1"
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs opacity-50">
          © {new Date().getFullYear()} Servitec. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
