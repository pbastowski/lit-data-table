import { createStore } from '../libs'

let store = {
    abc: 123,
    messages: 3
}

export default createStore(store)

export const doStuff = () => {
    store.$set({ abc: 'Hello human!' })
}
