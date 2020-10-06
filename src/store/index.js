import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        abc: 123,
        nested: {
            lala: 'lala',
        },
    },
})

window.store = store

export default store
