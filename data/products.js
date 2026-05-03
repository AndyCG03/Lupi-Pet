const products = [
  // ALIMENTOS
  {
    id: 1,
    name: "Royal Canin Adult",
    category: "alimentos",
    pet: "perro",
    price: 320,
    emoji: "🥩",
    badge: "Más vendido",
    description: "Alimento completo para perros adultos. Fórmula balanceada con proteínas de calidad.",
    stock: 25
  },
  {
    id: 2,
    name: "Whiskas Atún",
    category: "alimentos",
    pet: "gato",
    price: 180,
    emoji: "🐟",
    badge: null,
    description: "Alimento húmedo con sabor a atún para gatos adultos. Rico en omega 3.",
    stock: 40
  },
  {
    id: 3,
    name: "Hills Science Puppy",
    category: "alimentos",
    pet: "perro",
    price: 480,
    emoji: "🦴",
    badge: "Premium",
    description: "Nutrición científica para cachorros en sus primeros meses de vida.",
    stock: 15
  },
  {
    id: 4,
    name: "Pro Plan Gatito",
    category: "alimentos",
    pet: "gato",
    price: 390,
    emoji: "🐱",
    badge: "Premium",
    description: "Fórmula especial para gatitos en crecimiento con DHA para el desarrollo cerebral.",
    stock: 20
  },
  // ACCESORIOS
  {
    id: 5,
    name: "Collar Ajustable",
    category: "accesorios",
    pet: "perro",
    price: 95,
    emoji: "🏷️",
    badge: null,
    description: "Collar reflectante ajustable con hebilla de seguridad. Disponible en varios colores.",
    stock: 50
  },
  {
    id: 6,
    name: "Rascador Deluxe",
    category: "accesorios",
    pet: "gato",
    price: 560,
    emoji: "🌲",
    badge: "Nuevo",
    description: "Torre rascador de 3 niveles con plataformas y juguetes colgantes incorporados.",
    stock: 8
  },
  {
    id: 7,
    name: "Correa Retráctil 5m",
    category: "accesorios",
    pet: "perro",
    price: 210,
    emoji: "🎯",
    badge: null,
    description: "Correa retráctil de 5 metros con freno y bloqueo. Hasta 25kg.",
    stock: 18
  },
  {
    id: 8,
    name: "Cama Redonda Suave",
    category: "accesorios",
    pet: "gato",
    price: 340,
    emoji: "🛏️",
    badge: "Nuevo",
    description: "Cama redonda ultra suave con bordes acolchados. Lavable a máquina.",
    stock: 12
  },
  // HIGIENE
  {
    id: 9,
    name: "Shampoo Anti-pulgas",
    category: "higiene",
    pet: "perro",
    price: 130,
    emoji: "🧴",
    badge: null,
    description: "Shampoo natural con citronela y aceites esenciales para protección antipulgas.",
    stock: 30
  },
  {
    id: 10,
    name: "Arena Sanitaria 10kg",
    category: "higiene",
    pet: "gato",
    price: 220,
    emoji: "🪣",
    badge: "Más vendido",
    description: "Arena aglomerante con control de olores hasta 7 días. Polvo mínimo.",
    stock: 35
  },
  {
    id: 11,
    name: "Cepillo Deslanador",
    category: "higiene",
    pet: "perro",
    price: 160,
    emoji: "✂️",
    badge: null,
    description: "Cepillo ergonómico para desenredar y eliminar pelaje muerto sin lastimar.",
    stock: 22
  },
  {
    id: 12,
    name: "Toallitas Húmedas",
    category: "higiene",
    pet: "gato",
    price: 75,
    emoji: "🧻",
    badge: null,
    description: "Toallitas sin alcohol con aloe vera. Ideales para limpieza rápida sin baño.",
    stock: 60
  }
];

const blogPosts = [
  {
    id: 1,
    title: "5 señales de que tu gato está feliz",
    category: "Bienestar",
    pet: "gato",
    emoji: "😺",
    date: "28 Abr 2025",
    excerpt: "Los gatos tienen formas muy particulares de expresar su felicidad. Aprende a leer el lenguaje corporal de tu felino y fortalece su vínculo contigo.",
    readTime: "4 min"
  },
  {
    id: 2,
    title: "Guía de alimentación para cachorros",
    category: "Nutrición",
    pet: "perro",
    emoji: "🐶",
    date: "20 Abr 2025",
    excerpt: "Los primeros meses son cruciales para el desarrollo de tu cachorro. Descubre cuánto, cuándo y qué darle de comer según su raza y tamaño.",
    readTime: "6 min"
  },
  {
    id: 3,
    title: "Cómo vacunar a tu mascota correctamente",
    category: "Salud",
    pet: "ambos",
    emoji: "💉",
    date: "10 Abr 2025",
    excerpt: "El esquema de vacunación es fundamental para la salud de tu mascota. Te explicamos las vacunas esenciales y los calendarios recomendados.",
    readTime: "5 min"
  }
];

module.exports = { products, blogPosts };
