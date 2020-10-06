import debounce from 'lodash/debounce'
import { html, observe, classMap, log } from '/src/libs.js'
import bind from '/src/bind.js'

const styles = html`<style>
    .data-table ul.pagination {
        margin-top: 0px;
        margin-bottom: 0px;
    }
    .pad-sort-right {
        padding-right: 20px;
    }
    .pad-sort-left {
        padding-left: 20px;
    }
</style>`

// const template =
export default function () {
    const state = observe(
        {
            sortBy: null,
            sortDesc: null,
            searchText: '',
            page: 1,
            pageSize: 5,

            // Local methods
            debounceSearch() {
                return debounce(function (ev) {
                    this.searchText = ev.target.value
                }, 400)
            },

            sort(col, props) {
                if (props.mustSort)
                    this.sortDesc = this.sortBy === col.field ? !this.sortDesc : false
                else if (this.sortBy !== col.field) this.sortDesc = false
                else if (this.sortDesc == null) this.sortDesc = false
                else if (this.sortDesc) this.sortDesc = null
                else this.sortDesc = true

                this.sortBy = col.field
            },

            headerClasses(col) {
                return (
                    classMap({
                        'text-center': col.align === 'center',
                        'pad-sort-right': col.align === 'center' || col.align === 'left',
                        'pad-sort-left': col.align === 'right',
                        'text-right': col.align === 'right'
                    }) +
                    ' ' +
                    col.headerClass
                )
            },

            totalPages() {
                return Math.ceil(this.totalRecordCount / this.pageSize)
            },

            filteredRecordCount(props) {
                return this.filteredData(props).length
            },

            dataControls() {
                // The line below creates a dependency on the mentioned variables and
                // we watch dataControls for any changes, which signal a page reload.
                return this.sortBy + this.sortDesc + this.page + this.pageSize + this.searchText
            },

            itemClasses() {
                return col => [
                    {
                        'text-center': col.align === 'center',
                        'text-right': col.align === 'right'
                    },
                    col.itemClass
                ]
            },

            showPaginator(props) {
                return props.paginator && typeof props.paginator === 'object'
            },

            totalRecordCount(props) {
                return props.getData ? props.recordCount : props.data.length
            },

            filteredData(props) {
                let start = (this.page - 1) * this.pageSize

                let result = this.data.slice()

                // filter by search text
                if (this.searchText) {
                    let search = this.searchText.toLowerCase()
                    result = result.filter(row =>
                        Object.values(row).some(col => (col + '').toLowerCase().includes(search))
                    )
                }

                let key = this.sortBy

                if (key && this.sortDesc != null) {
                    let sgn = this.sortDesc ? -1 : 1
                    result.sort((a, b) => {
                        return a[key] === b[key] ? 0 : a[key] > b[key] ? sgn : -sgn
                    })
                }

                if (this.showPaginator(props)) result = result.slice(start, start + props.pageSize)

                return result
            }
        },

        { deep: true, bind: true }
    )

    const Paginator = props => {
        if (!props.changePage) return null

        const buttonCount = Math.floor(state.totalRecordCount(props) / props.pageSize) + 1
        const buttons = Array(buttonCount)
            .fill(1)
            .map(
                (v, i) =>
                    html`<button @click=${() => props.changePage(i + 1)}>
                        ${i}
                    </button>`
            )
        return buttons
    }

    return props => {
        let {
            page = 0,
            data = [],
            columns = [],
            pageSize = 10,
            mustSort = false,
            paginator = {},
            getData = undefined,
            recordCount = null,
            searchable = false,
            showCounts = true,
            pageSizeSelector = true,
            slot = null,
            slotItem = null,
            slotHeaderCell = null,
            slotProgressBar = null,
            slotTopRight = null,
            slotPaginator = null,
            changePageSize = () => {},
            changePage = () => {}
        } = props

        // Certain props will be controlled locally
        // The parent will only concern itself with receiving events
        // about changes to the table, data selected, etc
        // Object.assign(state, { pageSize, page })

        // columns = columns //.slice()

        return html`
            ${styles}
            <div class="data-table">
                ${slot && slot()}
                <div style="display: flex; align-items: end; justify-content: flex-end;">
                    <div v-if="pageSizeSelector" style="margin-bottom: 15px;">
                        Show
                        <select
                            .value=${pageSize}
                            @change=${e => {
                                state.pageSize = Number(e.target.value)
                                changePageSize(e)
                            }}
                        >
                            ${[5, 10, 25, 50, 100].map(
                                size => html` <option .value=${size}>${size}</option>`
                            )}
                        </select>
                        entries
                    </div>

                    <span style="flex-grow: 1;" />
                    ${searchable &&
                    html`
                        <div class="form-group has-feedback has-search pull-right">
                            <span class="glyphicon glyphicon-search form-control-feedback"></span>
                            <input
                                .value=${state.searchText}
                                @input=${state.debounceSearch}
                                type="text"
                                placeholder="Search..."
                                class="form-control"
                                xid="text"
                            />
                        </div>
                    `}
                    ${slotTopRight && slotTopRight()}
                </div>

                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                ${columns.map(
                                    col => html`
                                        <th
                                            Xkey="col.field"
                                            class=${state.headerClasses(col)}
                                            @click=${() => col.sortable && state.sort(col, props)}
                                            style="min-width: 50px; width: ${col.width}"
                                        >
                                            ${(slotHeaderCell && slotHeaderCell(col)) ||
                                            html`
                                                <span>
                                                    ${col.iconPrefix &&
                                                    html`<i class=${col.iconPrefix}></i>`}
                                                    ${col.label}
                                                    ${col.iconSuffix &&
                                                    html`<i class=${col.iconSuffix}></i>`}
                                                </span>

                                                ${(col.sortable &&
                                                    state.sortDesc != null &&
                                                    state.sortBy === col.field &&
                                                    html`
                                                        <span style="margin-left: 6px;">
                                                            ${(state.sortDesc === true &&
                                                                html`
                                                                    <i
                                                                        class="fa fa-sort-down"
                                                                        key="down"
                                                                    ></i>
                                                                `) ||
                                                            null}
                                                            ${(state.sortDesc === false &&
                                                                html` <i
                                                                    class="fa fa-sort-up"
                                                                    key="up"
                                                                ></i>`) ||
                                                            null}
                                                        </span>
                                                    `) ||
                                                null}
                                            `}
                                        </th>
                                    `
                                )}
                            </tr>
                        </thead>

                        <!-- Optional progress bar can be implemented at state slot in the parent -->
                        ${slotProgressBar && slotProgressBar()}

                        <tbody>
                            ${state.filteredData(props).map(
                                (row, index) => html`
                                    <tr
                                        @click=${() =>
                                            (row.expand = row.expand === row ? null : row)}
                                    >
                                        ${columns.map(
                                            col => html`
                                                <td class=${state.itemClasses(col)}>
                                                    ${(slotItem && slotItem()) ||
                                                    html` ${row[col.field]} `}
                                                </td>
                                            `
                                        )}
                                    </tr>

                                    <!-- TODO: Expandable section does not work  -->
                                    ${(!!state.expandable &&
                                        row.expand === row &&
                                        html`
                                            <slot name="expand" v-bind="{row, index}">
                                                <tr
                                                    :key="'collapse'+index"
                                                    style="background: lightyellow;"
                                                >
                                                    <td colspan="100%">Expanded {{ row }}</td>
                                                </tr>
                                            </slot>
                                        `) ||
                                    undefined}
                                `
                            )}
                        </tbody>
                    </table>
                </div>

                <div
                    style="display: flex; align-items: center; justify-content: center; margin-top:15px;"
                >
                    ${showCounts &&
                    html`
                        <span style="flex-grow: 1;"
                            >Showing ${(page - 1) * pageSize + 1} to ${page * pageSize} of
                            ${state.totalRecordCount(props)} entries</span
                        >
                    `}
                    <!-- -->

                    ${(paginator.align === 'right' && html`<span style="flex-grow: 1;" />`) || null}
                    <!-- -->

                    <!-- TODO: Paginator does not work  -->
                    ${(state.showPaginator(props) &&
                        state.totalRecordCount(props) &&
                        pageSize &&
                        html`
                            ${Paginator(props)}
                            <uiv-pagination
                                .value=${page}
                                @change=${e => changePage(e.detail)}
                                .total-page=${Math.ceil(state.totalRecordCount(props) / pageSize)}
                                .max-size=${paginator.maxSize}
                                Xalign="(paginator.align || 'right')"
                                .size=${paginator.size || null}
                                .boundary-links=${paginator.boundaryLinks}
                            />
                        `) ||
                    null}
                    ${(paginator.align === 'left' && html`<span style="flex-grow: 1;" />`) || null}
                </div>
            </div>
        `
    }
}

//     created() {
//         if (typeof state.mustSort === 'string') {
//             state.sortBy = state.mustSort
//             state.sortDesc = false
//         } else state.sortBy = ''
//     }

//     mounted() {
//         if (state.$scopedSlots.expand) state.expandable = true
//     }

//     watch: {
//         pageSize(nv) {
//             pageSize = nv
//         },

//         page(nv) {
//             page = nv
//         },

//         async dataControls() {
//             if (state.getData)
//                 state.displayData = await state.getData({
//                     sortBy: state.sortBy,
//                     sortDesc: state.sortDesc,
//                     page: page,
//                     pageSize: pageSize,
//                     query: state.searchText,
//                 })
//             else state.displayData = state.filteredData

//             // Limit the page number to the available number of pages
//             page =
//                 state.totalPages < page ? state.totalPages : page
//         }
//     }
