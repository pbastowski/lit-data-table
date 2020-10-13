import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.scss'

import { render, computed } from './libs.js'

import App from './App.js'

computed(() => {
    render(App(), document.querySelector('#app'))
})

window.runtest = () => {
    let c = 1
    const f = () => {
        document.querySelector('#testit').click()
        c++ < 100 && setTimeout(f, 60)
    }
    f()
}
