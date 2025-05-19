import WebSocket from 'ws';
import { Database } from '../models/database';
import { GameService } from '../services/game.service';
import {
    Player,
    Room,
    Game,
    AttackResult,
    RegRequest,
    AddUserToRoomRequest,
    AddShipsRequest,
    AttackRequest,
    RandomAttackRequest
} from '../types';
import { generateId, createEmptyBoard, createEmptyBooleanBoard } from '../utils';

export class GameController {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    handlePlayerRegistration(ws: WebSocket, data: RegRequest, id: number): void {
        try {
            const { name, password } = data;
            const player = this.db.addPlayer(name, password);
            player.ws = ws;
            this.db.setPlayerConnection(player.index, ws);

            const response = {
                type: 'reg',
                data: {
                    name: player.name,
                    index: player.index,
                    error: false,
                    errorText: ''
                },
                id
            };

            this.send(ws, response);
            console.log('Player registered/logged in:', response);

            this.broadcastRoomUpdate();
            this.broadcastWinnersUpdate();
        } catch (error) {
            const response = {
                type: 'reg',
                data: {
                    name: data.name,
                    index: '',
                    error: true,
                    errorText: error instanceof Error ? error.message : 'Registration failed'
                },
                id
            };

            this.send(ws, response);
            console.log('Registration error:', response);
        }
    }

    handleCreateRoom(ws: WebSocket): void {
        const player = this.findPlayerByWebSocket(ws);
        if (!player) {
            this.sendError(ws, 'Player not found');
            return;
        }

        const room: Room = {
            roomId: generateId(),
            players: [player]
        };

        this.db.addRoom(room);
        console.log('Room created:', room.roomId);

        this.broadcastRoomUpdate();
    }

    handleAddUserToRoom(ws: WebSocket, data: AddUserToRoomRequest): void {
        const player = this.findPlayerByWebSocket(ws);
        if (!player) {
            this.sendError(ws, 'Player not found');
            return;
        }

        const room = this.db.getRoom(data.indexRoom);
        if (!room) {
            this.sendError(ws, 'Room not found');
            return;
        }

        if (room.players.length >= 2) {
            this.sendError(ws, 'Room is full');
            return;
        }

        room.players.push(player);

        const gameId = generateId();
        room.gameId = gameId;

        const game: Game = {
            gameId,
            players: room.players.map((p) => ({
                player: p,
                playerId: generateId(),
                ships: [],
                board: createEmptyBoard(),
                shipsMap: createEmptyBooleanBoard()
            })),
            currentPlayerIndex: 0,
            gameStarted: false,
            gameFinished: false
        };

        this.db.addGame(game);

        game.players.forEach(gamePlayer => {
            const response = {
                type: 'create_game',
                data: {
                    idGame: gameId,
                    idPlayer: gamePlayer.playerId
                },
                id: 0
            };

            if (gamePlayer.player.ws) {
                this.send(gamePlayer.player.ws, response);
                console.log('Game created for player:', response);
            }
        });

        this.db.removeRoom(room.roomId);
        this.broadcastRoomUpdate();
    }

    handleAddShips(ws: WebSocket, data: AddShipsRequest): void {
        const game = this.db.getGame(data.gameId);
        if (!game) {
            this.sendError(ws, 'Game not found');
            return;
        }

        const gamePlayer = game.players.find(gp => gp.playerId === data.indexPlayer);
        if (!gamePlayer) {
            this.sendError(ws, 'Player not found in game');
            return;
        }

        if (!GameService.validateShips(data.ships)) {
            this.sendError(ws, 'Invalid ships configuration');
            return;
        }

        gamePlayer.ships = data.ships;
        GameService.placeShipsOnBoard(gamePlayer, data.ships);

        console.log('Ships added for player:', data.indexPlayer);

        if (game.players.every(gp => gp.ships.length > 0)) {
            this.startGame(game);
        }
    }

    handleAttack(ws: WebSocket, data: AttackRequest | RandomAttackRequest): void {
        const game = this.db.getGame(data.gameId);

        if (!game) {
            this.sendError(ws, 'Game not found');
            return;
        }

        const currentPlayer = game.players.find(gp => gp.playerId === data.indexPlayer);
        if (!currentPlayer) {
            this.sendError(ws, 'Player not found in game');
            return;
        }

        if (game.players[game.currentPlayerIndex].playerId !== data.indexPlayer) {
            this.sendError(ws, 'Not your turn');
            return;
        }

        const attackCell = (data as AttackRequest);

        if (!attackCell.x || !attackCell.y) {
            const enemyPlayer = game.players[game.currentPlayerIndex === 0 ? 1 : 0];
            const randomCell = GameService.findRandomAttackPosition(enemyPlayer);

            if (!randomCell) {
                this.sendError(ws, 'No valid targets');
                return;
            }

            attackCell.x = randomCell.x;
            attackCell.y = randomCell.y;
        }

        this.processAttack(game, attackCell);
    }

    private processAttack(game: Game, { x, y }: { x: number, y: number }): void {
        const currentPlayerIndex = game.currentPlayerIndex;
        const enemyPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        const enemyPlayer = game.players[enemyPlayerIndex];

        let status: 'miss' | 'killed' | 'shot';
        let shouldContinueTurn = false;

        if (enemyPlayer.board[y][x] === 'ship') {
            enemyPlayer.board[y][x] = 'hit';

            const ship = GameService.findShipAt(enemyPlayer.ships, x, y);
            if (ship && GameService.isShipKilled(enemyPlayer, ship)) {
                status = 'killed';
                GameService.markAroundKilledShip(enemyPlayer, ship);
                shouldContinueTurn = true;

                if (GameService.areAllShipsKilled(enemyPlayer)) {
                    this.finishGame(game, currentPlayerIndex);
                    return;
                }
            } else {
                status = 'shot';
                shouldContinueTurn = true;
            }
        } else {
            enemyPlayer.board[y][x] = 'miss';
            status = 'miss';
        }

        const attackResult: AttackResult = {
            position: { x, y },
            currentPlayer: game.players[currentPlayerIndex].playerId,
            status
        };

        game.players.forEach(gamePlayer => {
            if (gamePlayer.player.ws) {
                this.send(gamePlayer.player.ws, {
                    type: 'attack',
                    data: attackResult,
                    id: 0
                });
            }
        });

        console.log('Attack result:', attackResult);

        if (!shouldContinueTurn) {
            game.currentPlayerIndex = enemyPlayerIndex;
        }

        this.sendTurnInfo(game);
    }

    private startGame(game: Game): void {
        game.gameStarted = true;

        game.players.forEach(gamePlayer => {
            const response = {
                type: 'start_game',
                data: {
                    ships: gamePlayer.ships,
                    currentPlayerIndex: gamePlayer.playerId
                },
                id: 0
            };

            if (gamePlayer.player.ws) {
                this.send(gamePlayer.player.ws, response);
                console.log('Game started for player:', response);
            }
        });

        this.sendTurnInfo(game);
    }

    private sendTurnInfo(game: Game): void {
        const currentPlayer = game.players[game.currentPlayerIndex];

        game.players.forEach(gamePlayer => {
            if (gamePlayer.player.ws) {
                this.send(gamePlayer.player.ws, {
                    type: 'turn',
                    data: {
                        currentPlayer: currentPlayer.playerId
                    },
                    id: 0
                });
            }
        });

        console.log('Turn info sent, current player:', currentPlayer.playerId);
    }

    private finishGame(game: Game, winnerIndex: number): void {
        game.gameFinished = true;
        const winner = game.players[winnerIndex];

        winner.player.wins++;

        game.players.forEach(gamePlayer => {
            if (gamePlayer.player.ws) {
                this.send(gamePlayer.player.ws, {
                    type: 'finish',
                    data: {
                        winPlayer: winner.playerId
                    },
                    id: 0
                });
            }
        });

        console.log('Game finished, winner:', winner.playerId);

        this.broadcastWinnersUpdate();
    }

    broadcastRoomUpdate(): void {
        const rooms = this.db.getRooms().map(room => ({
            roomId: room.roomId,
            roomUsers: room.players.map(player => ({
                name: player.name,
                index: player.index
            }))
        }));

        const message = {
            type: 'update_room',
            data: rooms,
            id: 0
        };

        this.broadcast(message);
        console.log('Room update broadcasted:', rooms);
    }

    broadcastWinnersUpdate(): void {
        const winners = this.db.getAllPlayers()
            .map(player => ({
                name: player.name,
                wins: player.wins
            }))
            .sort((a, b) => b.wins - a.wins);

        const message = {
            type: 'update_winners',
            data: winners,
            id: 0
        };

        this.broadcast(message);
        console.log('Winners update broadcasted:', winners);
    }

    private broadcast(message: any): void {
        for (const [_, ws] of this.db.getPlayerConnections()) {
            if (ws.readyState === WebSocket.OPEN) {
                this.send(ws, message);
            }
        }
    }

    private send(ws: WebSocket, message: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    private sendError(ws: WebSocket, errorText: string): void {
        const message = {
            type: 'error',
            data: { error: true, errorText },
            id: 0
        };
        this.send(ws, message);
    }

    private findPlayerByWebSocket(ws: WebSocket): Player | undefined {
        for (const player of this.db.getAllPlayers()) {
            if (player.ws === ws) {
                return player;
            }
        }
        return undefined;
    }
}
