import { io } from "socket.io-client";
import config from "./config";

const socket = io(config.apiUrl, 
  { autoConnect: false, 
    withCredentials: true
  });

// logs every event emitted from server
socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
