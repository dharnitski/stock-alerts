<template>
  <!-- <div id="app">
    <img src="./assets/logo.png">
    <HelloWorld/>
  </div> -->
   <ol>
      <halt-item v-for="item in halts" v-bind:halt="item" v-bind:key="item.id">
      </halt-item>
    </ol>
</template>

<script>
//import HelloWorld from "./components/HelloWorld";

export default {
  name: "App",
  components: {
    //HelloWorld
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
