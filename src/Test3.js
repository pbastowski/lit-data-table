import { json, html } from './libs'
import state from './store/main.js'

export default () => {
    return html`
        <h1>Test 3</h1>
        <pre>abc: ${json(state.abc)}</pre>
        <button @click="${() => (state.abc = 1)})}">abc=1</button>
        <button @click="${() => state.messages--})}">messages--</button>
        <button @click="${() => state.messages++})}">messages++</button>
    `
}
