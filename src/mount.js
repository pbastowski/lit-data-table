// --- implement a custom useState that returns a reactive object ---
import { render } from 'lit-html'
import hyperactiv from 'hyperactiv/src'
const { observe, computed, dispose } = hyperactiv

let stateCount = 0
const stateBox = observe(new WeakMap(), { batch: true })

export const useState = data => {
    if (typeof stateBox[stateCount] === 'undefined') stateBox[stateCount] = data
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
        console.time('± render')
        render(component(), target)
        console.timeEnd('± render')
    })
}
