const { gql } = require("apollo-server");

module.exports = gql`
  type Pair {
    word: String
    score: Int
    winner: Boolean
    total_chosen: Int
  }

  input PairInput {
    word: String
    score: Int
    winner: Boolean
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

  type GameDeck {
    name: String
    description: String
    dateString: String
    geo: String
    pairs: [[Pair]]
    timer: Int
  }

  input GameDeckInput {
    name: String
    description: String
    dateString: String
    geo: String
    pairs: [[PairInput]]
    timer: Int
  }

  input EditDeckInput {
    name: String
    keywords: String
  }

  type MultiPlayer {
    nick: String
    points: Int
  }

  input MultiPlayerInput {
    nick: String
  }

  type GameRoom {
    _id: ID
    gameId: String
    state: Int
    answers: Int
    players: [MultiPlayer]
    gameDeck: GameDeck
  }

  input GameRoomInput {
    creator: String
    gameDeck: GameDeckInput
  }

  type Mutation {
    addDeck(deck: DeckInput): String
    editDeck(texts: EditDeckInput): String
    deleteDeck(_id: ID): String
    addGameRoom(input: GameRoomInput): String
    joinGameRoom(nick: String, gameId: String): GameRoom
    exitGameRoom(nick: String, gameId: String): Boolean
    addPlayerAnswer(gameId: String, nick: String, winner: Boolean): Boolean
    changeGameRoomState(gameId: String, state: Int): Boolean
  }

  type Query {
    decks: [Deck]
    deckById(_id: ID): Deck
    decksByCategory(category: Int): [Deck]
    gameRooms: [GameRoom]
    gameRoomById(gameId: String): GameRoom
  }

  type Subscription {
    GameRoom(gameId: String): GameRoom
  }
`;
