<template>
    <div id="app">
      <ul v-if="halts && halts.length">
        <li v-for="item in halts" v-bind:key="item.id">
          {{ item.haltTime }} - {{ item.symbol }}
        </li>
      </ul>
      <ul v-if="errors && errors.length">
        <li v-for="error of errors">
          {{error.message}}
        </li>
      </ul>
    </div>
</template>

<script>
export default {
  name: "App",
  data: () => {
    return {
      halts: [],
      errors: [],
      credentials: null
    };
  },
  created: function() {
    this.fetchStocks();
    this.fetchCredentials();
  },
  methods: {
    fetchStocks: function() {
      this.$http
        .get(
          "https://wdqcwuy9r2.execute-api.us-east-1.amazonaws.com/dev/halts/list"
        )
        .then(response => {
          this.halts = response.data;
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
    fetchCredentials: function() {
      this.$http
        .get(
          "https://wdqcwuy9r2.execute-api.us-east-1.amazonaws.com/dev/iot/keys"
        )
        .then(response => {
          this.credentials = response;
        })
        .catch(e => {
          log.console.error(e);
        });
    }
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
