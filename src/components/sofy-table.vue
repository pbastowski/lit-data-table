<template>
    <div class="sofy-table">
        <sofy-data-table
            :data="localPaging ? data : undefined"
            :columns="columns"
            :page.sync="page"
            @update:page="$emit('update:page', $event)"
            :paginator="paginator2"
            :must-sort="mustSort"
            :page-size="pageSize"
            @update:pageSize="$emit('update:pageSize', $event)"
            :get-data="localPaging ? undefined : getData"
            :record-count="recordCount"
            :show-counts="showCounts"
            :searchable="searchable"
            :page-size-selector="pageSizeSelector"
        >

            <slot v-bind="this"></slot>
            <template slot="expand" slot-scope="scope">
                <slot name="expand" v-bind="scope"></slot>
            </template>
        </sofy-data-table>
    </div>
</template>

<script>
/**
 *
 * @module sofy-table
 *
 * sofy-table takes the following props
 *
 * @param data {Array} Array with the data to be displayed
 * @param columns {Array} An array of columns that will be displayed from the available data
 * @param page[.sync] {Number} The current page number in the paginator
 *
 * @description
 *
 * Display a data in a table, sourcing the records from the provided url
 *
 */

import SofyDataTable from './sofy-data-table'
import http from 'axios'

export default {
    name: 'sofy-table',

    props: {
        url: String,
        columns: { type: Array, default: () => [] },
        pageSize: { type: Number, default: 10 },
        mustSort: { type: [Boolean, String], default: false },
        paginator: { type: Object, default: () => {} },
        searchable: Boolean,
        showCounts: Boolean,
        pageSizeSelector: Boolean,
        localPaging: Boolean,
    },

    components: {
        SofyDataTable,
    },

    data() {
        return {
            page: 1,
            rowCount: { type: Number, default: null },
            paginator2: {
                maxSize: 7,
                align: 'center',
                size: 'md',
                boundaryLinks: true,
                ...this.paginator,
            },
            recordCount: 0,
            data: [],
        }
    },

    created() {
        // If local paging is requested then we fetch all the data and pass it to soft-data-table
        if (this.localPaging) this.getData({}).then(data => (this.data = data))
    },

    methods: {
        /**
         * @method getData
         *
         * @param sortBy {String}       the field name to sort on
         * @param sortDesc {Boolean}    true: sort is descending, false: ascending
         * @param page {Number}         the data page to display, starting at 1
         * @param pageSize {Number}     the display page size
         *
         * @description
         * This function gets called when the data-table needs more data
         */
        getData({ sortBy, sortDesc, page, pageSize, query }) {
            // pageNo=2&noOfRecords=10&orderBy[field]=ID&orderBy[dir]=desc&searchString=Training
            // let params = {
            //     'orderBy[field]': sortDesc != null ? sortBy : undefined,
            //     'orderBy[dir]': sortDesc != null ? sortDesc ? 'desc' : 'asc' : undefined,
            //     pageNo: page,
            //     noOfRecords: pageSize,
            //     searchString: query,
            // }
            let params = {
                _sort: sortDesc != null ? sortBy : undefined,
                _order:
                    sortDesc != null ? (sortDesc ? 'desc' : 'asc') : undefined,
                _page: page,
                _limit: pageSize,
                q: query,
            }

            return http.get(this.url, { params }).then(result => {
                this.recordCount = parseInt(result.headers['x-total-count'], 10)
                return result.data
            })
        },
    },
}
</script>

<style scoped>
.has-search .form-control-feedback {
    right: initial;
    left: 0;
    color: #ccc;
}

.has-search .form-control {
    padding-right: 12px;
    padding-left: 34px;
}
</style>
