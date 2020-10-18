import { html } from './libs'
import state from './store/main.js'

export default () => {
    return html`<small>Messages: ${state.messages}</small>`
}
