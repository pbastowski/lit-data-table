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
    let created = false
    let _props
    let filteredData = []
    let displayData = []

    const state = observe(
        {
            page: 1,
            pageSize: 5,
            sortBy: null,
            sortDesc: null,
            searchText: '',

            // displayData: [],

            async __handler(key, nv, ov, obj) {
                if (key[0] !== 'displayData') {
                    filteredData = await filterData(_props)

                    getDisplayData(_props)
                }
                // console.log('<<<<', key, nv, ov)
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
        return state.displayData.length
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
        return props.getData ? props.recordCount : filteredData.length
    }

    const filterData = async props => {
        // let result = props.data.slice()
        let result = props.getData
            ? await props.getData({
                  sortBy: state.sortBy,
                  sortDesc: state.sortDesc,
                  page: state.page,
                  pageSize: state.pageSize,
                  query: state.searchText
              })
            : props.data.slice()

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
        // console.log('FILTER DATA')
        return result
    }

    const getDisplayData = async props => {
        // let result = props.getData
        //     ? await props.getData({
        //           sortBy: state.sortBy,
        //           sortDesc: state.sortDesc,
        //           page: state.page,
        //           pageSize: state.pageSize,
        //           query: state.searchText
        //       })
        //     : filteredData
        let result = await filterData(props)

        if ((!props.getData && showPaginator(props)) || props.localPagination) {
            let start = (state.page - 1) * state.pageSize
            result = result.slice(start, start + state.pageSize)
        }

        displayData = result
        // state.displayData = result

        // console.log('GET DISPLAY DATA:', JSON.stringify(state.displayData))
    }

    return (props = {}) => {
        props = {
            // data
            data: [],
            getData: null,
            recordCount: null,
            columns: [],

            mustSort: null,
            sortBy: null,
            sortDesc: null,

            // paging, sorting and searching
            page: 0,
            pageSize: 5,
            changePageSize: () => {},
            changePage: () => {},
            paginator: {},
            pageSizeSelector: true,
            localPagination: false,
            localSorting: false,

            searchable: false,

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

        _props = props // we need access to props in constructor functions

        if (!created) {
            created = true
            state.pageSize = props.pageSize
            state.sortBy = props.sortBy
            state.sortDesc = props.sortDesc

            state.page = totalPages(props) < props.page ? totalPages(props) : props.page

            console.log('CREATED-HOOK')
        }

        // Get the data to display, either from the backend or in the passed data prop

        console.time('± table')

        const template = html`
            ${styles}
            <div class="data-table">
                ${props.slot && props.slot()}
                <div style="display: flex; align-items: end; justify-content: flex-end;">
                
                    <!-- page size selector -->
                    ${
                        (props.pageSizeSelector &&
                            html`
                                <div class="input-group d-flex align-items-center mb-3">
                                    Show
                                    <select
                                        style="max-width: 100px;"
                                        class="form-control mx-2"
                                        .value=${state.pageSize}
                                        @change=${e => {
                                            state.pageSize = Number(e.target.value)
                                            // props.changePageSize(Number(e.target.value))
                                        }}
                                    >
                                        ${[5, 10, 25, 50, 100].map(
                                            size =>
                                                html` <option
                                                    .value=${size}
                                                    ?selected=${size === state.pageSize}
                                                >
                                                    ${size}
                                                </option>`
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
                        props.searchable &&
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
                        ${props.slotProgressBar && props.slotProgressBar()}

                        <tbody>
                            ${displayData.map(
                                (row, index) => html`
                                    <tr @click=${() => toggleExpanded(row, props)}>
                                        ${props.columns.map(
                                            col => html`
                                                <td class=${itemClasses(col)}>
                                                    ${(props.slotItem && props.slotItem()) ||
                                                    html` ${row[col.field]} `}
                                                </td>
                                            `
                                        )}
                                    </tr>

                                    <!-- TODO: Expandable section does not work  -->
                                    ${(row.$$expanded &&
                                        props.slotExpand &&
                                        props.slotExpand(row)) ||
                                    null}
                                `
                            )}
                        </tbody>
                    </table>
                </div>

                <div
                    style="display: flex; align-items: center; justify-content: center; margin-top:15px;"
                >
                    ${
                        props.showCounts &&
                        html`
                            <span style="flex-grow: 1;"
                                >Showing ${(state.page - 1) * state.pageSize + 1} to
                                ${Math.min(state.page * state.pageSize, totalRecordCount(props))} of
                                ${totalRecordCount(props)} entries</span
                            >
                        `
                    }

                    <!-- Add spacer if the paginator is right aligned -->
                    ${
                        (props.paginator.align === 'right' &&
                            html`<span style="flex-grow: 1;" />`) ||
                        null
                    }

                    <!-- TODO: Paginator does not work  -->
                    ${
                        (showPaginator(props) &&
                            totalRecordCount(props) &&
                            state.pageSize &&
                            html`
                                <lion-pagination
                                    id="abc"
                                    .count=${Math.ceil(totalRecordCount(props) / state.pageSize)}
                                    .current=${state.page}
                                    @current-changed=${e => (state.page = e.target.current)}
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
        console.timeEnd('± table')

        return template
    }
}
