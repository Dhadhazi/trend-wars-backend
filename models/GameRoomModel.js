const mongoose = require("mongoose");

const gameroomSchema = new mongoose.Schema({
  gameId: String,
  players: [{ nick: String, points: { type: Number, default: 0 } }],
  gameDeck: {
    name: String,
    description: String,
    dateString: String,
    geo: String,
    timer: Number,
    pairs: [
      [
        {
          word: String,
          score: Number,
          winner: Boolean,
          total_chosen: { type: Number, default: 0 },
        },
        {
          word: String,
          score: Number,
          winner: Boolean,
          total_chosen: { type: Number, default: 0 },
        },
      ],
    ],
  },
  state: { type: Number, default: -1 },
  answers: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const GameRoom = mongoose.model("gamerooms", gameroomSchema);

module.exports = GameRoom;
