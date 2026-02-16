import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
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
              <span className="font-display text-xl font-bold tracking-tight text-bold">
                Servi<span className="text-primary">Tec</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              Servicio técnico especializado en reparación de dispositivos
              electrónicos con garantía escrita.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">
              Servicios
            </h4>
            <nav className="flex flex-col gap-2 text-sm opacity-80">
              <Link
                to="/celulares"
                className="transition-opacity hover:opacity-100"
              >
                Celulares
              </Link>
              <Link
                to="/computadoras"
                className="transition-opacity hover:opacity-100"
              >
                Computadoras
              </Link>
              <Link
                to="/consolas"
                className="transition-opacity hover:opacity-100"
              >
                Consolas
              </Link>
              <Link
                to="/tienda"
                className="transition-opacity hover:opacity-100"
              >
                Tienda de Accesorios
              </Link>
              <Link
                to="/condiciones"
                className="transition-opacity hover:opacity-100"
              >
                Condiciones Generales
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">
              Contacto
            </h4>
            <div className="space-y-3 text-sm opacity-80">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>Av. García del Río 4001, Saavedra, CABA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary" />
                <a href="tel:+5491124873190" className="hover:underline">
                  11 2487-3190
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="shrink-0 text-primary" />
                <span>Lun a Sáb: 10:00 – 19:00</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider opacity-50">
              Ubicación
            </h4>
            <div className="overflow-hidden rounded-lg">
  <iframe
    title="Ubicación Servitec"
    src="https://www.google.com/maps/embed?origin=mfe&pb=!1m12!1m8!1m3!1d3285.9770506245191!2d-58.484698!3d-34.554134!3m2!1i1024!2i768!4f13.1!2m1!1sAv.+Garc%C3%ADa+del+R%C3%ADo+4001,+C1430+CABA,+Argentina!6i17!3m1!1ses-419!5m1!1ses-419"
    width="100%"
    height="150"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />
</div>

<a
  href="https://www.google.com/maps/place/Av.+García+del+Río+4001,+C1430+CABA,+Argentina"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block mt-3 text-sm text-secondary font-semibold hover:underline"
>
  Ver en Google Maps →
</a>
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
