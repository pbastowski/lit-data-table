import DataTable from './components/data-table2.js'

const state = {
    pageSize: 5,
    page: 1
}

const data = [
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

const columns = [
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
]

window.showTable = true

export default props => window.showTable && DataTable({ columns, data })
