import { virtual, json, html, reactive } from './libs'
import mainStore from './store/main.js'

export default virtual(() => {
    const [state, setState] = mainStore()
    return html`
        <h1>Test 3</h1>
        <pre>abc: ${json(state.abc)}</pre>
        <button @click=${() => setState({ abc: 1 })}>abc=1</button>
        <button @click=${() => setState({ messages: state.messages - 1 })}>messages--</button>
        <button @click=${() => setState({ messages: state.messages + 1 })}>messages++</button>
    `
})
