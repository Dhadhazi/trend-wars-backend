const mongoose = require("mongoose");

const deckSchema = new mongoose.Schema({
  name: String,
  description: String,
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
      },
      {
        word: String,
        score: Number,
        winner: Boolean,
      },
    ],
  ],
  approved: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

const Deck = mongoose.model("decks", deckSchema);

module.exports = Deck;
