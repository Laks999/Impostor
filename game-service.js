class GameService {
    constructor() {
        this.collection = db.collection('games');
    }

    // Generates a random 6-digit code
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async createGame(hostName) {
        const code = this.generateCode();
        const playerId = Date.now().toString(); // Simple ID generation

        const initialData = {
            code: code,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            state: 'LOBBY', // LOBBY, PLAYING, RESULTS
            category: '',
            word: '',
            impostorCount: 1,
            impostorIds: [],
            players: [{
                id: playerId,
                name: hostName,
                isHost: true,
                role: null // 'CIVILIAN' or 'IMPOSTOR'
            }]
        };

        const docRef = await this.collection.add(initialData);
        return { gameId: docRef.id, code: code, playerId: playerId };
    }

    async joinGame(code, playerName) {
        // Query for the game with this code
        const snapshot = await this.collection.where('code', '==', code).limit(1).get();

        if (snapshot.empty) {
            throw new Error("Partida no encontrada");
        }

        const gameDoc = snapshot.docs[0];
        const gameData = gameDoc.data();

        if (gameData.state !== 'LOBBY') {
            throw new Error("La partida ya ha comenzado");
        }

        // Check if name already exists
        if (gameData.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
            throw new Error("Ese nombre ya está en uso en esta sala");
        }

        const playerId = Date.now().toString();
        const newPlayer = {
            id: playerId,
            name: playerName,
            isHost: false,
            role: null
        };

        await gameDoc.ref.update({
            players: firebase.firestore.FieldValue.arrayUnion(newPlayer)
        });

        return { gameId: gameDoc.id, playerId: playerId };
    }

    subscribeToGame(gameId, onUpdate) {
        return this.collection.doc(gameId).onSnapshot((doc) => {
            if (doc.exists) {
                onUpdate(doc.data());
            }
        });
    }

    async startGame(gameId, impostorCount, category, word) {
        // Fetch current players to assign roles
        const gameRef = this.collection.doc(gameId);
        const doc = await gameRef.get();
        const players = doc.data().players;

        if (players.length < 3) {
            throw new Error("Se necesitan mínimo 3 jugadores");
        }

        if (impostorCount === 2 && players.length < 5) {
            throw new Error("Se necesitan mínimo 5 jugadores para 2 impostores");
        }

        // Assign roles
        const shuffledIndices = [...Array(players.length).keys()]
            .sort(() => Math.random() - 0.5);

        const impostorIndices = shuffledIndices.slice(0, impostorCount);
        const impostorIds = [];

        const updatedPlayers = players.map((p, index) => {
            const isImpostor = impostorIndices.includes(index);
            if (isImpostor) impostorIds.push(p.id);
            return {
                ...p,
                role: isImpostor ? 'IMPOSTOR' : 'CIVILIAN'
            };
        });

        await gameRef.update({
            state: 'PLAYING',
            impostorCount: impostorCount,
            category: category,
            word: word,
            players: updatedPlayers,
            impostorIds: impostorIds
        });
    }

    async endGame(gameId) {
        await this.collection.doc(gameId).update({
            state: 'RESULTS'
        });
    }

    async resetGame(gameId) {
        // Reset to lobby for a new round
        const gameRef = this.collection.doc(gameId);
        const doc = await gameRef.get();
        const players = doc.data().players.map(p => ({ ...p, role: null }));

        await gameRef.update({
            state: 'LOBBY',
            category: '',
            word: '',
            impostorIds: [],
            players: players
        });
    }
}

const gameService = new GameService();
