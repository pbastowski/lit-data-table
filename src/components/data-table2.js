import debounce from 'lodash/debounce'
import { html, observe, classMap, log, json, LionPagination, useState } from '../libs.js'
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

export default (props = {}) => {
    props = {
        // data
        data: [],
        getData: null,
        columns: [],

        mustSort: null,
        sortBy: null,
        sortDesc: null,
        searchText: '',

        // paging, sorting and searching
        page: 1,
        pageSize: 5,
        changePageSize: () => {},
        changePage: () => {},
        paginator: {},
        pageSizeSelector: props.pageSizeSelector || null,
        localPagination: false,

        searchable: props.searchable || null,

        // display record stats
        showCounts: true,

        // slots
        slot: null,
        slotItem: null,
        slotHeaderCell: null,
        slotProgressBar: null,
        slotTopRight: null,
        slotPaginator: null,
        slotExpand: null,
        ...props
    }

    const state = useState(
        {
            filters: {
                page: null,
                pageSize: null,
                sortBy: null,
                sortDesc: null,
                searchText: '',

                __handler(key, nv, ov, obj) {
                    // console.log('FILTERS', key, nv, ov)
                    debounceGetData()
                }
            },

            displayData: [],

            created: false,
            filteredData: [],
            recordCount: 0,
            getDataError: null
        },
        { ignore: ['created', 'filteredData', 'recordCount', 'getDataError'] }
    )

    const debounceGetData = debounce(() => getDisplayData(props), 50)

    const debounceSearch = debounce(function (ev) {
        state.filters.searchText = ev.target.value
    }, 400)

    const expandedRows = new WeakMap()

    const toggleExpanded = (row, props) => {
        if (!props.expandable) return
        if (!row.hasOwnProperty('$$expanded'))
            Object.defineProperty(row, '$$expanded', { enumerable: false, writable: true })
        row.$$expanded = !row.$$expanded
    }

    const sort = (col, props) => {
        if (props.mustSort)
            state.filters.sortDesc =
                state.filters.sortBy === col.field ? !state.filters.sortDesc : false
        else if (state.filters.sortBy !== col.field) state.filters.sortDesc = false
        else if (state.filters.sortDesc == null) state.filters.sortDesc = false
        else if (state.filters.sortDesc) state.filters.sortDesc = null
        else state.filters.sortDesc = true

        state.filters.sortBy = col.field
    }

    const headerClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'pad-sort-right': col.align === 'center' || col.align === 'left',
            'pad-sort-left': col.align === 'right',
            'text-right': col.align === 'right',
            [col.headerClass]: true
        })

    const totalPages = props => {
        //console.log()
        return Math.ceil(totalRecordCount(props) / state.filters.pageSize)
    }

    const filteredRecordCount = props => {
        return state.displayData.length
    }

    const itemClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'text-right': col.align === 'right',
            [col.itemClass]: true
        })

    const showPaginator = props => props.paginator //&& typeof props.paginator === 'object'

    const totalRecordCount = props => {
        // console.log('recordCount', state.recordCount)
        return props.getData ? state.recordCount : state.filteredData.length
    }

    const filterData = async props => {
        // Get the data to display, either from the backend
        // or in the passed data prop.
        state.getDataError = null

        let result = props.getData
            ? await props
                  .getData({
                      sortBy: state.filters.sortBy,
                      sortDesc: state.filters.sortDesc,
                      page: state.filters.page,
                      pageSize: state.filters.pageSize,
                      query: state.filters.searchText
                  })
                  .catch(er => {
                      state.getDataError = er
                      return []
                  })
            : { data: props.data.slice(), recordCount: props.data.length }

        state.recordCount = result.recordCount
        result = result.data

        // filter by search text
        if (state.filters.searchText) {
            let search = state.filters.searchText.toLowerCase()
            result = result.filter(row =>
                Object.values(row).some(col => (col + '').toLowerCase().includes(search))
            )
        }

        // local sorting
        {
            let key = state.filters.sortBy
            if (key && state.filters.sortDesc != null) {
                let sgn = state.filters.sortDesc ? -1 : 1
                result.sort((a, b) => {
                    return a[key] === b[key] ? 0 : a[key] > b[key] ? sgn : -sgn
                })
            }
        }

        state.filteredData = result
        return result
    }

    const getDisplayData = async props => {
        let result = await filterData(props)

        const tp = totalPages(props)
        if (state.filters.page > tp && tp > 0) state.filters.page = tp

        if ((!props.getData && showPaginator(props)) || props.localPagination) {
            let start = (state.filters.page - 1) * state.filters.pageSize
            result = result.slice(start, start + state.filters.pageSize)
        }

        state.displayData = result
    }

    // CREATED hook
    if (!state.created) {
        state.created = true
        state.filters.page = totalPages(props) < props.page ? totalPages(props) : props.page
        state.filters.pageSize = props.pageSize

        state.filters.sortBy = props.sortBy
        state.filters.sortDesc = props.sortDesc

        state.filters.searchText = props.searchText

        // console.log('CREATED-HOOK')
    }

    // console.time('± table')
    const template = html`
            ${styles}
            <div class="data-table">
                ${props.slot && props.slot()}
                <div style="display: flex; align-items: end; justify-content: flex-end;">
                
                    <!-- page size selector -->
                    ${
                        props.pageSizeSelector &&
                        html`
                            <div class="input-group d-flex align-items-center mb-3">
                                Show
                                <select
                                    style="max-width: 100px;"
                                    class="form-control mx-2"
                                    .value=${state.filters.pageSize}
                                    @change=${e => {
                                        state.filters.pageSize = Number(e.target.value)
                                    }}
                                >
                                    ${[5, 10, 25, 50, 100].map(
                                        size =>
                                            html` <option
                                                .value=${size}
                                                ?selected=${size === state.filters.pageSize}
                                            >
                                                ${size}
                                            </option>`
                                    )}
                                </select>
                                rows
                            </div>
                            <span style="flex-grow: 1;" />
                        `
                    }

                    <!-- search box -->
                    ${
                        props.searchable &&
                        html`
                            <span
                                style="position:relative; width: 100%; min-width: 250px;"
                                class="mb-3"
                            >
                                <i
                                    class="fa fa-search"
                                    style="position: absolute; right: 1rem; color: silver; top: 10px;"
                                ></i>
                                <input
                                    .value=${state.filters.searchText}
                                    @input=${debounceSearch}
                                    type="text"
                                    placeholder="Search..."
                                    class="form-control"
                                    style="padding-right: 2.5rem"
                                />
                            </span>
                        `
                    }
                    ${props.slotTopRight && props.slotTopRight()}
                </div>

                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                ${props.columns.map(
                                    col => html`
                                        <th
                                            Xkey="col.field"
                                            class=${headerClasses(col)}
                                            @click=${() => col.sortable && sort(col, props)}
                                            style="min-width: 50px; width: ${col.width}"
                                        >
                                            ${(props.slotHeaderCell && props.slotHeaderCell(col)) ||
                                            html`
                                                <span>
                                                    ${col.iconPrefix &&
                                                    html`<i class=${col.iconPrefix}></i>`}
                                                    ${col.label}
                                                    ${col.iconSuffix &&
                                                    html`<i class=${col.iconSuffix}></i>`}
                                                </span>

                                                ${(col.sortable &&
                                                    state.filters.sortDesc != null &&
                                                    state.filters.sortBy === col.field &&
                                                    html`
                                                        <span style="margin-left: 6px;">
                                                            ${(state.filters.sortDesc === true &&
                                                                html`
                                                                    <i
                                                                        class="fa fa-sort-down"
                                                                        key="down"
                                                                    ></i>
                                                                `) ||
                                                            null}
                                                            ${(state.filters.sortDesc === false &&
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
                        ${props.slotProgressBar && props.slotProgressBar()}

                        <tbody>
                            <!-- data rows -->
                            ${state.displayData.map(
                                (row, index) => html`
                                    <tr @click=${() => toggleExpanded(row, props)}>
                                        ${props.columns.map(
                                            col => html`
                                                <td class=${itemClasses(col)}>
                                                    ${(props.slotItem &&
                                                        props.slotItem(row[col.field], col, row)) ||
                                                    html` ${row[col.field]} `}
                                                </td>
                                            `
                                        )}
                                    </tr>

                                    ${(row.$$expanded &&
                                        props.slotExpand &&
                                        props.slotExpand(row)) ||
                                    null}
                                `
                            )}
                            
                            <!-- No records message -->
                            ${
                                (totalRecordCount(props) === 0 &&
                                    html`<tr>
                                        <td colspan="100%">No records found</td>
                                    </tr>`) ||
                                null
                            }
                            
                            <!-- error message -->
                            ${
                                state.getDataError &&
                                html`<tr>
                                    <td colspan="100%" style="background: lightcoral;">
                                        ${state.getDataError}
                                    </td>
                                </tr>`
                            }
                        </tbody>
                        
                    </table>
                </div>

                <div
                    style="display: flex; align-items: center; justify-content: center;"
                >
                    ${
                        (props.showCounts &&
                            totalRecordCount(props) > 0 &&
                            html`
                                <span style="flex-grow: 1;"
                                    >Showing
                                    ${(state.filters.page - 1) * state.filters.pageSize + 1} to
                                    ${Math.min(
                                        state.filters.page * state.filters.pageSize,
                                        totalRecordCount(props)
                                    )}
                                    of ${totalRecordCount(props)} records</span
                                >
                            `) ||
                        null
                    }

                    <!-- Add spacer if the paginator is right aligned -->
                    ${
                        (props.paginator.align === 'right' &&
                            html`<span style="flex-grow: 1;" />`) ||
                        null
                    }

                    <!-- Optionally display the paginator  -->
                    ${
                        (showPaginator(props) &&
                            totalRecordCount(props) &&
                            state.filters.pageSize &&
                            html`
                                <lion-pagination
                                    id="abc"
                                    .count=${Math.ceil(
                                        totalRecordCount(props) / state.filters.pageSize
                                    )}
                                    .current=${state.filters.page}
                                    @current-changed=${e => (state.filters.page = e.target.current)}
                                    Xcurrent-changed="${e => props.changePage(e.target.current)}}"
                                ></lion-pagination>
                            `) ||
                        null
                    }
                    ${
                        (props.paginator.align === 'left' &&
                            html`<span style="flex-grow: 1;" />`) ||
                        null
                    }
                </div>

        </div>
            </div>
        `

    // console.timeEnd('± table')
    return template
}
