const GAME_DATA = {
    categories: [
        {
            name: "Animales",
            words: ["León", "Elefante", "Jirafa", "Pingüino", "Delfín", "Águila", "Tigre", "Oso", "Canguro", "Koala"]
        },
        {
            name: "Comida",
            words: ["Pizza", "Hamburguesa", "Sushi", "Tacos", "Helado", "Chocolate", "Paella", "Ensalada", "Espagueti", "Queso"]
        },
        {
            name: "Lugares",
            words: ["Playa", "Montaña", "Cine", "Escuela", "Hospital", "Aeropuerto", "Biblioteca", "Parque", "Gimnasio", "Restaurante"]
        },
        {
            name: "Objetos de Casa",
            words: ["Silla", "Mesa", "Cama", "Lámpara", "Espejo", "Refrigerador", "Televisión", "Sofá", "Reloj", "Microondas"]
        },
        {
            name: "Profesiones",
            words: ["Médico", "Profesor", "Bombero", "Policía", "Cocinero", "Astronauta", "Pintor", "Músico", "Ingeniero", "Abogado"]
        },
        {
            name: "Deportes",
            words: ["Fútbol", "Baloncesto", "Tenis", "Natación", "Voleibol", "Golf", "Boxeo", "Ciclismo", "Atletismo", "Béisbol"]
        }
    ]
};

function getRandomWord() {
    const category = GAME_DATA.categories[Math.floor(Math.random() * GAME_DATA.categories.length)];
    const word = category.words[Math.floor(Math.random() * category.words.length)];
    return { category: category.name, word: word };
}
