import Layout from "@/components/Layout";

const Condiciones = () => (
  <Layout>
    <section className="bg-gradient-to-br from-foreground to-foreground/95 py-20 text-background">
      <div className="container max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">Condiciones Generales</h1>
        <p className="mt-4 text-lg text-background/70">Política de garantía, plazos y condiciones del servicio técnico.</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container prose prose-neutral mx-auto max-w-2xl">
        <h2 className="font-display">Garantía de Reparaciones</h2>
        <p>
          Todas las reparaciones realizadas en Servitec cuentan con garantía escrita. El período de garantía varía según el tipo de reparación:
        </p>
        <ul>
          <li><strong>Cambio de pantalla:</strong> 30 días de garantía por defectos del repuesto.</li>
          <li><strong>Cambio de batería:</strong> 90 días de garantía.</li>
          <li><strong>Reparación de placa / microsoldadura:</strong> 30 días de garantía.</li>
          <li><strong>Service de consolas y PC:</strong> 30 días de garantía.</li>
        </ul>

        <h2 className="font-display">Plazos de Reparación</h2>
        <p>
          Los plazos estimados de reparación son:
        </p>
        <ul>
          <li><strong>Reparaciones simples</strong> (pantalla, batería): 24 a 48 horas hábiles.</li>
          <li><strong>Reparaciones complejas</strong> (placa, microsoldadura): 3 a 7 días hábiles.</li>
          <li><strong>Armado de PC:</strong> 3 a 5 días hábiles según disponibilidad de componentes.</li>
        </ul>

        <h2 className="font-display">Presupuestos</h2>
        <p>
          Los presupuestos son sin cargo y sin compromiso. Una vez aprobado el presupuesto, el cliente autoriza la reparación. Si el presupuesto no es aprobado dentro de los 30 días corridos, el equipo deberá ser retirado.
        </p>

        <h2 className="font-display">Retiro de Equipos</h2>
        <p>
          Los equipos reparados deben ser retirados dentro de los 60 días corridos de notificada la finalización del trabajo. Pasado ese plazo, Servitec no se hace responsable por los equipos no retirados.
        </p>

        <h2 className="font-display">Datos y Privacidad</h2>
        <p>
          Servitec no se responsabiliza por la pérdida de datos durante el proceso de reparación. Recomendamos realizar un respaldo previo. Toda información contenida en los equipos es tratada con estricta confidencialidad.
        </p>

        <h2 className="font-display">Contacto</h2>
        <p>
          Ante cualquier consulta sobre estas condiciones, comunicate con nosotros:
        </p>
        <ul>
          <li><strong>Dirección:</strong> Av. García del Río 4001, Saavedra, CABA</li>
          <li><strong>Teléfono:</strong> 11 2487-3190</li>
          <li><strong>Horario:</strong> Lunes a Sábado de 10:00 a 19:00</li>
        </ul>
      </div>
    </section>
  </Layout>
);

export default Condiciones;
