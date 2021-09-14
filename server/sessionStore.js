/* abstract */ class SessionStore {
  findSession(id) {}
  saveSession(id, session) {}
  findAllSessions() {}
}

module.exports = class RedisSessionStore extends SessionStore {
  constructor(redisClient) {
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
