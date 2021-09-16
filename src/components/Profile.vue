<template>
    <div>
         <h3>User: <span id="user">{{username}}</span> is currently in session</h3>
        <button @click="onEndSession">end session</button>
    </div>
</template>

<script>
import config from '../config';

export default {
    name:"Profile",
    props: {
        "username" : String,
    },
    methods: {
        onEndSession(event){
            event.preventDefault();
            fetch(config.apiUrl + "/session/end", {
                  method: "POST",
                  credentials: 'include'  
            }).then(()=>{
                this.$router.go()
          })
        }
    }
}
</script>

<style scoped>
    #user{
        color:red;
    }
</style>