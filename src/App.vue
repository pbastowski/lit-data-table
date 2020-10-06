<template>
    <div class="container">
        <h1>SOFY Data Table</h1>

        <h3>
            The table below fetches data directly from
            <small><code>jsonplaceholder.typicode.com/posts</code></small>
        </h3>

        <sofy-table
            url="https://jsonplaceholder.typicode.com/posts"
            :columns="[
                { field: 'id', label: 'id', sortable: true, width: '50px' },
                { field: 'title', label: 'Title', sortable: true }
            ]"
            :paginator="{ maxSize: 5, align: 'center', boundaryLinks: false }"
            Xpage-size.sync="pageSize"
            Xmust-sort="title"
            Xupdate:page="log"
            searchable
            show-counts
            page-size-selector
            Xlocal-paging
        >
            <tr slot="expand" slot-scope="{ row }" style="background: lightyellow">
                <td colspan="100%">{{ row.body }}</td>
            </tr>
        </sofy-table>

        <hr />
        <h3>This table displays client side data from an array</h3>

        <sofy-data-table
            :data="data"
            :columns="columns"
            :page.sync="page"
            :paginator="paginator"
            must-sort="b"
            :page-size="5"
            page-size-selector
            searchable
        >
            <tr
                slot="expand"
                slot-scope="{ row, index }"
                :key="`expand${index}`"
                style="background: lightgrey"
            >
                <td colspan="100%">
                    <pre>index: {{ index }}</pre>
                    <pre>row: {{ row }}</pre>
                </td>
            </tr>
        </sofy-data-table>
    </div>
</template>

<script>
/**
 *
 * sofy-table takes the following arguments
 *
 * @param data {Array} Array with the data to be displayed
 * @param columns {Array} An array of columns that will be displayed from the available data
 * @param page[.sync] {Number} The current page number in the paginator
 * @param expandable {Boolean} Does the table allow expanding
 *
 */

import SofyDataTable from './components/sofy-data-table'
import SofyTable from './components/sofy-table'

export default {
    name: 'App',
    components: {
        SofyTable,
        SofyDataTable
    },
    methods: {
        /**
         *  This function gets called when the data-table needs more data
         *  @param args {Object} contains the following props: sortBy, sortDesc, page, pageSize
         */
        // async getData({ sortBy, sortDesc, page, pageSize }) {
        //     // pageNo=2&noOfRecords=10&orderBy[field]=ID&orderBy[dir]=desc&searchString=Training
        //     let data = await this.getDataFromAPI({
        //         'orderBy[field]': sortBy,
        //         'orderBy[dir]': sortDesc ? 'desc' : 'asc',
        //         pageNo: page,
        //         noOfRecords: pageSize,
        //     })
        //     this.recordCount = data.data.recordsFiltered
        //     return data.data.data
        // },
        // async getDataFromAPI({
        //     'orderBy[field]': sortBy,
        //     'orderBy[dir]': sortDesc,
        //     pageNo: page,
        //     noOfRecords: pageSize,
        // }) {
        //     return new Promise((resolve, reject) => {
        //         sortDesc = sortDesc === 'desc'
        //         let start = (page - 1) * pageSize
        //         let result = this.data.slice()
        //         let key = sortBy
        //         if (key && sortDesc != null) {
        //             let sgn = sortDesc ? -1 : 1
        //             result.sort((a, b) => {
        //                 return a[key] === b[key]
        //                     ? 0
        //                     : a[key] > b[key] ? sgn : -sgn
        //             })
        //         }
        //         let recordsFiltered = result.length
        //         if (this.paginator)
        //             result = result.slice(start, start + pageSize)
        //         // Simulate API lag of 500ms
        //         resolve({
        //             data: { data: result, recordsFiltered },
        //         })
        //     })
        // },
    },
    data() {
        return {
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
                    sortable: true,
                    headerClass: 'bg-primary',
                    itemClass: 'bg-warning'
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
    }
}
</script>

<style>
.b1 {
    border: 1px dashed red;
}
</style>
