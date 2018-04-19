import Vue from 'vue'
import VueResource from 'vue-resource'

Vue.use(VueResource);

Vue.component('halt-item', {
    props: ['halt'],
    template: '<li>{{ halt.haltTime }} - {{ halt.symbol }}</li>',
})
var app = new Vue({
    el: '#app',
    data: {
        halts: [{
            id: 'WG1',
            symbol: 'WG',
            name: 'Willbros Group, Inc.',
            market: 'NYSE',
            reasonCode: 'T1',
            haltTime: new Date('2018-03-26T17:00:42.000Z')
        }]
    },
    created: function () {
        this.$http.get('https://4j74uujey2.execute-api.us-east-1.amazonaws.com/dev/halts/list')
            .then((response) => {
                this.halts = response.data;
            });
    },
    methods: {}
})