const session = require("express-session");

/* abstract */ class SessionStore {
  findSession(id) { }
  saveSession(id, session) { }
  findAllSessions() { }
}

const util = require('util')

module.exports = class RedisSessionStore extends SessionStore {
  constructor(redisClient) {
    super();
    this.sessions = redisClient;
    this.getSession = util.promisify(this.sessions.get)
    this.setSession = util.promisify(this.sessions.set)
    this.getKeys = util.promisify(this.sessions.keys)
  }

  async findSession(id) {
    try {
      const session = await this.getSession(id)
      const deserializeSession = JSON.parse(session)
      return deserializeSession;
    } catch (err) {
      throw new Error(null)
    }
  }

  async saveSession(id, session) {
    const serializeSession = JSON.stringify(session)
    await this.setSession(id, serializeSession, 'EX', 300);
  }

  async findAllSessions() {
    const sessionKeys = await this.getKeys('*')
    const sessionsMap = await Promise.all(sessionKeys.map(sessionKey => {
      return this.findSession(sessionKey)
    }))
    return sessionsMap || []
  }
}
