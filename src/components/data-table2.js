import debounce from 'lodash/debounce'
import { virtual, html, classMap, log, json, LionPagination, useState, useEffect } from '../libs.js'
// import bind from '../bind.js'

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

export default virtual((props = {}) => {
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

    const [displayData, setDisplayData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [recordCount, setRecordCount] = useState(0)
    const [getDataError, setGetDataError] = useState(null)

    const [filters, setFilters] = useState({
        page: null,
        pageSize: null,
        sortBy: null,
        sortDesc: null,
        searchText: ''
    })

    // Fetch data when the filters get updated
    useEffect(() => {
        if (filters.page === null) return
        getDisplayData(props)
    }, [filters])

    // CREATED hook
    useEffect(() => {
        setFilters({
            page: totalPages(props) < props.page ? totalPages(props) : props.page,
            pageSize: props.pageSize,

            sortBy: props.sortBy,
            sortDesc: props.sortDesc,

            searchText: props.searchText
        })
    }, [])

    const debounceSearch = debounce(function (ev) {
        setFilters({ ...filters, searchText: ev.target.value })
    }, 400)

    const toggleExpanded = (row, props) => {
        if (!row.hasOwnProperty('$$expanded'))
            Object.defineProperty(row, '$$expanded', { enumerable: false, writable: true })
        row.$$expanded = !row.$$expanded

        setDisplayData(displayData)
    }

    const sort = (col, props) => {
        let sortBy, sortDesc

        if (props.mustSort) sortDesc = filters.sortBy === col.field ? !filters.sortDesc : false
        else if (filters.sortBy !== col.field) sortDesc = false
        else if (filters.sortDesc == null) sortDesc = false
        else if (filters.sortDesc) sortDesc = null
        else sortDesc = true

        sortBy = col.field

        setFilters({ ...filters, sortBy, sortDesc })
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
        return Math.ceil(totalRecordCount(props) / filters.pageSize)
    }

    const filteredRecordCount = props => {
        return displayData.length
    }

    const itemClasses = col =>
        classMap({
            'text-center': col.align === 'center',
            'text-right': col.align === 'right',
            [col.itemClass]: true
        })

    const showPaginator = props => props.paginator //&& typeof props.paginator === 'object'

    const totalRecordCount = props => {
        // console.log('recordCount', recordCount)
        return props.getData ? recordCount : filteredData.length
    }

    const filterData = async props => {
        // Get the data to display, either from the backend
        // or in the passed data prop.
        setGetDataError(null)

        let result = props.getData
            ? await props.getData(filters).catch(er => {
                  setGetDataError(er)
                  return []
              })
            : { data: props.data.slice(), recordCount: props.data.length }

        setRecordCount(result.recordCount)
        result = result.data

        // filter by search text
        if (filters.searchText) {
            let search = filters.searchText.toLowerCase()
            result = result.filter(row =>
                Object.values(row).some(col => (col + '').toLowerCase().includes(search))
            )
        }

        // local sorting
        {
            let key = filters.sortBy
            if (key && filters.sortDesc != null) {
                let sgn = filters.sortDesc ? -1 : 1
                result.sort((a, b) => {
                    return a[key] === b[key] ? 0 : a[key] > b[key] ? sgn : -sgn
                })
            }
        }

        setFilteredData(result)
        return result
    }

    const getDisplayData = async props => {
        let result = await filterData(props)

        // prevent page being > totalPages
        const tp = totalPages(props)
        if (filters.page > tp && tp > 0) setFilters({ ...filters, page: tp })

        // Do local pagination
        if ((!props.getData && showPaginator(props)) || props.localPagination) {
            let start = (filters.page - 1) * filters.pageSize
            result = result.slice(start, start + filters.pageSize)
        }

        setDisplayData(result)
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
                                    .value=${filters.pageSize}
                                    @change=${e => {
                                        setFilters({
                                            ...filters,
                                            pageSize: Number(e.target.value)
                                        })
                                    }}
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
                            ${displayData.map(
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
                                getDataError &&
                                html`<tr>
                                    <td colspan="100%" style="background: lightcoral;">
                                        ${getDataError}
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
                                    >Showing ${(filters.page - 1) * filters.pageSize + 1} to
                                    ${Math.min(
                                        filters.page * filters.pageSize,
                                        totalRecordCount(props)
                                    )}
                                    of ${totalRecordCount(props)} records</span
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
                        (showPaginator(props) &&
                            totalRecordCount(props) &&
                            filters.pageSize &&
                            html`
                                <lion-pagination
                                    id="abc"
                                    .count=${Math.ceil(totalRecordCount(props) / filters.pageSize)}
                                    .current=${filters.page}
                                    @current-changed=${e =>
                                        setFilters({
                                            ...filters,
                                            page: e.target.current
                                        })}
                                    Xcurrent-changed="${e => props.changePage(e.target.current)}}"
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
})
