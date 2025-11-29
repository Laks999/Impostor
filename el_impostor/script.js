// State
let currentGameId = null;
let currentPlayerId = null;
let isHost = false;
let unsubscribe = null;

// DOM Elements
const views = {
    login: document.getElementById('view-login'),
    lobby: document.getElementById('view-lobby'),
    game: document.getElementById('view-game'),
    results: document.getElementById('view-results')
};

const inputs = {
    name: document.getElementById('player-name'),
    code: document.getElementById('game-code-input'),
    twoImpostors: document.getElementById('two-impostors')
};

const display = {
    gameCode: document.getElementById('display-game-code'),
    playerCount: document.getElementById('player-count'),
    playerList: document.getElementById('player-list'),
    waitingMsg: document.getElementById('waiting-msg'),
    roleCard: document.getElementById('role-card'),
    roleTitle: document.getElementById('role-title'),
    roleWord: document.getElementById('role-word'),
    roleDesc: document.getElementById('role-desc'),
    gameCategory: document.getElementById('game-category'),
    resultImpostor: document.getElementById('result-impostor'),
    resultWord: document.getElementById('result-word')
};

const buttons = {
    create: document.getElementById('btn-create-game'),
    join: document.getElementById('btn-join-game'),
    start: document.getElementById('btn-start-game'),
    end: document.getElementById('btn-end-game'),
    back: document.getElementById('btn-back-lobby'),
    hostControls: document.getElementById('host-controls')
};

// Event Listeners
buttons.create.addEventListener('click', handleCreateGame);
buttons.join.addEventListener('click', handleJoinGame);
buttons.start.addEventListener('click', handleStartGame);
buttons.end.addEventListener('click', handleEndGame);
buttons.back.addEventListener('click', handleBackToLobby);

display.roleCard.addEventListener('click', () => {
    display.roleCard.classList.toggle('flipped');
});

// Handlers
async function handleCreateGame() {
    const name = inputs.name.value.trim();
    if (!name) return showToast("Ingresa tu nombre", "error");

    try {
        const result = await gameService.createGame(name);
        currentGameId = result.gameId;
        currentPlayerId = result.playerId;
        isHost = true;

        setupGameSubscription();
    } catch (error) {
        console.error(error);
        showToast("Error al crear partida", "error");
    }
}

async function handleJoinGame() {
    const name = inputs.name.value.trim();
    const code = inputs.code.value.trim();

    if (!name) return showToast("Ingresa tu nombre", "error");
    if (!code || code.length !== 6) return showToast("Código inválido", "error");

    try {
        const result = await gameService.joinGame(code, name);
        currentGameId = result.gameId;
        currentPlayerId = result.playerId;
        isHost = false;

        setupGameSubscription();
    } catch (error) {
        console.error(error);
        showToast(error.message, "error");
    }
}

function setupGameSubscription() {
    if (unsubscribe) unsubscribe();

    unsubscribe = gameService.subscribeToGame(currentGameId, (gameData) => {
        renderGame(gameData);
    });
}

function renderGame(game) {
    // 1. Switch Views based on State
    switchView(game.state);

    // 2. Update Lobby
    if (game.state === 'LOBBY') {
        display.gameCode.textContent = game.code;
        display.playerCount.textContent = game.players.length;

        display.playerList.innerHTML = game.players.map(p => `
            <li class="player-item">
                <div class="player-avatar">${p.name.charAt(0).toUpperCase()}</div>
                <span>${p.name} ${p.isHost ? '(Host)' : ''}</span>
            </li>
        `).join('');

        if (isHost) {
            buttons.hostControls.classList.remove('hidden');
            display.waitingMsg.classList.add('hidden');
        } else {
            buttons.hostControls.classList.add('hidden');
            display.waitingMsg.classList.remove('hidden');
        }
    }

    // 3. Update Game View
    if (game.state === 'PLAYING') {
        const myPlayer = game.players.find(p => p.id === currentPlayerId);
        if (!myPlayer) return; // Should not happen

        // Reset card flip
        display.roleCard.classList.remove('flipped');
        display.roleCard.classList.remove('impostor-card');

        if (myPlayer.role === 'IMPOSTOR') {
            display.roleTitle.textContent = "ERES EL IMPOSTOR";
            display.roleWord.textContent = "???";
            display.roleDesc.textContent = "Intenta pasar desapercibido y adivina la palabra.";
            display.roleCard.classList.add('impostor-card');
        } else {
            display.roleTitle.textContent = "ERES CIVIL";
            display.roleWord.textContent = game.word;
            display.roleDesc.textContent = `Categoría: ${game.category}`;
        }

        display.gameCategory.textContent = game.category;

        if (isHost) {
            buttons.end.classList.remove('hidden');
        } else {
            buttons.end.classList.add('hidden');
        }
    }

    // 4. Update Results
    if (game.state === 'RESULTS') {
        const impostors = game.players.filter(p => game.impostorIds.includes(p.id));
        display.resultImpostor.textContent = impostors.map(p => p.name).join(' & ');
        display.resultWord.textContent = game.word;

        if (isHost) {
            buttons.back.classList.remove('hidden');
        } else {
            buttons.back.classList.add('hidden');
        }
    }
}

async function handleStartGame() {
    try {
        const impostorCount = inputs.twoImpostors.checked ? 2 : 1;
        const { category, word } = getRandomWord();

        await gameService.startGame(currentGameId, impostorCount, category, word);
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function handleEndGame() {
    if (confirm("¿Seguro que quieres terminar la partida y ver los resultados?")) {
        await gameService.endGame(currentGameId);
    }
}

async function handleBackToLobby() {
    await gameService.resetGame(currentGameId);
}

// Utilities
function switchView(state) {
    Object.values(views).forEach(el => el.classList.add('hidden'));

    if (state === 'LOBBY') views.lobby.classList.remove('hidden');
    else if (state === 'PLAYING') views.game.classList.remove('hidden');
    else if (state === 'RESULTS') views.results.classList.remove('hidden');
    else views.login.classList.remove('hidden'); // Fallback
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Simple inline styles for toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: type === 'error' ? '#f43f5e' : '#334155',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: '1000',
        animation: 'fadeIn 0.3s'
    });

    document.getElementById('toast-container').appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
