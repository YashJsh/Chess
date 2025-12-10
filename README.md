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
- **Storage**: In-memory Room & Game Manager (Redis dependency included for future use)

---

## 🧬 Architecture Overview

### 🏁 Game Flow
1. **Player 1** creates a room and receives a Room ID.
2. **Player 2** joins using the Room ID.
3. Both players send `"player-ready"`.
4. When both are ready, the **backend starts the game**, assigning White/Black colors.
5. Players make moves:
   - **Optimistic UI**: Move appears instantly on client.
   - **Validation**: Server validates move via `chess.js`.
   - **Broadcast**: New board state sent to both players.
6. **Game Over**: Checkmate, Draw, or Stalemate ends the game.

### 🔊 Features
- **Optimistic Updates**: Immediate visual feedback for moves.
- **Sound Effects**: distinct sounds for moves and captures.
- **Reconnection**: Browser refresh restores game state via `localStorage`.
- **Pawn Promotion**: Modal UI for selecting promotion piece.
- **Room Validation**: Checks for existing rooms and full lobbies.

---

## ⚡ Real-Time Socket Events

### **Frontend → Backend**
| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | none | Player 1 creates a new room |
| `join-room` | `{ roomId }` | Player 2 joins the room |
| `player-ready` | `{ playerId }` | Player confirms readiness |
| `move` | `{ from, to, promotion? }` | Chess move request (promotion optional) |
| `reconnect-game` | `{ roomId, playerId }` | Request to recover game state |

---

### **Backend → Frontend**
| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `{ room, player_id, message }` | Sent to creator |
| `room-joined` | `{ room, player_id, message }` | Sent to joiner |
| `game-started` | `{ board, color, playertoMove }` | Game start with initial state |
| `move-played` | `{ board, lastMove, turn, history, ... }` | Broadcast new game state |
| `promotion-required`| `{ from, to, message }` | Request user to select promotion piece |
| `reconnected` | `{ board, color, turn, history, ... }` | Restores full game state |
| `invalid-move` | `{ message, from, to }` | Move rejected by server |
| `invalid-chance` | `{ message, turn }` | Action attempted out of turn |
| `check` | `{ message }` | King is in check |
| `draw` | `{ message }` | Game ends in draw |
| `Game-over` | `{ winner, message }` | Checkmate |
| `room-full` | `{ code, message }` | Room capacity reached |
| `error-room` | `{ code, message }` | Room does not exist |

---

## 🔮 Future Improvements

- ⏱️ Game timers (server-side clock)
- 👀 Spectator mode
- 🗄️ **Redis Integration**: Fully persist rooms/games to survive server restarts (Dependencies already installed)
- 📝 Match history database 

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
