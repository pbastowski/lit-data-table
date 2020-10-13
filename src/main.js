import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.scss'

import { render } from 'haunted'

import App from './App.js'

render(App(), document.querySelector('#app'))
