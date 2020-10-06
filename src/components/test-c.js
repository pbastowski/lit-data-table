import { html, observe, log, json } from '/src/libs.js'

function component(props = {}) {
    let { a = 1, b = 2 } = props
    // let a=1, b=2

    const state = observe({
        abc: 42,
        fgh: 23
    })

    const render = props => {
        window.s = state

        console.log(state)
        return html`
            <pre>${json(state)}</pre>
            <button @click=${() => state.abc++}>inc abc</button>
        `
    }

    component = render

    return render(props)
}

window.c = component

export default component

console.log('!test-c.js')

// if (typeof this.mustSort === 'string') {
//     this.sortBy = this.mustSort
//     this.sortDesc = false
// } else this.sortBy = ''
