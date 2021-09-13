/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}
const promisifyRedis = require('promisify-redis')
const redis =  promisifyRedis(require('redis'));
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
})

redisClient.on("error", function(error) {
  console.error('unable to create a redis client for session store');
});

class RedisSessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = redisClient;
  }

  async findSession(id) {
    const session = await this.sessions.get(id)
    const deserializeSession = JSON.parse(session)
    return deserializeSession;
  }

  async saveSession(id, session) {
    const serializeSession = JSON.stringify(session)
    await this.sessions.set(id, serializeSession, 'EX', 300);
  }

  async findAllSessions() {
    const sessionKeys = await this.sessions.keys('*')
    const sessionsMap = await Promise.all(sessionKeys.map(sessionKey=>{
      return this.findSession(sessionKey)
    }))
    return sessionsMap || []
  }
}

module.exports = {
  InMemorySessionStore,
  RedisSessionStore
};
