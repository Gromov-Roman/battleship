# WebSocket Battleship Server

A Node.js WebSocket server implementation for the Battleship game, built according to the specifications.

## Installation

1. Make sure you have Node.js 22.14.0 or higher installed
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the server in development mode:
   ```bash
   npm run dev
   ```

## Production

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Features

- WebSocket-based real-time communication
- Player registration and authentication
- Room creation and management
- Ship placement validation
- Turn-based gameplay
- Attack processing (including random attacks)
- Winner tracking and leaderboard
- Complete game state management

## Game Flow

1. Players register with username/password
2. Player creates a room or joins an existing room
3. Once 2 players are in a room, a game is created
4. Players place their ships on their boards
5. Players take turns attacking enemy positions
6. Game ends when all of one player's ships are destroyed
7. Winner statistics are updated and broadcasted

## WebSocket Commands

The server handles the following message types:
- `reg` - Player registration/login
- `create_room` - Create new game room
- `add_user_to_room` - Join existing room
- `add_ships` - Place ships on board
- `attack` - Attack specific coordinates
- `randomAttack` - Attack random valid coordinates

## Architecture

- **Database**: In-memory storage for players, rooms, and games
- **Game Logic**: Complete battleship rules implementation
- **WebSocket Management**: Real-time bidirectional communication
- **Error Handling**: Comprehensive error responses

## Port

The server runs on port 3000 by default, or the port specified in the `PORT` environment variable.
