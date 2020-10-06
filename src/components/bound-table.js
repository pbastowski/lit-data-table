import { html, json } from '/src/libs.js'

export default () => html`
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
`
