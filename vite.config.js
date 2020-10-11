module.exports = {
    optimizeDeps: {
        include: [
            'lodash/debounce',
            'lit-html/directives/unsafe-html',
            'lit-html/directives/class-map',
            'lit-html/directives/repeat',
            'lit-html/directives/style-map',
            'hyperactiv/src'
        ],
        exclude: ['jquery', 'popper.js', 'bootstrap']
    }
}
