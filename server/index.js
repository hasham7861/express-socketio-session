const Express = require("express");
const CookieParser = require('cookie-parser');
const { Server } = require("http");
const Session = require("express-session");
const Redis =  require('redis');
const Cors = require('cors');
const ConnectRedis = require("connect-redis");
const SocketIo = require("socket.io");
const Config = require('./config');

(function init(){

  // Initialize the required clients
  const app = createAndGetExpress();
  const httpServer = Server(app);
  const sio = createAndGetSocketIo(httpServer);
  const {redisClient, redisStore} = createAndGetRedisClientAndStore();

  // Setup session
  const sessionMiddleware = createAndGetSessionMiddleware(redisStore,redisClient);
  setSameSessionOnExpressAndSocketIo(sessionMiddleware, app, sio);

  // Initialize all the addon routes and events
  initExpressRoutes(app);
  initSocketIoEvents(sio);

  // Finally start listening for client requests
  startListening(httpServer);

})()

function isDevelopmentEnv(){
  return Config.env === 'development';
}

function createAndGetExpress(){
  const app = Express();

  app.use(Cors(Config.corsOptions));
  app.use(CookieParser(Config.session.cookie.secret));

  return app;
}

function createAndGetSocketIo(httpServer){
  const sio = SocketIo(httpServer,{
    cors: Config.corsOptions,
  })

  return sio;
}

function createAndGetRedisClientAndStore(){
  const redisClient = Redis.createClient({
    host: 'localhost',
    port: 6379
  });
  
  const redisStore = ConnectRedis(Session);
  
  return {
    redisClient,
    redisStore
  }
}

function createAndGetSessionMiddleware(redisStore, redisClient){
  const sessionMiddleware = Session({
    store: new redisStore({client:redisClient}),
    secret: Config.session.cookie.secret,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: Config.session.cookie.maxAge}
  });
  return sessionMiddleware;
}

function setSameSessionOnExpressAndSocketIo(sessionMiddleware, app, sio){
  sio.use((socket, next)=> sessionMiddleware(socket.request, {}, next))
  app.use(sessionMiddleware)  
}

function initExpressRoutes(app){
  app.get("/", function(req, res){
    if(isDevelopmentEnv())
      console.log('api session id: ', req.session.id)
    res.send({session: 'session has been set'}) // Session object in a normal request
  });
  
  app.post("/session/end", (req,res)=>{
    req.session.destroy();
    res.end();
  })
  
}

function initSocketIoEvents(sio){
  sio.on("connection", async function(socket) {

    const session = socket.request.session;
    const requestSocketId = socket.id;
    
    if(isDevelopmentEnv())
      console.log('ws sessionId: ', session.id);
  
    socket.on("session:getUsername", ({})=>{
      const {username} = session;
      sio.to(requestSocketId).emit("getUsername", {username}) 
    })
  
    socket.on("session:setUsername", ({username}, callback)=>{
      session.username = username || "";
      session.save();
      callback({
        isUsernameSet: true
      });
    })
  
  })
}

function startListening(httpServer){
  httpServer.listen(Config.port, ()=>{
    console.log(`Listening on ${Config.address}:${Config.port}`)
  })
}