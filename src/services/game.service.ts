import { Ship, GamePlayer } from '../types';

export class GameService {
    static validateShips(ships: Ship[]): boolean {
        if (ships.length !== 4) {
            return false;
        }

        const shipTypes = ships.map(ship => ship.type).sort();
        const expectedTypes = ['huge', 'large', 'medium', 'small'].sort();

        if (JSON.stringify(shipTypes) !== JSON.stringify(expectedTypes)) {
            return false;
        }

        const shipLengths = ships.map(ship => ship.length).sort();
        const expectedLengths = [4, 3, 2, 1].sort();

        if (JSON.stringify(shipLengths) !== JSON.stringify(expectedLengths)) {
            return false;
        }

        const occupiedCells = new Set<string>();

        for (const ship of ships) {
            for (let i = 0; i < ship.length; i++) {
                const x = ship.direction ? ship.position.x + i : ship.position.x;
                const y = ship.direction ? ship.position.y : ship.position.y + i;

                if (x < 0 || x >= 10 || y < 0 || y >= 10) {
                    return false;
                }

                const cellKey = `${x},${y}`;

                if (occupiedCells.has(cellKey)) {
                    return false;
                }

                occupiedCells.add(cellKey);
            }
        }

        return true;
    }

    static placeShipsOnBoard(gamePlayer: GamePlayer, ships: Ship[]): void {
        gamePlayer.board = Array(10).fill(null).map(() => Array(10).fill('empty'));
        gamePlayer.shipsMap = Array(10).fill(null).map(() => Array(10).fill(false));

        for (const ship of ships) {
            for (let i = 0; i < ship.length; i++) {
                const x = ship.direction ? ship.position.x + i : ship.position.x;
                const y = ship.direction ? ship.position.y : ship.position.y + i;
                gamePlayer.board[y][x] = 'ship';
                gamePlayer.shipsMap[y][x] = true;
            }
        }
    }

    static findShipAt(ships: Ship[], x: number, y: number): Ship | undefined {
        return ships.find(ship => {
            for (let i = 0; i < ship.length; i++) {
                const shipX = ship.direction ? ship.position.x + i : ship.position.x;
                const shipY = ship.direction ? ship.position.y : ship.position.y + i;

                if (shipX === x && shipY === y) {
                    return true;
                }
            }

            return false;
        });
    }

    static isShipKilled(gamePlayer: GamePlayer, ship: Ship): boolean {
        for (let i = 0; i < ship.length; i++) {
            const x = ship.direction ? ship.position.x + i : ship.position.x;
            const y = ship.direction ? ship.position.y : ship.position.y + i;

            if (gamePlayer.board[y][x] !== 'hit') {
                return false;
            }
        }

        return true;
    }

    static markAroundKilledShip(gamePlayer: GamePlayer, ship: Ship): void {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let i = 0; i < ship.length; i++) {
            const shipX = ship.direction ? ship.position.x + i : ship.position.x;
            const shipY = ship.direction ? ship.position.y : ship.position.y + i;

            for (const [dx, dy] of directions) {
                const x = shipX + dx;
                const y = shipY + dy;

                if (x >= 0 && x < 10 && y >= 0 && y < 10 && gamePlayer.board[y][x] === 'empty') {
                    gamePlayer.board[y][x] = 'miss';
                }
            }
        }
    }

    static areAllShipsKilled(gamePlayer: GamePlayer): boolean {
        return gamePlayer.ships.every((ship: Ship) => this.isShipKilled(gamePlayer, ship));
    }

    static findRandomAttackPosition(gamePlayer: GamePlayer): { x: number, y: number } | null {
        const emptyCells: { x: number, y: number }[] = [];

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (gamePlayer.board[y][x] === 'empty' || gamePlayer.board[y][x] === 'ship') {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length === 0) {
            return null;
        }

        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
}
