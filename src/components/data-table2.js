// import { html, classMap, LionPagination } from '../libs.js'
import { html, classMap } from '../libs.js'

// customElements.define('lion-pagination', LionPagination)

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

export default ({ data = [], columns = [] }) => {
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

    // console.time('± table')
    const template = html`
        ${styles}
        <div class="data-table">
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            ${columns.map(
                                col => html`
                                    <th
                                        class=${headerClasses(col)}
                                        style="min-width: 50px; width: ${col.width}"
                                    >
                                        ${col.iconPrefix && html`<i class=${col.iconPrefix}></i>`}
                                        ${col.label}
                                        ${col.iconSuffix && html`<i class=${col.iconSuffix}></i>`}
                                    </th>
                                `
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        <!-- data rows -->
                        ${data.map(
                            (row, index) => html`
                                <tr Xclick=${() => toggleExpanded(row, props)}>
                                    ${columns.map(
                                        col => html`
                                            <td class=${itemClasses(col)}>${row[col.field]}</td>
                                        `
                                    )}
                                </tr>

                                ${(row.$$expanded && slotExpand && slotExpand(row)) || null}
                            `
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    `

    // console.timeEnd('± table')
    return template
}
