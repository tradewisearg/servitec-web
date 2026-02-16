export interface Product {
  id: number;
  image: string;
  original: number;
  promo: number;
  storage: string;
  ram: string;
  warranty: string;
  condition: "Sellado" | "Reacondicionado";
  extras: string;
}

export const products: Product[] = [
  {
    id: 1,
    image: "/SAMSUNG/SM-A17.png",
    original: 530000,
    promo: 400000,
    storage: "128GB",
    ram: "4GB",
    warranty: "1 Año",
    condition: "Sellado",
    extras: "Cargador",
  },
  {
    id: 2,
    image: "/SAMSUNG/SM-A36-5G.png",
    original: 830000,
    promo: 650000,
    storage: "256GB",
    ram: "8GB",
    warranty: "6 Meses",
    condition: "Sellado",
    extras: "Cargador",
  },
    {
    id: 3,
    image: "/MOTOROLA/MT-G86.png",
    original: 750000,
    promo: 600000,
    storage: "256GB",
    ram: "8GB",
    warranty: "6 Meses",
    condition: "Sellado",
    extras: "Cargador",
  },
    {
    id: 4,
    image: "/MOTOROLA/MT-G15.png",
    original: 400000,
    promo: 320000,
    storage: "256GB",
    ram: "4GB",
    warranty: "6 Meses",
    condition: "Sellado",
    extras: "Cargador",
  },

];
