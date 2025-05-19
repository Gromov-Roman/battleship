import WebSocket from 'ws';
import { Player, Room, Game } from '../types';
import { generateId } from '../utils';

export class Database {
    private players: Map<string, Player> = new Map();
    private rooms: Map<string, Room> = new Map();
    private games: Map<string, Game> = new Map();
    private playerConnections: Map<string, WebSocket> = new Map();

    // Player methods
    addPlayer(name: string, password: string): Player {
        const existingPlayer = this.players.get(name);
        if (existingPlayer) {
            if (existingPlayer.password === password) {
                return existingPlayer;
            } else {
                throw new Error('Invalid password');
            }
        }

        const player: Player = {
            name,
            password,
            index: generateId(),
            wins: 0
        };
        this.players.set(name, player);
        return player;
    }

    getPlayer(name: string): Player | undefined {
        return this.players.get(name);
    }

    getAllPlayers(): Player[] {
        return Array.from(this.players.values());
    }

    // Room methods
    addRoom(room: Room): void {
        this.rooms.set(room.roomId, room);
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    getRooms(): Room[] {
        return Array.from(this.rooms.values()).filter(room => room.players.length === 1);
    }

    removeRoom(roomId: string): void {
        this.rooms.delete(roomId);
    }

    // Game methods
    addGame(game: Game): void {
        this.games.set(game.gameId, game);
    }

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    // Connection methods
    setPlayerConnection(playerIndex: string, ws: WebSocket): void {
        this.playerConnections.set(playerIndex, ws);
    }

    getPlayerConnection(playerIndex: string): WebSocket | undefined {
        return this.playerConnections.get(playerIndex);
    }

    removePlayerConnection(playerIndex: string): void {
        this.playerConnections.delete(playerIndex);
    }

    getPlayerConnections(): Map<string, WebSocket> {
        return this.playerConnections;
    }
}
