// --- implement a custom useState that returns a reactive object ---
import { render } from 'lit-html'
import hyperactiv from 'hyperactiv/src'
const { observe, computed, dispose } = hyperactiv

// non-reactive

// let nonreactiveCount = 0
// let nonreactiveBox = new WeakMap()
//
// export const useNonReactive = data => {
//     if (typeof nonreactiveBox[nonreactiveCount] === 'undefined')
//         nonreactiveBox[nonreactiveCount] = data
//     return nonreactiveBox[nonreactiveCount++]
// }

// reactive

let stateCount = 0
const stateBox = new WeakMap()
// const stateBox = observe(new WeakMap(), { batch: true })

export const useState = (data, { ignore } = {}) => {
    if (typeof stateBox[stateCount] === 'undefined')
        stateBox[stateCount] = observe(data, { batch: true, ignore })
    return stateBox[stateCount++]
}

export const useRef = data => {
    if (typeof stateBox[stateCount] === 'undefined') stateBox[stateCount] = { value: data }
    return stateBox[stateCount++]
}

export const mount = (component, target) => {
    if (typeof target === 'string') target = document.querySelector(target)

    return computed(() => {
        stateCount = 0
        // nonreactiveCount = 0
        console.time('± render')
        render(component(), target)
        console.timeEnd('± render')
        console.log('>> stateCount:', stateCount)
    })
}
