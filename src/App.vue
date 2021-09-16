<template>
  <div id="app">
    <h2 id="app-title">A session shared amongst vue, express, & socket.io</h2>
    <select-username
      v-if="!usernameAlreadySelected"
      @input="onUsernameSelection"
    />
    <profile v-else 
      :username="username"
      />
  </div>
</template>

<script>
import SelectUsername from "./components/SelectUsername";
import socket from "./socket";
import Profile from './components/Profile.vue';
import config from './config';

export default {
  name: "App",
  components: {
    SelectUsername,
    Profile
  },
  data() {
    return {
      usernameAlreadySelected: false,
      username: ""
    };
  },
  methods: {
    onUsernameSelection(username) {
      // set the username in the server session, and then set username already selected to true
      socket.emit("session:setUsername",{username}, ({isUsernameSet})=>{
        if(isUsernameSet){
          this.username = username;
          this.usernameAlreadySelected = true;
        }
          
      })

    },
    async establishAHttpAndWsSession(){
      /**
       * This method establishes a sesion on http server 
       * and ws server and connects to socket.
       */
      return fetch(config.apiUrl, 
                {
                  method:'get', 
                  credentials: 'include'
                }).then(()=>{
                  socket.connect();
                })
    }

  },
  async created() {
    await this.establishAHttpAndWsSession()
    /* 
     check if username is already in session then have,
       then set usernameAlready selected to true,
       and pass the username in the prop
    **/
   socket.emit("session:getUsername",{})
   socket.on("getUsername", ({username})=>{
     if(!username){
       this.usernameAlreadySelected = false
     }else{
        this.username=username;
        this.usernameAlreadySelected = true
     }
   })


  },
  destroyed() {
    // unregister events and close connection
    socket.off("getUsername")
    socket.close()
  },
};
</script>

<style>
body {
  margin: 0;
}

@font-face {
  font-family: Lato;
  src: url("/fonts/Lato-Regular.ttf");
}

#app {
  font-family: Lato, Arial, sans-serif;
  font-size: 14px;
  width: 500px;
  margin: 200px auto 0;
}

#app-title{
  margin-bottom:50px;
}
</style>
