import { html } from '/libs.js'

export default (sortDesc = false) =>
    sortDesc === true
        ? html`<i class="fa fa-sort-down" key="down"></i>`
        : sortDesc === false
        ? html`<i class="fa fa-sort-up" key="up"></i>`
        : null
