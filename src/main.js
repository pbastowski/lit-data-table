import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.scss'

import { render } from './libs.js'

import App from './App.js'

document.querySelector('#click').addEventListener('click', () => {
    window.showTable = window.showTable ? null : true
    reRender()
})

function reRender() {
    render(App(), document.querySelector('#app'))
}

reRender()
