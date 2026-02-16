import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Claudia Varela",
    rating: 5,
    text: "Súper conforme con el servicio de Servitec. Me atendió Luciano que fue muy amable y correcto. Enseguida entendió lo q necesitaba. Les dejé una Notebook para instalar únicamente el Windows 10 (sin programas ni nada) y lo tuvieron listo el mismo dia. Llevo usando la pc unos días y funciona muy bien. Y por un precio muy razonable. Totalmente recomendables.",
  },
  {
    name: "Aylen Marinozzi",
    rating: 5,
    text: "Lleve para reparar la cabina de las uñas, que hacía como una especie de falso contacto cada vez que movía el cable dejaba de funcionar. No solo funciona y tengo un cable nuevo sino que lo resolvieron rápido, fueron atentos y cordiales.",
  },
  {
    name: "Silvia Seoane",
    rating: 5,
    text: "Excelente atención y profesionalismo. Lleve a arreglar un celular que se suponía que tenía agotada la batería. Sin embargo lo revisaron y vieron que el problema era el cargador. Salió la mitad del precio que hubiera sido el cambio!! Muy recomendables!!",
  },
  {
    name: "Nanus Photos",
    rating: 5,
    text: "Recién salgo de ServiTec. Fui atendido por Luciano. Llegué con la desesperación de que la ficha de carga de mi iphone estaba dañada. Él me tranquilizó, y realizó de inmediato un arreglo que dejó el celular mejor que antes. Nunca me habían atendido tan rápido y tan amablemente. Gracias Luciano!! Volveré siempre que lo necesite. Crack!!",
  },
  {
    name: "Enzo Cardaci",
    rating: 5,
    text: "la verdad servicio 10/10 lleve un control de xbox hace un tiempo xq se le quedo un plug de mis parlantes adentro y me atendieron sin problemas y lo arreglaron por un muy buen precio. y la laptop tambien tenia un problema de bateria y me la arreglaron y sin problemas.",
  },
  {
    name: "Madera Noble",
    rating: 5,
    text: "Unos Genios! el año pasado me arreglaron una compu que se me habia caido cafe sobre el teclado. Hoy un año despues, (toco madera) me funciona perfectamente. Hace dos dias fui por que no me fuinciona mi celular,... no se puedo esta vez su reparación.. pero me han asesorado que podria adquirir para lo que yo lo uso. Por la revisación, aunq no me quisieron cobrar, se ganaron una coca y unas galletitas. Gracias chicos!"
  },
  {
    name: "Silvia Papa",
    rating: 5,
    text: "Excelente atención.  Muy buen trato y productos! Me hicieron una limpieza del celular y no me cobraron nada!! Recomendable 100%",
  },
];

const ReviewsSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-slate-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-base text-gray-600">
            Opiniones reales verificadas en Google
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >
            {reviews.map((review, i) => (
              <div key={i} className="min-w-full px-6">
                <div className="bg-current backdrop-blur-md border border-white/10 rounded-3xl p-10 shadow-2xl">
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-center text-zinc-300 text-lg italic">
                    “{review.text}”
                  </p>

                  <p className="mt-6 text-center text-white font-semibold">
                    {review.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <a
            href="https://maps.app.goo.gl/t5uqsut8TFLtVH4m9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Ver todas las reseñas en Google →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
