// Configuración del juego
const GameConfig = {
    fieldSize: { width: 80, height: 120 },
    goalSize: { width: 7.5, height: 2.5 },
    matchDuration: 90, // minutos
    teamSize: 5
};

// Estados del juego
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GOAL: 'goal',
    END: 'end'
};

// Sistema de habilidades especiales
const SpecialSkills = {
    TSUBASA: {
        name: 'Drive Shot',
        power: 3.0,
        effect: 'curva',
        cooldown: 30
    },
    HYUGA: {
        name: 'Tiger Shot',
        power: 3.5,
        effect: 'potencia',
        cooldown: 40
    },
    MISAKI: {
        name: 'Golden Duo',
        power: 2.5,
        effect: 'pase preciso',
        cooldown: 25
    },
    WAKABAYASHI: {
        name: 'God Catch',
        power: 0,
        effect: 'atajada segura',
        cooldown: 60
    }
};

export { GameConfig, GameState, SpecialSkills };￼Enter
