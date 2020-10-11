import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.scss'

import { render, computed } from './libs.js'
import App from './App.js'

console.clear()

computed(() => {
    console.time('± render')
    render(App(), document.querySelector('#app'))
    console.timeEnd('± render')
})
