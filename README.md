# Private messaging with Socket.IO.

In this project, i use socket.io session persisting on redis. saving users, userId, and connect status only in session

Please read the related guide on socket.io:
- [Article explanation](https://socket.io/get-started/private-messaging-part-2/): persistent user ID


## Setup redis as it use to save sessions on
```make sure you have redis running locally on the correct port```

## Running the frontend

```
npm install
npm run serve
```

### Running the server

```
cd server
npm install
npm start
```
