import { virtual, json, html } from './libs'
import useStore from './store/main.js'

export default virtual(() => {
    const [state] = useStore()
    return html`<small>Messages: ${state.messages}</small>`
})
