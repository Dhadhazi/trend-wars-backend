const { gql } = require("apollo-server");

module.exports = gql`
  type Pair {
    word: String
    score: Int
    winner: Boolean
    total_chosen: Int
  }

  type Deck {
    _id: ID
    name: String
    description: String
    number_of_played: Int
    keywords: [String]
    start_date: String
    end_date: String
    category: Int
    geo: [String]
    pairs: [[Pair]]
  }

  input DeckInput {
    name: String
    description: String
    keywords: [String]
    start_date: String
    end_date: String
    category: Int
    geo: [String]
  }

  type Mutation {
    addDeck(deck: DeckInput): String
    deleteDeck(_id: ID): String
  }
  type Query {
    decks: [Deck]
    deckById(_id: ID): Deck
    decksByCategory(category: Int): [Deck]
  }
`;
