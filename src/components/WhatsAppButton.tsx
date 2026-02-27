import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5491124873190"
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg transition-transform hover:scale-110 sm:h-14 sm:w-14"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={24} fill="currentColor" className="sm:h-7 sm:w-7" />
    </a>
  );
};

export default WhatsAppButton;
