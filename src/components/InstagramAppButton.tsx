import { Instagram } from "lucide-react";

const InstagramButton = () => {
  return (
    <a
      href="https://instagram.com/servi.tecbsas"
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Ir a Instagram"
    >
      <Instagram size={30} />
    </a>
  );
};

export default InstagramButton;
