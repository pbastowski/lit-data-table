import { html, virtual, useState, json } from './libs.js'
import DataTable from './components/data-table2.js'
import http from 'axios'

const state = {
    pageSize: 5,
    page: 1
}

export default virtual(props => {
    const [showTable, setShowTable] = useState(true)

    const [columns, setColumns] = useState([
        {
            field: 'a',
            label: 'AAA',
            align: 'left',
            iconPrefix: 'fa fa-circle text-warning',
            iconSuffix: 'fa fa-square text-success',
            sortable: false
        },
        {
            field: 'b',
            label: 'The big B',
            align: 'center',
            sortable: true
            // headerClass: 'bg-primary'
            // itemClass: 'bg-warning'
        },
        {
            field: 'c',
            label: 'C it is',
            align: 'right',
            sortable: true
        }
    ])

    const [data, setData] = useState([
        { a: 1, b: 'lalala', c: 9 },
        { a: 2, b: 'lazcv lala', c: 42 },
        { a: 3, b: 'lalasfxala', c: 1 },
        { a: 4, b: 'lalz cxala', c: 42 },
        { a: 5, b: 'lalala', c: 8 },
        { a: 6, b: 'lalfhgj fala', c: 23 },
        { a: 7, b: 'lalasxsla', c: 42 },
        { a: 8, b: 'lala53 3la', c: 5 },
        { a: 9, b: 'lalagb la', c: 42 },
        { a: 10, b: 'lasdgdf lala', c: 742 },
        { a: 11, b: 'lala7978 la', c: 6 }
    ])

    return html`
        <button id="testit" @click="${() => (showTable ? setShowTable(null) : setShowTable(true))}">
            ${showTable ? 'Hide' : 'Show'}
        </button>

        ${showTable && DataTable({ columns, data })}
    `
})
