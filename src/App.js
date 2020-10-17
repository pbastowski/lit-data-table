// import { html, observe, log, json } from './libs.js'
import { html, observe, json } from './libs.js'
import dataTable from './components/data-table.js'
import http from 'axios'

const config = {
    columns: [
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
    ],
    data: [
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
    ]
}

const ServerTable = new dataTable({
    getData({ sortBy, sortDesc, page, pageSize, searchText }) {
        // console.log('GETDATA:', sortBy, sortDesc, page, pageSize, searchText)
        let params = {
            _sort: sortDesc != null ? sortBy : undefined,
            _order: sortDesc != null ? (sortDesc ? 'desc' : 'asc') : undefined,
            _page: page,
            _limit: pageSize,
            q: searchText
        }

        return http.get('https://jsonplaceholder.typicode.com/posts', { params }).then(result => {
            return {
                data: result.data,
                recordCount: parseInt(result.headers['x-total-count'], 10)
            }
        })
        // .catch(er => {
        //     alert('Error !!!!!\n\n' + JSON.stringify(er))
        //     return [{ title: 'Error!!!' }]
        // })
    },
    // localPagination: true,
    columns: [
        { field: 'id', label: 'id', sortable: true, width: '60px' },
        { field: 'title', label: 'Title', sortable: true, align: 'center' }
    ],

    sortBy: 'title',
    mustSort: true,
    expandable: true,

    slotExpand,
    slotItem
})

const LocalTable = new dataTable({
    columns: config.columns,
    data: JSON.parse(JSON.stringify(config.data)),
    // getData: ({ page, pageSize }) => {
    //     // console.log('GET DATA:')
    //     return Promise.resolve(config.data)
    //     return Promise.resolve(config.data.slice((page - 1) * pageSize, page * pageSize))
    // },
    // recordCount: 11,

    page: 1,
    pageSize: 5,
    sortBy: 'b',
    sortDesc: false,
    mustSort: true,

    paginator: true,
    localPagination: true,
    pageSizeSelector: true,
    searchable: true,
    expandable: true,

    slotExpand
})

const state = observe({ showTable: true })

export default props => {
    return html`
        <h1>Data Table</h1>

        <h5>
            The table below fetches data directly from
            <small><code>jsonplaceholder.typicode.com/posts</code></small>
        </h5>

        <br />

        <!-- -->
        ${true && ServerTable()}

        <!-- -->
        <button id="testit" @click=${() => (state.showTable = state.showTable ? null : true)}>
            Click
        </button>
        ${state.showTable && LocalTable()}
    `
}

function slotExpand(row) {
    return html`
        <tr style="background: lightyellow;">
            <td colspan="100%">
                Expanded
                <p>${json(row)}</p>
            </td>
        </tr>
    `
}

function slotItem(item, col, row) {
    return col.field === 'id' ? html`<marquee>${item}</marquee>` : item
}
