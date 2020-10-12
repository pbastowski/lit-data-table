import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.scss'

import { render, html, useState, virtual } from 'haunted'

import App from './App.js'

// mount(App.bind(null, { a: 1, b: 2 }), '#app')

// const App = virtual(() => {
//     const [abc, setAbc] = useState(123)
//     return html`
//         <h1>Testing...</h1>
//         <pre>${abc}</pre>
//         <button @click=${() => setAbc(abc + 1)}>+1</button>
//     `
// })

render(App(), document.querySelector('#app'))
