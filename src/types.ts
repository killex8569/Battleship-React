export type TileState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
export type GameStatus = 'waiting' | 'placement' | 'started' | 'finished';

export interface Tile {
    row: number;
    col: number;
    state: TileState;
}

export interface Ship {
    id: number;
    name: string;
    tacticalName: string;
    length: number;   // corrigé : était "lenght"
    isSunk: boolean;
    hits: number;
    size: number;     // alias de length pour les composants
    cells: { row: number; col: number }[];
}

export interface Player {
    id: number;
    name: string;
}

export interface Game {
    id: number;
    status: GameStatus;
    gridSize: number;
    shipCount: number;
    currentTurnPlayerId: number | null;
    winnerPlayerId: number | null;
    createdAt: string;
    player1: Player;
    player2: Player | null;
}