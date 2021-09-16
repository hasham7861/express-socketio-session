# session example
### A session shared amongst vue, express, & socket.io

General idea of how did i share a session between express and socketio: https://github.com/socketio/socket.io/discussions/4092

**Technologies used:** Vue, Express, Socket.io, and Redis.

In this example: I set and retrieve username from socketIo but to end session I use expresss route to reference same session and destroying it.


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
