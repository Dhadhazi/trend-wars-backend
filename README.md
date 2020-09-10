# TL;DR
This part is the backend for 2020's highest-rated trend wars game in its category! Can check a lot of other docs in [the frontend repo](https://github.com/Dhadhazi/trend-wars-frontend).

## Play it now: <https://trendwars.herokuapp.com/>

## About the game's backend
I am using Apollo Server for serving GraphQL for the frontend Apollo Client. For the database, it is MongoDB Atlas (thanks for the free tier!). The only trickier part of the backend is the making of the "decks", see it a bit later.

## Some Documentation

### models
There are only 3 models, from which only 2 are used. DeckModel and UserModel actively used by the application, and I left in the GameRoomModel file for legacy purposes - earlier version used that to create multiplayer games.

### controllers
- dbcontroller.js for connecting to the database
- jwt.js for encoding/decoding JSON web tokens
- trendgetter.js is accepting keywords - and date, category, territory details - and gives back the result of the Google Trends comparisons. Each grabbing is delayed by 1 sec. More keywords exponentially increases the time to get the data back, since it compares everything with everything

### resolvers
- deckresolvers.js is for getting info about the decks, create and approve them
- headresolvers.js only for handling the flying heads subscription
- multiplayerresolver.js is for controlling the multiplayer game completely. Saves the active game into a local variable and serves it to the client. Deletes the game when it ends/the creator of the game exits.
- userresolvers.js since there is no user system in the frontend only to enter the admin, it only registers, logs in, and can check if the user permission is really admin.

There are more documentation, images, and other goodies in the [frontend repo](https://github.com/Dhadhazi/trend-wars-frontend) of the app.
