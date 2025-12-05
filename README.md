
# ♟️ Multiplayer Chess Game (Real-Time, Socket.io)

A real-time multiplayer chess game built using **Next.js + Zustand + Socket.IO + Chess.js + Node.js**.  
Supports two-player gameplay, optimistic UI, full rule enforcement, and real-time synchronization.

---

## 🚀 Tech Stack

### **Frontend**
- Next.js / React
- Zustand (state management)
- TailwindCSS
- Socket.IO Client
- Chess.js (move validation + engine)
  
### **Backend**
- Node.js
- Socket.IO Server
- Chess.js engine  
- In-memory Room & Game Manager

---

## 🧬 Architecture Overview

### 🏁 Game Flow
1. **Player 1** creates a room  
2. **Player 2** joins using the room ID  
3. Both players load the chess UI and send `"player-ready"`  
4. Backend starts the game and assigns colors  
5. Players make moves which are validated server-side  
6. Backend broadcasts new board state + SAN history  
7. Both UIs update instantly  

---

## ⚡ Real-Time Socket Events

### **Frontend → Backend**
| Event | Payload | Description |
|-------|---------|-------------|
| `create-room` | none | Player 1 creates a new room |
| `join-room` | `{ roomId }` | Player 2 joins the room |
| `player-ready` | none | Player confirms they're ready |
| `move` | `{ from, to }` | Chess move request |
| `reconnect-to-room` | `{ roomId, playerId }` | Recover game after refresh |

---

### **Backend → Frontend**
| Event | Payload | Description |
|-------|---------|-------------|
| `room-created` | `{ room, player_id }` | Sent to creator |
| `room-joined` | `{ room, player_id }` | Sent to joiner |
| `game-started` | `{ board, color, playertoMove }` | Game initialization |
| `move-played` | `{ board, lastMove, turn, history }` | Updated state |
| `invalid-move` | `{ message }` | Move rejected |
| `invalid-chance` | `{ message }` | Not your turn |
| `check` | `{ message }` | Player in check |
| `draw` | `{ message }` | Draw |
| `Game-over` | `{ winner }` | Checkmate |

---

## 🔮 Future Improvements

- ⏱️ Game timers  
- 🔁 Undo / rematch system  
- 👀 Spectator mode  
- 🗄️ Redis store for rooms (to survive server restarts)  
- 📝 Match history database (persistent storage)  

---

## 🤝 Contributing

Pull requests are welcome!  
You can help improve:

- UI/UX  
- Game logic  
- Reconnection flow  
- Performance  
- New features  

If you have ideas or improvements, feel free to contribute.

---

## 📜 License

This project is licensed under the **MIT License**.

---

### Want Enhancements?

I can add:

- ✅ Images / GIFs demo  
- ✅ Better markdown formatting  
- ✅ Badge icons (build passing, license, tech stack)  
- ✅ More documentation for socket events or Zustand logic  

Just tell me!



