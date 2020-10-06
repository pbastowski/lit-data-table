<template>
  <div class="sofy-data-table">
    <slot></slot>
    <div style="display: flex; align-items: end; justify-content: flex-end;">
      <div v-if="pageSizeSelector" style="margin-bottom: 15px;">Show
        <uiv-dropdown append-to-body>
          <uiv-btn class="dropdown-toggle">
            {{ pageSize2 }}
            <span class="caret"></span>
          </uiv-btn>
          <template slot="dropdown">
            <li v-for="size in [5,10,25,50,100]" :key="size">
              <a role="button" @click="pageSize2=size; $emit('update:pageSize', size)">{{ size }}</a>
            </li>
          </template>
        </uiv-dropdown>entries
      </div>

      <span style="flex-grow: 1;"/>

      <div v-if="searchable" class="form-group has-feedback has-search pull-right">
        <span class="glyphicon glyphicon-search form-control-feedback"></span>
        <input
          :value="searchText"
          @input="debounceSearch"
          type="text"
          placeholder="Search..."
          class="form-control"
          id="text"
        >
      </div>

      <slot name="top-right"></slot>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th
              v-for="col in cols"
              :key="col.field"
              :class="headerClasses(col)"
              @click="col.sortable && sort(col)"
              :style="{width: col.width}"
              style="min-width: 50px;"
            >
              <slot name="header-cell">
                <span>
                  <i v-if="col.iconPrefix" :class="[col.iconPrefix]"></i>
                  {{ col.label }}
                  <i
                    v-if="col.iconSuffix"
                    :class="[col.iconSuffix]"
                  ></i>
                </span>
                <span
                  v-if="col.sortable && sortDesc != null && sortBy === col.field"
                  style="margin-left: 6px;"
                >
                  <i v-if="sortDesc===true" class="fa fa-sort-down" key="down"></i>
                  <i v-if="sortDesc===false" class="fa fa-sort-up" key="up"></i>
                </span>
              </slot>
            </th>
          </tr>
        </thead>

        <!-- Optional progress bar can be implemented at this slot in the parent -->
        <slot name="progress-bar"/>

        <tbody>
          <template v-for="(row, index) in displayData">
            <tr :key="index" @click="expand = expand===row ? null : row">
              <td v-for="col in cols" :key="col.field" :class="itemClasses(col)">
                <slot name="item">{{ row[col.field] }}</slot>
              </td>
            </tr>

            <template v-if="expandable && expand===row">
              <slot name="expand" v-bind="{row, index}">
                <tr :key="`collapse${index}`" style="background: lightyellow;">
                  <td colspan="100%">Expanded {{ row }}</td>
                </tr>
              </slot>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <div style="display: flex; align-items: center; justify-content: center; margin-top:15px;">
      <span
        style="flex-grow: 1;"
        v-if="showCounts"
      >Showing {{ (page2-1)*pageSize2+1 }} to {{ page2*pageSize2 }} of {{ totalRecordCount }} entries</span>
      
      <span v-if="paginator.align==='right'" style="flex-grow: 1;"/>

      <uiv-pagination
        v-if="showPaginator && totalRecordCount && pageSize2"
        :value="page2"
        @change="$emit('update:page', $event)"
        :total-page="Math.ceil(totalRecordCount/pageSize2)"
        :max-size="paginator.maxSize"
        Xalign="(paginator.align || 'right')"
        :size="(paginator.size || null)"
        :boundary-links="paginator.boundaryLinks"
      />

      <span v-if="paginator.align==='left'" style="flex-grow: 1;"/>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'


export default {
    name: 'sofy-table',
    components: {},
    props: {
        page: Number,
        data: { type: Array, default: () => [] },
        columns: Array,
        pageSize: Number,
        mustSort: [Boolean, String],
        paginator: Object,
        getData: Function,
        recordCount: { type: Number, default: null },
        searchable: Boolean,
        showCounts: Boolean,
        pageSizeSelector: Boolean,
    },
    data() {
        return {
            page2: this.page,
            pageSize2: this.pageSize,
            expand: null,
            cols: (this.columns || []).slice(),
            sortBy: null,
            sortDesc: null,
            displayData: null,
            expandable: false,
            searchText: '',
        }
    },

    created() {
        if (typeof this.mustSort === 'string') {
            this.sortBy = this.mustSort
            this.sortDesc = false
        } else this.sortBy = ''
    },

    mounted() {
        if (this.$scopedSlots.expand) this.expandable = true
    },

    watch: {
        pageSize(nv) {
            this.pageSize2 = nv
        },

        page(nv) {
            this.page2 = nv
        },

        async dataControls() {
            if (this.getData)
                this.displayData = await this.getData({
                    sortBy: this.sortBy,
                    sortDesc: this.sortDesc,
                    page: this.page2,
                    pageSize: this.pageSize2,
                    query: this.searchText,
                })
            else this.displayData = this.filteredData

            // Limit the page number to the available number of pages
            this.page2 =
                this.totalPages < this.page2 ? this.totalPages : this.page2
        },
    },

    computed: {
        totalPages() {
            return Math.ceil(this.totalRecordCount / this.pageSize2)
        },

        filteredRecordCount() {
            return this.displayData.length
        },

        totalRecordCount() {
            return this.getData ? this.recordCount : this.data.length
        },

        showPaginator() {
            return this.paginator && typeof this.paginator === 'object'
        },

        dataControls() {
            // The line below creates a dependency on the mentioned variables and
            // we watch dataControls for any changes, which signal a page reload.
            return (
                this.sortBy +
                this.sortDesc +
                this.page2 +
                this.pageSize2 +
                this.searchText
            )
        },
        headerClasses() {
            return col => [
                {
                    'text-center': col.align === 'center',
                    'pad-sort-right':
                        col.align === 'center' || col.align === 'left',
                    'pad-sort-left': col.align === 'right',
                    'text-right': col.align === 'right',
                },
                col.headerClass,
            ]
        },
        itemClasses() {
            return col => [
                {
                    'text-center': col.align === 'center',
                    'text-right': col.align === 'right',
                },
                col.itemClass,
            ]
        },

        filteredData() {
            let start = (this.page2 - 1) * this.pageSize2

            let result = this.data.slice()

            // filter by search text
            if (this.searchText) {
                let search = this.searchText.toLowerCase()
                result = result.filter(row =>
                    Object.values(row).some(col =>
                        (col + '').toLowerCase().includes(search),
                    ),
                )
            }

            let key = this.sortBy
            if (key && this.sortDesc != null) {
                let sgn = this.sortDesc ? -1 : 1
                result.sort((a, b) => {
                    return a[key] === b[key] ? 0 : a[key] > b[key] ? sgn : -sgn
                })
            }

            if (this.showPaginator)
                result = result.slice(start, start + this.pageSize2)

            return result
        },
    },

    methods: {
        debounceSearch: debounce(function(ev) {
            this.searchText = ev.target.value
        }, 400),

        sort(col) {
            if (this.mustSort)
                this.sortDesc =
                    this.sortBy === col.field ? !this.sortDesc : false
            else if (this.sortBy !== col.field) this.sortDesc = false
            else if (this.sortDesc == null) this.sortDesc = false
            else if (this.sortDesc) this.sortDesc = null
            else this.sortDesc = true

            this.sortBy = col.field
        },
    },
}
</script>

<style lang="scss" scoped>
.sofy-data-table /deep/ ul.pagination {
    margin-top: 0px;
    margin-bottom: 0px;
}
.pad-sort-right {
    padding-right: 20px;
}
.pad-sort-left {
    padding-left: 20px;
}
</style>
