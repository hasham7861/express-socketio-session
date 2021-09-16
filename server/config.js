module.exports = {
    env: "development",
    address: "localhost",
    port: 3000,
    corsOptions: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"],
        credentials: true
    },
    session:{
        cookie: { 
            secret: "spooky hidden message here",
            maxAge: 300000 // auto clear session after 5 mins"
        }
    }
}