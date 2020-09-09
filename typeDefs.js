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
    approved: Boolean
    created_at: String
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
    heads: [String]
  }

  type HeadSpace {
    gameId: String
    heads: [Int]
  }

  input GameRoomInput {
    creator: String
    gameDeck: GameDeckInput
  }

  input RegLogInput {
    email: String
    password: String
  }

  type UserData {
    token: String
    permission: String
  }

  type Mutation {
    # Deck Resolvers
    userAddDeck(deck: DeckInput): String
    approveDeck(deck: DeckInput): String
    editDeck(deck: DeckInput): String
    deleteDeck(_id: ID): String

    # Multiplayer Resolvers
    addGameRoom(input: GameRoomInput): String
    nickExistsOrFullCheck(nick: String, gameId: String): Int
    joinGameRoom(nick: String, gameId: String): GameRoom
    exitGameRoom(nick: String, gameId: String): Boolean
    addPlayerAnswer(gameId: String, nick: String, winner: Boolean): Boolean
    changeGameRoomState(gameId: String, state: Int): Boolean

    # Headsending Resolvers
    sendHead(gameId: String, head: Int): Boolean
    deleteSpace(gameId: String): Boolean

    # User Resolvers
    registerUser(input: RegLogInput): Boolean
    loginUser(input: RegLogInput): UserData
    isAdmin(token: String): Boolean
  }

  type Query {
    #Deck Queries
    decks: [Deck]
    decksUnapproved: [Deck]
    deckById(_id: ID): Deck
    decksByCategory(category: Int): [Deck]
  }

  type Subscription {
    GameRoom(gameId: String): GameRoom
    HeadSpace(gameId: String): HeadSpace
  }
`;
