# ♟️ Multiplayer Chess Game (Real-Time, Socket.io)

A real-time multiplayer chess game built using **Next.js 16 + Zustand + Socket.IO + Chess.js + Node.js**.  
Supports two-player gameplay, optimistic UI, full rule enforcement, real-time synchronization, and connection recovery.

---

## 🚀 Tech Stack

### **Frontend** (`chess-frontend`)
- **Framework**: Next.js 16 (React 19)
- **State Management**: Zustand
- **Styling**: TailwindCSS v4
- **UI Components**: Shadcn/UI (Radix Primitives), Lucide React
- **Real-time**: Socket.IO Client
- **Game Logic**: Chess.js
- **Utilities**: clsx, tailwind-merge

### **Backend** (`chess`)
- **Runtime**: Node.js
- **Server**: Express
- **Real-time**: Socket.IO Server
- **Game Logic**: Chess.js
- **Storage**: In-memory Room & Game Manager 

---

## 🧬 Architecture Overview

### 🏁 Game Flow
1. **Player 1** creates a room, selects time control (3/5/10 min or unlimited), and receives a Room ID.
2. **Player 2** joins using the Room ID.
3. Both players send `"player-ready"`.
4. When both are ready, the **backend starts the game**, assigning White/Black colors.
5. Players make moves:
   - **Optimistic UI**: Move appears instantly on client.
   - **Validation**: Server validates move via `chess.js`.
   - **Broadcast**: New board state sent to both players.
   - **Timer**: Countdown runs during each player's turn.
6. **Game Over**: Checkmate, Draw, Timeout, or Disconnect ends the game.

### 🔊 Features
- **Game Timers**: 3/5/10 minute options with real-time countdown clock
- **Optimistic Updates**: Immediate visual feedback for moves.
- **Sound Effects**: distinct sounds for moves and captures.
- **Reconnection**: Browser refresh restores game state via `localStorage`.
- **Pawn Promotion**: Modal UI for selecting promotion piece.
- **Room Validation**: Checks for existing rooms and full lobbies.
- **Game End Reasons**: Checkmate, Timeout, Disconnect, Draw with descriptive messages

---

## ⚡ Real-Time Socket Events

### **Frontend → Backend**
| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | `{ timeControl }` | Player 1 creates a room with time control (3/5/10/none) |
| `join-room` | `{ roomId }` | Player 2 joins the room |
| `player-ready` | `{ playerId }` | Player confirms readiness |
| `move` | `{ from, to, promotion? }` | Chess move request (promotion optional) |
| `reconnect-game` | `{ roomId, playerId }` | Request to recover game state |

---

### **Backend → Frontend**
| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `{ room, player_id, message, timeControl }` | Sent to creator |
| `room-joined` | `{ room, player_id, message }` | Sent to joiner |
| `game-started` | `{ board, color, playertoMove, timeControl, timer }` | Game start with initial state |
| `move-played` | `{ board, lastMove, turn, history, ... }` | Broadcast new game state |
| `timer-update` | `{ white, black }` | Timer countdown every second |
| `promotion-required`| `{ from, to, message }` | Request user to select promotion piece |
| `reconnected-game` | `{ board, color, turn, history, timeControl, timer }` | Restores full game state on reconnect |
| `invalid-move` | `{ message, from, to }` | Move rejected by server |
| `invalid-chance` | `{ message, turn }` | Action attempted out of turn |
| `check` | `{ message }` | King is in check |
| `draw` | `{ message }` | Game ends in draw |
| `Game-over` | `{ winner, message }` | Checkmate |
| `game-ended` | `{ winner, reason, message }` | Game over (checkmate/timeout/disconnect) |
| `room-full` | `{ code, message }` | Room capacity reached |
| `error-room` | `{ code, message }` | Room does not exist |

---

## 🔮 Future Improvements

- 👀 Spectator mode
- 🗄️ **Redis Integration**: Fully persist rooms/games to survive server restarts (Dependencies already installed)
- 📝 Match history database
- 🔐 User authentication with Better Auth + Neon DB
- 📊 Win/Loss/Draw statistics tracking 

---

## 🤝 Contributing

Pull requests are welcome!  
You can help improve:

- UI/UX refinements
- Server robustness
- Test coverage

---

## 📜 License

This project is licensed under the **MIT License**.
