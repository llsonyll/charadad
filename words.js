// Categorías y palabras del juego.
// Para agregar una categoría nueva, copia un bloque y cambia id, nombre, emoji, color y palabras.
window.CATEGORIES = [
  {
    id: "animales", name: "Animales", emoji: "🐘", color: "#22c55e",
    words: ["Perro", "Gato", "Elefante", "Jirafa", "León", "Tigre", "Mono", "Canguro", "Pingüino", "Delfín",
      "Tiburón", "Ballena", "Serpiente", "Cocodrilo", "Tortuga", "Conejo", "Caballo", "Vaca", "Cerdo", "Gallina",
      "Pato", "Búho", "Águila", "Loro", "Murciélago", "Oso", "Panda", "Koala", "Cebra", "Hipopótamo",
      "Rinoceronte", "Camello", "Llama", "Rana", "Mariposa", "Abeja", "Araña", "Hormiga", "Pulpo", "Cangrejo",
      "Ardilla", "Lobo", "Zorro", "Flamenco", "Foca"]
  },
  {
    id: "peliculas", name: "Películas", emoji: "🎬", color: "#ef4444",
    words: ["Titanic", "El Rey León", "Toy Story", "Frozen", "Shrek", "Buscando a Nemo", "Jurassic Park", "Star Wars",
      "Harry Potter", "Spider-Man", "Batman", "Avengers", "Coco", "Up", "Los Increíbles", "Cars", "Mi Villano Favorito",
      "Minions", "El Señor de los Anillos", "Piratas del Caribe", "Matrix", "Rocky", "Tiburón", "E.T.",
      "Volver al Futuro", "Mamma Mia", "Aladdín", "La Sirenita", "Cenicienta", "Blancanieves", "Ratatouille",
      "Kung Fu Panda", "Madagascar", "La Era de Hielo", "Intensamente", "Encanto", "Moana", "Avatar", "King Kong",
      "Godzilla", "Indiana Jones", "Mi Pobre Angelito"]
  },
  {
    id: "profesiones", name: "Profesiones", emoji: "👷", color: "#f59e0b",
    words: ["Médico", "Bombero", "Policía", "Profesor", "Cocinero", "Piloto", "Astronauta", "Dentista", "Carpintero",
      "Albañil", "Electricista", "Plomero", "Peluquero", "Mesero", "Cantante", "Bailarín", "Pintor", "Fotógrafo",
      "Mago", "Payaso", "Veterinario", "Enfermera", "Abogado", "Juez", "Arquitecto", "Ingeniero", "Mecánico",
      "Taxista", "Cartero", "Granjero", "Pescador", "Jardinero", "Panadero", "Carnicero", "Futbolista", "Detective",
      "Científico", "Programador", "Salvavidas", "Soldado", "Cajero", "Periodista", "Actor", "Árbitro"]
  },
  {
    id: "comida", name: "Comida", emoji: "🍕", color: "#f97316",
    words: ["Pizza", "Hamburguesa", "Hot dog", "Tacos", "Sushi", "Ceviche", "Spaghetti", "Helado", "Chocolate", "Torta",
      "Galleta", "Pan", "Queso", "Huevo frito", "Palomitas", "Papas fritas", "Ensalada", "Sopa", "Arroz con pollo",
      "Pollo a la brasa", "Lomo saltado", "Empanada", "Sándwich", "Panqueques", "Plátano", "Manzana", "Sandía",
      "Piña", "Uva", "Fresa", "Limón", "Coco", "Mango", "Zanahoria", "Choclo", "Cebolla", "Ají", "Chicle",
      "Caramelo", "Gelatina", "Churros", "Dona"]
  },
  {
    id: "acciones", name: "Acciones", emoji: "🤸", color: "#ec4899",
    words: ["Nadar", "Bailar", "Cantar", "Dormir", "Roncar", "Estornudar", "Correr", "Saltar la cuerda", "Manejar",
      "Cocinar", "Llorar", "Reír", "Bostezar", "Pescar", "Surfear", "Esquiar", "Patinar", "Boxear", "Escalar",
      "Tomar una selfie", "Cepillarse los dientes", "Ducharse", "Planchar", "Barrer", "Lavar platos", "Tejer",
      "Pintar una pared", "Tocar guitarra", "Tocar batería", "Remar", "Montar bicicleta", "Montar a caballo",
      "Lanzar una pelota", "Hacer yoga", "Meditar", "Peinarse", "Maquillarse", "Afeitarse", "Aplaudir", "Silbar",
      "Abrazar", "Toser", "Tener hipo", "Ordeñar una vaca"]
  },
  {
    id: "objetos", name: "Objetos", emoji: "☂️", color: "#8b5cf6",
    words: ["Paraguas", "Tijeras", "Martillo", "Teléfono", "Reloj", "Lentes", "Llave", "Cuchara", "Tenedor", "Escoba",
      "Linterna", "Mochila", "Almohada", "Espejo", "Vela", "Guitarra", "Televisor", "Control remoto", "Lámpara",
      "Silla", "Bicicleta", "Globo", "Sombrero", "Zapato", "Cepillo de dientes", "Secadora de pelo", "Refrigeradora",
      "Microondas", "Computadora", "Audífonos", "Cámara", "Libro", "Lápiz", "Calculadora", "Billetera", "Candado",
      "Escalera", "Taladro", "Botella", "Imán", "Brújula", "Ancla"]
  },
  {
    id: "lugares", name: "Lugares", emoji: "🗺️", color: "#06b6d4",
    words: ["Playa", "Montaña", "Escuela", "Hospital", "Aeropuerto", "Cine", "Supermercado", "Biblioteca", "Museo",
      "Zoológico", "Parque", "Iglesia", "Restaurante", "Gimnasio", "Piscina", "Estadio", "Desierto", "Selva",
      "Castillo", "Granja", "Circo", "Banco", "Farmacia", "Panadería", "Peluquería", "Cárcel", "Discoteca", "Volcán",
      "Isla", "Polo Norte", "La Luna", "Machu Picchu", "París", "Egipto", "Nueva York", "China", "Mercado",
      "Cementerio", "Faro", "Parque de diversiones"]
  },
  {
    id: "deportes", name: "Deportes", emoji: "⚽", color: "#3b82f6",
    words: ["Fútbol", "Básquet", "Vóley", "Tenis", "Natación", "Boxeo", "Golf", "Béisbol", "Ciclismo", "Atletismo",
      "Surf", "Esquí", "Patinaje", "Karate", "Judo", "Lucha libre", "Ajedrez", "Ping pong", "Bádminton", "Rugby",
      "Hockey", "Gimnasia", "Esgrima", "Tiro con arco", "Remo", "Escalada", "Paracaidismo", "Equitación",
      "Skateboarding", "Bowling", "Maratón", "Salto alto", "Levantamiento de pesas", "Waterpolo", "Dardos", "Billar",
      "Fórmula 1", "Kayak", "Buceo"]
  },
  {
    id: "personajes", name: "Personajes", emoji: "🦸", color: "#e11d48",
    words: ["Superman", "Batman", "Spider-Man", "Mickey Mouse", "Bob Esponja", "Pikachu", "Mario Bros", "Homero Simpson",
      "Shrek", "Pinocho", "Caperucita Roja", "El Lobo Feroz", "Drácula", "Frankenstein", "Una momia", "Un zombi",
      "Una bruja", "Un pirata", "Un vampiro", "Un fantasma", "Un robot", "Papá Noel", "El Grinch", "Cupido",
      "Peter Pan", "Garfield", "Scooby-Doo", "Darth Vader", "Hulk", "La Mujer Maravilla", "Tarzán", "Robin Hood",
      "Sherlock Holmes", "Don Quijote", "El Chavo del 8", "Woody", "Buzz Lightyear", "Elsa", "Goku", "Sonic"]
  }
];
