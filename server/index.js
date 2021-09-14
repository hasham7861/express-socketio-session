// const httpServer = require("http").createServer();
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://localhost:8080",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

// const { RedisSessionStore} = require("./sessionStore");
// const sessionStore = new RedisSessionStore();


// io.use(async (socket, next) => {
  
//   const sessionID = socket.handshake.auth.sessionID;
 
//   if (sessionID) {
//     const session = await sessionStore.findSession(sessionID);

//     if (session) {
//       socket.sessionID = sessionID;
//       socket.userID = session.userID;
//       socket.username = session.username;
//       return next();
//     }
//   }
//   const username = socket.handshake.auth.username;

//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.sessionID = randomId();
//   socket.userID = randomId();
//   socket.username = username;
//   next();
// });

// io.on("connection", async (socket) => {

//   // persist session
//   await sessionStore.saveSession(socket.sessionID, {
//     userID: socket.userID,
//     username: socket.username,
//     connected: true,
//   });

//   // emit session details
//   socket.emit("session", {
//     sessionID: socket.sessionID,
//     userID: socket.userID,
//   });

//   // join the "userID" room
//   socket.join(socket.userID);

//   // fetch existing users
//   const users = [];
//   sessionStore.findAllSessions().then(keys=>{
//     keys.forEach((session) => {
//       users.push({
//         userID: session.userID,
//         username: session.username,
//         connected: session.connected,
//       });
//     });
//     socket.emit("users", users);
//   })
 

//   // notify existing users
//   socket.broadcast.emit("user connected", {
//     userID: socket.userID,
//     username: socket.username,
//     connected: true,
//   });

//   // forward the private message to the right recipient (and to other tabs of the sender)
//   socket.on("private message", ({ content, to }) => {
//     socket.to(to).to(socket.userID).emit("private message", {
//       content,
//       from: socket.userID,
//       to,
//     });
//   });

//   // notify users upon disconnection
//   socket.on("disconnect", async () => {
//     const matchingSockets = await io.in(socket.userID).allSockets();
//     const isDisconnected = matchingSockets.size === 0;
//     if (isDisconnected) {
//       // notify other users
//       socket.broadcast.emit("user disconnected", socket.userID);
//       // update the connection status of the session
//       sessionStore.saveSession(socket.sessionID, {
//         userID: socket.userID,
//         username: socket.username,
//         connected: false,
//       });
//     }
//   });
// });

// const PORT = process.env.PORT || 3000;

// httpServer.listen(PORT, () =>
//   console.log(`server listening at http://localhost:${PORT}`)
// );


var express = require("express");
var Server = require("http").Server;
var session = require("express-session");
const promisifyRedis = require('promisify-redis')
const redis =  promisifyRedis(require('redis'))
var RedisStore = require("connect-redis")(session);

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

var storeManager = new (require('./sessionStore'))(redisClient)

var app = express();
var server = Server(app);
var sio = require("socket.io")(server,{
  cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
   }
});

var sessionMiddleware = session({
    store: new RedisStore({client:redisClient}), // XXX redis server config
    secret: "keyboard cat",
    saveUninitialized: true,
    resave: true
});

sio.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use(sessionMiddleware);

app.get("/", function(req, res){
    res.send(req.session) // Session object in a normal request
});

sio.use(async (socket, next) => {
  
  const sessionID = socket.request.session.id;
 
  if (sessionID) {
    const session = await storeManager.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;

  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = sessionID;
  socket.userID = randomId();
  socket.username = username;
  next();
});


sio.on("connection", async function(socket) {
  console.log('session', socket.sessionID) // Now it's available from Socket.IO sockets too! Win!
 
  // // persist session
  await storeManager.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // // emit session details
  // socket.emit("session", {
  //   sessionID: socket.sessionID,
  //   userID: socket.userID,
  // });

  // // join the "userID" room
  socket.join(socket.userID);

  // // fetch existing users
  const users = [];
  storeManager.findAllSessions().then(keys=>{
    keys.forEach((session) => {
      users.push({
        userID: session.userID,
        username: session.username,
        connected: session.connected,
      });
    });
    socket.emit("users", users);
  })
 

  // // notify existing users
  // socket.broadcast.emit("user connected", {
  //   userID: socket.userID,
  //   username: socket.username,
  //   connected: true,
  // });

  // // forward the private message to the right recipient (and to other tabs of the sender)
  // socket.on("private message", ({ content, to }) => {
  //   socket.to(to).to(socket.userID).emit("private message", {
  //     content,
  //     from: socket.userID,
  //     to,
  //   });
  // });

  // notify users upon disconnection
  // socket.on("disconnect", async () => {
  //   const matchingSockets = await io.in(socket.userID).allSockets();
  //   const isDisconnected = matchingSockets.size === 0;
  //   if (isDisconnected) {
  //     // notify other users
  //     socket.broadcast.emit("user disconnected", socket.userID);
  //     // update the connection status of the session
  //     sessionStore.saveSession(socket.sessionID, {
  //       userID: socket.userID,
  //       username: socket.username,
  //       connected: false,
  //     });
  //   }
  // });
});

server.listen(3000, ()=>{
  console.log("server listening in on [::1]:3000")
});