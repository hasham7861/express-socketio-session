# session example
### A session shared amongst vue, express, & socket.io

General idea of how did i share a session between express and socketio: https://github.com/socketio/socket.io/discussions/4092

**In this example:** I set and retrieve username from socketIo but to end session I use express route to reference same session and destroying it.

**Technologies used:** Vue, Express, Socket.io, and Redis.

### Technical: 

#### Setup & Connect to Redis
```configure redis to your matching configuration, and ensure that redis is running```

#### Run the frontend
```
npm install
npm run serve
```

#### Run the server

```
cd server
npm install
npm run serve
```
