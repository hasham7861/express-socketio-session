// const httpServer = require("http").createServer();
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://localhost:8080",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// const crypto = require("crypto");
// const randomId = () => crypto.randomBytes(8).toString("hex");
// const cookieParser = require('cookie-parser')
// const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

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

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const cookieParser = require('cookie-parser')
var express = require("express");
var Server = require("http").Server;
var session = require("express-session");
const redis =  require('redis')
var RedisStore = require("connect-redis")(session);
const cookie = require("cookie");
const cors = require('cors')
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

// var storeManager = new (require('./sessionStore'))(redisClient)

var app = express();

const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true
}
app.use(cors(corsOptions))


var server = Server(app);
var sio = require("socket.io")(server,{
  cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
   }
});

app.use(cookieParser("keyboard cat"))


var sessionMiddleware = session({
    store: new RedisStore({client:redisClient}), // XXX redis server config
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 120000 }
});

sio.use((socket, next)=> sessionMiddleware(socket.request, {}, next))
app.use(sessionMiddleware)

app.get("/", function(req, res){
  console.log('api session id: ', req.session.id)
    res.send({session: 'session has been set'}) // Session object in a normal request
});



sio.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
  // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
  // connections, as 'socket.request.res' will be undefined in that case
});


// sio.use(async (socket, next) => {
  
  // const sessionID = socket.request.session.id;
  // console.log('ws sessionId: ', sessionID)
 
// //   if (sessionID) {
// //     const session = await storeManager.findSession(sessionID);
// //     if (session) {
// //       socket.sessionID = sessionID;
// //       socket.userID = session.userID;
// //       socket.username = session.username;
// //       return next();
// //     }
// //   }
// //   const username = socket.handshake.auth.username;

// //   if (!username) {
// //     return next(new Error("invalid username"));
// //   }
// //   socket.sessionID = sessionID;
// //   socket.userID = randomId();
// //   socket.username = username;
// //   next();
// // });

sio.on("connection", async function(socket) {

   const sessionID = socket.request.session.id;
  console.log('ws sessionId: ', sessionID)
//   // const cookies = cookie.parse(socket.handshake.headers.cookie);
//   console.log(socket.request.session.id)
//   // console.log('session',socket.request.session.id) // Now it's available from Socket.IO sockets too! Win!
//   // socket.request.session.save()
 
// //   // // persist session
// //   await storeManager.saveSession(socket.sessionID, {
// //     userID: socket.userID,
// //     username: socket.username,
// //     connected: true,
// //   });

// //   // // emit session details
// //   // socket.emit("session", {
// //   //   sessionID: socket.sessionID,
// //   //   userID: socket.userID,
// //   // });

// //   // // join the "userID" room
// //   socket.join(socket.userID);

// //   // // fetch existing users
// //   const users = [];
// //   storeManager.findAllSessions().then(keys=>{
// //     keys.forEach((session) => {
// //       users.push({
// //         userID: session.userID,
// //         username: session.username,
// //         connected: session.connected,
// //       });
// //     });
// //     socket.emit("users", users);
// //   })
 

//   // // notify existing users
//   // socket.broadcast.emit("user connected", {
//   //   userID: socket.userID,
//   //   username: socket.username,
//   //   connected: true,
//   // });

//   // // forward the private message to the right recipient (and to other tabs of the sender)
//   // socket.on("private message", ({ content, to }) => {
//   //   socket.to(to).to(socket.userID).emit("private message", {
//   //     content,
//   //     from: socket.userID,
//   //     to,
//   //   });
//   // });

//   // notify users upon disconnection
//   // socket.on("disconnect", async () => {
//   //   const matchingSockets = await io.in(socket.userID).allSockets();
//   //   const isDisconnected = matchingSockets.size === 0;
//   //   if (isDisconnected) {
//   //     // notify other users
//   //     socket.broadcast.emit("user disconnected", socket.userID);
//   //     // update the connection status of the session
//   //     sessionStore.saveSession(socket.sessionID, {
//   //       userID: socket.userID,
//   //       username: socket.username,
//   //       connected: false,
//   //     });
//   //   }
  });
// });  

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))



server.listen(3000, ()=>{
  console.log("server listening in on [::1]:3000")
});