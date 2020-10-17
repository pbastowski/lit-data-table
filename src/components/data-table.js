import debounce from 'lodash/debounce'
import { html, classMap, log, json, LionPagination, observe } from '../libs.js'

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

// {
//     // data
//     data = [],
//     getData = null,
//     columns = [],
//
//     // filters
//     page = 1,
//     pageSize = 5,
//     sortBy = null,
//     sortDesc = false,
//     searchText = '',
//     mustSort = false,
//
//     // controls
//     paginator = true,
//     pageSizeSelector = true,
//     searchable = true,
//     expandable = null,
//
//     // display record stats
//     showCounts = true,
//
//     // slots
//     slot = null,
//     slotItem = null,
//     slotHeaderCell = null,
//     slotProgressBar = null,
//     slotTopRight = null,
//     slotPaginator = null,
//     slotExpand = null
// } = {}

export default function (props = {}) {
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
        paginator: true,
        pageSizeSelector: true,
        localPagination: false,

        searchable: true,

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

    const state = observe(
        {
            displayData: [],
            recordCount: 0,
            getDataError: null
        },
        { batch: true }
    )

    const filters = observe(
        {
            page: props.page,
            pageSize: props.pageSize,
            sortBy: props.sortBy,
            sortDesc: props.sortDesc,
            searchText: props.searchText,

            // Fetch data when the filters get updated
            __handler(key, nv, ov) {
                console.log('FILTERS', key, nv, ov)
                getDisplayData(props)
            }
        },
        { batch: true }
    )

    const debounceSearch = debounce(function (ev) {
        filters.searchText = ev.target.value
    }, 400)

    const toggleExpanded = row => {
        // Add a non-iterable prop $$expanded to the row object
        if (!row.hasOwnProperty('$$expanded'))
            Object.defineProperty(row, '$$expanded', { enumerable: false, writable: true })

        // toggle its value
        row.$$expanded = !row.$$expanded
    }

    const sort = (col, props) => {
        let sortBy, sortDesc

        if (props.mustSort) sortDesc = filters.sortBy === col.field ? !filters.sortDesc : false
        else if (filters.sortBy !== col.field) sortDesc = false
        else if (filters.sortDesc == null) sortDesc = false
        else if (filters.sortDesc) sortDesc = null
        else sortDesc = true

        sortBy = col.field

        filters.sortBy = sortBy
        filters.sortDesc = sortDesc
    }

    const headerClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'pad-sort-right': col.align === 'center' || col.align === 'left',
            'pad-sort-left': col.align === 'right',
            'text-right': col.align === 'right',
            [col.headerClass]: true
        })

    const itemClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'text-right': col.align === 'right',
            [col.itemClass]: true
        })

    // Get the data to display, either from getData or in the passed data prop
    const filterData = props => {
        state.getDataError = null

        return new Promise(async (resolve, reject) => {
            let result = props.getData
                ? await props.getData(filters).catch(er => {
                      state.getDataError = er
                      return reject()
                      return reject({ data: [], recordCount: 0 })
                  })
                : { data: props.data.slice(), recordCount: props.data.length }

            // Filter by search text
            // Note that this may already have been done by the getData function.
            // todo: consider providing a "localSearch" prop to control this behaviour
            if (filters.searchText) {
                let search = filters.searchText.toLowerCase()
                result.data = result.data.filter(row =>
                    Object.values(row).some(col => (col + '').toLowerCase().includes(search))
                )
                // Update the recordCount if data is coming from props.data
                if (!props.getData) result.recordCount = result.data.length
            }

            // local sorting
            // todo: consider providing a "localSort" prop to control this behaviour
            {
                let key = filters.sortBy
                if (key && filters.sortDesc != null) {
                    let sgn = filters.sortDesc ? -1 : 1
                    result.data.sort((a, b) => {
                        return a[key] === b[key] ? 0 : a[key] > b[key] ? sgn : -sgn
                    })
                }
            }

            return resolve(result)
        })
    }

    const getDisplayData = async props => {
        let result = await filterData(props)
        // console.log('>> getDisplayData:', result)

        // prevent page being > totalPages
        const totalPages = Math.ceil(result.recordCount / filters.pageSize)
        if (filters.page > totalPages && totalPages > 0) filters.page = totalPages

        // Do local pagination
        if ((!props.getData && props.paginator) || props.localPagination) {
            let start = (filters.page - 1) * filters.pageSize
            result.data = result.data.slice(start, start + filters.pageSize)
        }

        // trigger render
        state.recordCount = result.recordCount
        state.displayData = result.data
    }

    // fetch initial data
    getDisplayData(props)

    // Render function
    return () => {
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
                                    .value=${filters.pageSize}
                                    @change=${e => (filters.pageSize = Number(e.target.value))}
                                >
                                    ${[5, 10, 25, 50, 100].map(
                                        size =>
                                            html` <option
                                                .value=${size}
                                                ?selected=${size === filters.pageSize}
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
                                    .value=${filters.searchText}
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
                                                    filters.sortDesc != null &&
                                                    filters.sortBy === col.field &&
                                                    html`
                                                        <span style="margin-left: 6px;">
                                                            ${(filters.sortDesc === true &&
                                                                html`
                                                                    <i
                                                                        class="fa fa-sort-down"
                                                                        key="down"
                                                                    ></i>
                                                                `) ||
                                                            null}
                                                            ${(filters.sortDesc === false &&
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
                                (state.recordCount === 0 &&
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
                            state.recordCount > 0 &&
                            html`
                                <span style="flex-grow: 1;"
                                    >Showing ${(filters.page - 1) * filters.pageSize + 1} to
                                    ${Math.min(filters.page * filters.pageSize, state.recordCount)}
                                    of ${state.recordCount} records</span
                                >
                            `) ||
                        null
                    }

                    <!-- Add spacer if the paginator is right aligned -->
                    ${
                        props.paginator.align === 'right'
                            ? html`<span style="flex-grow: 1;" />`
                            : null
                    }

                    <!-- Optionally display the paginator  -->
                    ${
                        (props.paginator &&
                            state.recordCount &&
                            filters.pageSize &&
                            html`
                                <lion-pagination
                                    id="abc"
                                    .count=${Math.ceil(state.recordCount / filters.pageSize)}
                                    .current=${filters.page}
                                    @current-changed=${e => (filters.page = e.target.current)}
                                ></lion-pagination>
                            `) ||
                        null
                    }
                    ${
                        props.paginator.align === 'left'
                            ? html`<span style="flex-grow: 1;" />`
                            : null
                    }
                </div>

        </div>
            </div>
        `

        // console.timeEnd('± table')
        return template
    }
}
