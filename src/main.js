import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.scss'

import { render, component, virtual } from './libs.js'

import App from './App.js'

// customElements.define('my-app', component(App, { useShadowDOM: false }))
render(virtual(App)(), document.querySelector('my-app'))

window.runtest = () => {
    let c = 1
    const f = () => {
        document.querySelector('#testit').click()
        c++ < 1000 && setTimeout(f, 60)
    }
    f()
}
