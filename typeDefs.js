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
    _id: String
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

  input RegistrationInput {
    email: String
    password: String
  }

  type Mutation {
    # Deck Resolvers
    userAddDeck(deck: DeckInput): String
    addDeck(deck: DeckInput): String
    approveDeck(deck: DeckInput): String
    deleteDeck(_id: ID): String

    # Multiplayer Resolvers
    addGameRoom(input: GameRoomInput): String
    nickExistsCheck(nick: String, gameId: String): Boolean
    joinGameRoom(nick: String, gameId: String): GameRoom
    exitGameRoom(nick: String, gameId: String): Boolean
    addPlayerAnswer(gameId: String, nick: String, winner: Boolean): Boolean
    changeGameRoomState(gameId: String, state: Int): Boolean

    # User Resolvers
    registerUser(input: RegistrationInput): Boolean
  }

  type Query {
    decks: [Deck]
    decksUnapproved: [Deck]
    deckById(_id: ID): Deck
    decksByCategory(category: Int): [Deck]
  }

  type Subscription {
    GameRoom(gameId: String): GameRoom
  }
`;
