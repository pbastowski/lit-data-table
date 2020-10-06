import debounce from 'lodash/debounce'
import { html, observe, classMap, log, json, LionPagination } from '../libs.js'
import bind from '../bind.js'

customElements.define('lion-pagination', LionPagination)

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
    xlion-pagination {
        border-radius: 100%;
        background: rgb(255, 98, 0);
        padding: 10px 15px;
        color: white;
        border: none;
    }
</style>`

export default function () {
    const state = observe(
        {
            sortBy: null,
            sortDesc: null,
            searchText: '',
            page: 1,
            pageSize: 5,
            displayData: [],
            __handler(key, nv, ov, obj) {
                // console.log('<<<<', key, nv, ov, obj)
            }
        },
        { batch: true, bind: true }
    )

    window.s = state

    const debounceSearch = debounce(function (ev) {
        state.searchText = ev.target.value
    }, 400)

    const expandedRows = new WeakMap()

    const toggleExpanded = (row, props) => {
        if (!props.expandable) return
        if (!row.hasOwnProperty('$$expanded'))
            Object.defineProperty(row, '$$expanded', { enumerable: false, writable: true })
        row.$$expanded = !row.$$expanded
    }

    const sort = (col, props) => {
        if (props.mustSort) state.sortDesc = state.sortBy === col.field ? !state.sortDesc : false
        else if (state.sortBy !== col.field) state.sortDesc = false
        else if (state.sortDesc == null) state.sortDesc = false
        else if (state.sortDesc) state.sortDesc = null
        else state.sortDesc = true

        state.sortBy = col.field
    }

    const headerClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'pad-sort-right': col.align === 'center' || col.align === 'left',
            'pad-sort-left': col.align === 'right',
            'text-right': col.align === 'right'
        }) +
        ' ' +
        col.headerClass

    const totalPages = () => {
        return Math.ceil(state.totalRecordCount / state.pageSize)
    }

    const filteredRecordCount = props => {
        return displayData.length
    }

    const itemClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'text-right': col.align === 'right'
        }) +
        ' ' +
        col.itemClass

    const showPaginator = props => props.paginator && typeof props.paginator === 'object'

    const totalRecordCount = props => {
        return props.getData ? props.recordCount : state.displayData.length
    }

    const filteredData = props => {
        let start = (props.page - 1) * props.pageSize

        let result = state.displayData.slice()

        // filter by search text
        if (state.searchText) {
            let search = state.searchText.toLowerCase()
            result = result.filter(row =>
                Object.values(row).some(col => (col + '').toLowerCase().includes(search))
            )
        }

        let key = state.sortBy

        if (key && state.sortDesc != null) {
            let sgn = state.sortDesc ? -1 : 1
            result.sort((a, b) => {
                return a[key] === b[key] ? 0 : a[key] > b[key] ? sgn : -sgn
            })
        }

        if (showPaginator(props)) result = result.slice(start, start + props.pageSize)

        return result
    }

    const getDisplayData = async props => {
        state.displayData = props.getData
            ? await props.getData({
                  sortBy: state.sortBy,
                  sortDesc: state.sortDesc,
                  page: state.page,
                  pageSize: state.pageSize,
                  query: state.searchText
              })
            : filteredData(props)
    }

    return (props = {}) => {
        let {
            // data
            data = [],
            getData = undefined,
            recordCount = null,
            columns = [],

            mustSort = null,
            sortBy = null,
            sortDesc = null,

            // paging, sorting and searching
            page = 0,
            pageSize = 5,
            changePageSize = () => {},
            changePage = () => {},
            paginator = {},
            pageSizeSelector = true,

            searchable = false,

            // display record stats
            showCounts = true,

            // slots
            slot = null,
            slotItem = null,
            slotHeaderCell = null,
            slotProgressBar = null,
            slotTopRight = null,
            slotPaginator = null,
            slotExpand = null
        } = props

        // Certain props will be controlled locally
        // The parent will only concern itself with receiving events
        // about changes to the table, data selected, etc
        // Object.assign(state, { pageSize, page })

        // This is how we style elements inside web-components with a shadow-root
        // requestAnimationFrame(() => {
        //     const s = document.createElement('style')
        //     s.innerHTML = `
        //     ul li:not(:first-child):not(:last-child) button {
        //         border-radius: 100%;
        //         background: rgb(255, 98, 0);
        //         xbackground: none;
        //         font-size: 16px;
        //         padding: 10px 15px;
        //         color: white;
        //         border: none;
        //     }
        //     `
        //     document.querySelector('#abc').shadowRoot.appendChild(s)
        // })

        if (props.sortBy && !state.sortBy) {
            state.sortBy = props.sortBy
            state.sortDesc = props.sortDesc
            console.log('SORTBY')
        }

        // if (typeof props.mustSort === 'boolean' && !state.mustSort) {
        //     // state.sortBy = props.sortBy
        //     // state.sortDesc = props.sortDesc
        //     // console.log('MUSTSORT')
        // }

        // Get the data to display, either from the backend or in the passed data prop
        getDisplayData(props)

        return html`
            ${styles}
            <div class="data-table">
                ${slot && slot()}
                <div style="display: flex; align-items: end; justify-content: flex-end;">
                
                    <!-- page size selector -->
                    ${
                        (pageSizeSelector &&
                            html`
                                <div class="input-group d-flex align-items-center mb-3">
                                    Show
                                    <select
                                        style="max-width: 100px;"
                                        class="form-control mx-2"
                                        .value=${pageSize}
                                        @change=${e => {
                                            props.changePageSize(Number(e.target.value))
                                        }}
                                    >
                                        ${[5, 10, 25, 50, 100].map(
                                            size => html` <option .value=${size}>${size}</option>`
                                        )}
                                    </select>
                                    entries
                                </div>
                                <span style="flex-grow: 1;" />
                            `) ||
                        null
                    }

                    <!-- search box -->
                    ${
                        searchable &&
                        html`
                            <div class="input-group col-md-4">
                                <input
                                    .value=${state.searchText}
                                    @input=${debounceSearch}
                                    type="text"
                                    placeholder="Search..."
                                    class="form-control"
                                />
                                <span class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button">
                                        <i class="fa fa-search"></i>
                                    </button>
                                </span>
                            </div>
                        `
                    }
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
                                            class=${headerClasses(col)}
                                            @click=${() => col.sortable && sort(col, props)}
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
                            ${state.displayData.map(
                                (row, index) => html`
                                    <tr @click=${() => toggleExpanded(row, props)}>
                                        ${columns.map(
                                            col => html`
                                                <td class=${itemClasses(col)}>
                                                    ${(slotItem && slotItem()) ||
                                                    html` ${row[col.field]} `}
                                                </td>
                                            `
                                        )}
                                    </tr>

                                    <!-- TODO: Expandable section does not work  -->
                                    ${(row.$$expanded && slotExpand && slotExpand(row)) || null}
                                `
                            )}
                        </tbody>
                    </table>
                </div>

                <div
                    style="display: flex; align-items: center; justify-content: center; margin-top:15px;"
                >
                    ${
                        showCounts &&
                        html`
                            <span style="flex-grow: 1;"
                                >Showing ${(page - 1) * pageSize + 1} to ${page * pageSize} of
                                ${totalRecordCount(props)} entries</span
                            >
                        `
                    }

                    <!-- Add spacer if the paginator is right aligned -->
                    ${(paginator.align === 'right' && html`<span style="flex-grow: 1;" />`) || null}

                    <!-- TODO: Paginator does not work  -->
                    ${
                        (showPaginator(props) &&
                            totalRecordCount(props) &&
                            pageSize &&
                            html`
                                <lion-pagination
                                    id="abc"
                                    .count=${Math.ceil(totalRecordCount(props) / pageSize)}
                                    .current=${page}
                                    @current-changed="${e => changePage(e.target.current)}}"
                                ></lion-pagination>
                            `) ||
                        null
                    }
                    ${(paginator.align === 'left' && html`<span style="flex-grow: 1;" />`) || null}
                </div>

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
