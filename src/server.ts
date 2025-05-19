import WebSocket from 'ws';
import { createServer } from 'http';
import { Database } from './models/database';
import { GameController } from './controllers/game.controller';
import { WSMessage } from './types';

export class BattleshipServer {
    private readonly db: Database;
    private readonly gameController: GameController;
    private readonly wss: WebSocket.Server;

    constructor(port: number = 3000) {
        this.db = new Database();
        this.gameController = new GameController(this.db);

        const server = createServer();
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', this.handleConnection.bind(this));

        server.listen(port, () => {
            console.log(`WebSocket server started on port ${port}`);
            console.log(`WebSocket URL: ws://localhost:${port}`);
        });
    }

    private handleConnection(ws: WebSocket): void {
        console.log('New WebSocket connection established');

        ws.on('message', (message: string) => {
            try {
                const data: WSMessage = JSON.parse(message);
                console.log('Received command:', data);
                this.handleMessage(ws, data);
            } catch (error) {
                console.error('Error parsing message:', error);
                this.sendError(ws, 'Invalid JSON format');
            }
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed');
            this.handleDisconnection(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    private handleDisconnection(ws: WebSocket): void {
        for (const [playerIndex, connection] of this.db.getPlayerConnections()) {
            if (connection === ws) {
                this.db.removePlayerConnection(playerIndex);
                console.log('Player disconnected:', playerIndex);
                break;
            }
        }
    }

    private handleMessage(ws: WebSocket, message: WSMessage): void {
        const { type, data, id } = message;

        switch (type) {
            case 'reg':
                this.gameController.handlePlayerRegistration(ws, data, id);
                break;
            case 'create_room':
                this.gameController.handleCreateRoom(ws);
                break;
            case 'add_user_to_room':
                this.gameController.handleAddUserToRoom(ws, data);
                break;
            case 'add_ships':
                this.gameController.handleAddShips(ws, data);
                break;
            case 'attack':
                this.gameController.handleAttack(ws, data);
                break;
            case 'randomAttack':
                this.gameController.handleAttack(ws, data);
                break;
            default:
                console.log('Unknown command type:', type);
                this.sendError(ws, 'Unknown command type');
        }
    }

    private sendError(ws: WebSocket, errorText: string): void {
        const message = {
            type: 'error',
            data: { error: true, errorText },
            id: 0
        };

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    public close(): void {
        console.log('Shutting down WebSocket server...');

        this.wss.close(() => console.log('WebSocket server closed'));
    }
}

if (require.main === module) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const server = new BattleshipServer(port);

    process.on('SIGINT', () => {
        console.log('Received SIGINT, shutting down gracefully');
        server.close();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully');
        server.close();
        process.exit(0);
    });
}

export default BattleshipServer;
