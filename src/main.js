import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './main.css'

import { mount } from './mount.js'

import App from './App.js'

// console.clear()

mount(App.bind(null, { a: 1, b: 2 }), '#app')
