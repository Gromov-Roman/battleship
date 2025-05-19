import { Ship, GamePlayer } from '../types';

const SHIPS_COUNT = 10;
const SHIPS_TYPES = ['huge', 'large', 'large', 'medium', 'medium', 'medium', 'small', 'small', 'small', 'small'];
const SHIPS_LENGTHS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

export class GameService {
    static validateShips(ships: Ship[]): boolean {
        if (ships.length !== SHIPS_COUNT) {
            return false;
        }

        const shipTypes = ships.map(ship => ship.type).sort();
        const expectedTypes = SHIPS_TYPES.sort();

        if (JSON.stringify(shipTypes) !== JSON.stringify(expectedTypes)) {
            return false;
        }

        const shipLengths = ships.map(ship => ship.length).sort();
        const expectedLengths = SHIPS_LENGTHS.sort();

        if (JSON.stringify(shipLengths) !== JSON.stringify(expectedLengths)) {
            return false;
        }

        const occupiedCells = new Set<string>();

        for (const ship of ships) {
            for (let i = 0; i < ship.length; i++) {
                const { x, y } = this.getDirectedPositions(ship, i);

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
        gamePlayer.board = Array(10)
            .fill(null)
            .map(() => Array(10).fill('empty'));

        gamePlayer.shipsMap = Array(10)
            .fill(null)
            .map(() => Array(10).fill(false));

        for (const ship of ships) {
            for (let i = 0; i < ship.length; i++) {
                const { x, y } = this.getDirectedPositions(ship, i);

                gamePlayer.board[x][y] = 'ship';
                gamePlayer.shipsMap[x][y] = true;
            }
        }
    }

    static findShipAt(ships: Ship[], x: number, y: number): Ship | undefined {
        return ships.find(ship => {
            for (let i = 0; i < ship.length; i++) {
                const { x: shipX, y: shipY } = this.getDirectedPositions(ship, i);

                if (shipX === x && shipY === y) {
                    return true;
                }
            }

            return false;
        });
    }

    static isShipKilled(gamePlayer: GamePlayer, ship: Ship): boolean {
        for (let i = 0; i < ship.length; i++) {
            const { x, y } = this.getDirectedPositions(ship, i);

            if (gamePlayer.board[x][y] !== 'hit') {
                return false;
            }
        }

        return true;
    }

    static markAroundKilledShip(gamePlayer: GamePlayer, ship: Ship): { x: number, y: number }[] {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        const aroundCells = [];

        for (let i = 0; i < ship.length; i++) {
            const { x: shipX, y: shipY } = this.getDirectedPositions(ship, i);

            for (const [dx, dy] of directions) {
                const x = shipX + dx;
                const y = shipY + dy;

                if (x >= 0 && x < 10 && y >= 0 && y < 10 && gamePlayer.board[x][y] === 'empty') {
                    aroundCells.push({ y, x });
                }
            }
        }

        return aroundCells;
    }

    static areAllShipsKilled(gamePlayer: GamePlayer): boolean {
        return gamePlayer.ships.every((ship: Ship) => this.isShipKilled(gamePlayer, ship));
    }

    static findRandomAttackPosition(gamePlayer: GamePlayer): { x: number, y: number } | null {
        const emptyCells: { x: number, y: number }[] = [];

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (gamePlayer.board[x][y] === 'empty' || gamePlayer.board[x][y] === 'ship') {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length === 0) {
            return null;
        }

        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    static getDirectedPositions({ direction, position: { x, y } }: Ship, step: number): { x: number, y: number } {
        return { x: direction ? x : x + step, y: !direction ? y : y + step };
    }
}
