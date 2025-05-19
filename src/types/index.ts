import { WebSocket } from 'ws';

export interface Player {
    name: string;
    password: string;
    index: string;
    wins: number;
    ws?: WebSocket;
}

export interface Ship {
    position: { x: number; y: number };
    direction: boolean;
    length: number;
    type: 'small' | 'medium' | 'large' | 'huge';
}

export interface Room {
    roomId: string;
    players: Player[];
    gameId?: string;
}

export interface GamePlayer {
    player: Player;
    playerId: string;
    ships: Ship[];
    board: ('empty' | 'ship' | 'hit' | 'miss')[][];
    shipsMap: boolean[][];
}

export interface Game {
    gameId: string;
    players: GamePlayer[];
    currentPlayerIndex: number;
    gameStarted: boolean;
    gameFinished: boolean;
}

export interface AttackResult {
    position: { x: number; y: number };
    currentPlayer: string;
    status: 'miss' | 'killed' | 'shot';
}

export interface WSMessage {
    type: string;
    data: any;
    id: number;
}

export interface RegRequest {
    name: string;
    password: string;
}

export interface RegResponse {
    name: string;
    index: string;
    error: boolean;
    errorText: string;
}

export interface CreateRoomRequest {
}

export interface AddUserToRoomRequest {
    indexRoom: string;
}

export interface CreateGameResponse {
    idGame: string;
    idPlayer: string;
}

export interface AddShipsRequest {
    gameId: string;
    ships: Ship[];
    indexPlayer: string;
}

export interface StartGameResponse {
    ships: Ship[];
    currentPlayerIndex: string;
}

export interface AttackRequest {
    gameId: string;
    x: number;
    y: number;
    indexPlayer: string;
}

export interface RandomAttackRequest {
    gameId: string;
    indexPlayer: string;
}

export interface TurnResponse {
    currentPlayer: string;
}

export interface FinishResponse {
    winPlayer: string;
}

export interface UpdateRoomResponse {
    roomId: string;
    roomUsers: {
        name: string;
        index: string;
    }[];
}

export interface UpdateWinnersResponse {
    name: string;
    wins: number;
}
