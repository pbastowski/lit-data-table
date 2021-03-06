import { html, observe, log, json } from './libs.js'
import dataTable from './components/data-table.js'
import http from 'axios'
// import Test from './components/test-c.js'

// console.log(Test())

const ServerTable = new dataTable()
const DataTable = new dataTable()
// const DataTable = () => {}

const state = observe(
    {
        pageSize: 5,
        paginator: {
            maxSize: 5,
            align: 'center',
            size: 'md',
            boundaryLinks: true
        },
        page: 1,
        recordCount: 10,
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
    },
    { batch: true }
)

export default () => html`
    <h1>Data Table</h1>

    <!--<h3 b1>
        The table below fetches data directly from
        <small><code>jsonplaceholder.typicode.com/posts</code></small>
    </h3>-->

    <br />

    <!-- -->
    ${true &&
    ServerTable({
        data: state.data,
        getData({ sortBy, sortDesc, page, pageSize, query }) {
            console.log('GETDATA')
            let params = {
                _sort: sortDesc != null ? sortBy : undefined,
                _order: sortDesc != null ? (sortDesc ? 'desc' : 'asc') : undefined,
                _page: page,
                _limit: pageSize,
                q: query
            }

            return http
                .get('https://jsonplaceholder.typicode.com/posts', { params })
                .then(result => {
                    state.recordCount = parseInt(result.headers['x-total-count'], 10)
                    return result.data
                })
            // .catch(er => {
            //     alert('Error !!!!!\n\n' + JSON.stringify(er))
            //     return [{ title: 'Error!!!' }]
            // })
        },
        recordCount: state.recordCount,
        // localPagination: true,
        columns: [
            { field: 'id', label: 'id', sortable: true, width: '60px' },
            { field: 'title', label: 'Title', sortable: true }
        ],
        page: state.page,
        paginator: state.paginator,
        sortBy: 'title',
        // sortDesc: false,
        mustSort: true,
        pageSizeSelector: true,
        searchable: true,
        expandable: true,

        slotExpand
        // changePage: page => (state.page = page),
        // changePageSize: pageSize => (state.pageSize = pageSize)
    })}

    <!-- -->
    ${true &&
    DataTable({
        columns: state.columns,
        data: JSON.parse(JSON.stringify(state.data)),
        // getData: ({ page, pageSize }) => {
        //     // console.log('GET DATA:')
        //     return Promise.resolve(state.data)
        //     return Promise.resolve(state.data.slice((page - 1) * pageSize, page * pageSize))
        // },
        // recordCount: 11,

        page: 1, //state.page,
        // pageSize: state.pageSize,
        sortBy: 'b',
        sortDesc: false,
        mustSort: true,

        paginator: true,
        localPagination: true,
        pageSizeSelector: true,
        searchable: true,
        expandable: true,

        slotExpand
        // changePage: page => (state.page = page),
        // changePageSize: pageSize => (state.pageSize = pageSize)
    })}
`

function slotExpand(row) {
    return html`
        <tr style="background: lightyellow;">
            <td colspan="100%">
                Expanded
                <pre>${json(row)}</pre>
            </td>
        </tr>
    `
}
