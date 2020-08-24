const mongoose = require("mongoose");

const deckSchema = new mongoose.Schema({
  name: String,
  description: String,
  number_of_played: { type: Number, default: 0 },
  keywords: [String],
  start_date: String,
  end_date: String,
  geo: [String],
  category: Number,
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
  created_at: { type: Date, default: Date.now },
});

const Deck = mongoose.model("decks", deckSchema);

module.exports = Deck;
