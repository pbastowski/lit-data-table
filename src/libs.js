// Put all the imports into one lib file to make it
// easier to access in other source files.

// We want to export the individual methods of hyperactiv, not their container object
// so we first import hyperactiv and then destructure and export the methods we want.
import hyperactiv from 'hyperactiv/src'
export const { observe, computed, dispose } = hyperactiv

// lit-html has lots of useful methods, of which we only want a subset.
// The most useful to us are listed below.
// export { render, html, EventPart, directive, nothing } from 'lit-html'
export { EventPart, directive, nothing } from 'lit-html'
export {
    render,
    html,
    component,
    virtual,
    useState,
    useMemo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useReducer,
    useRef,
    useContext
} from 'haunted'

// export { render, EventPart, directive, nothing } from 'https://unpkg.com/lit-html'
// export { LitElement, html } from 'https://unpkg.com/lit-element?module'
export { repeat } from 'lit-html/directives/repeat'
export { styleMap } from 'lit-html/directives/style-map'
export { classMap } from 'lit-html/directives/class-map'
export { unsafeHTML } from 'lit-html/directives/unsafe-html'

// lit-element
// export { LitElement } from 'https://unpkg.com/lit-element?module' ///lit-element.js?module'

// easyrouter is a small client side hash #router
// import r from 'https://unpkg.com/easyrouter?module'
// export const router = r

// A small utility function that pretty-prints any objects given to it.
export const json = (...args) => args.map(arg => JSON.stringify(arg, null, 4))
export const log = console.log.bind(console)
// export { createRoutes } from './cr.js'

export { LionPagination } from '@lion/pagination'

import { useState } from 'haunted'

export const useObj = obj => {
    const [v, s] = useState(obj)
    return [v, nv => s({ ...v, ...nv })]
}

export const reactive = obj => {
    const [value, s] = useState(obj)

    return new Proxy(value, {
        set(o, p, nv) {
            s({ ...value, [p]: nv })
            return true
        }
    })
}

// Create global state accessible to all components that import it
export const createStore = store => {
    let setStore, init

    const setter = nv => {
        // Update the store directly
        store = { ...store, ...nv }
        // Tell haunted that we updated it
        setStore(store)
    }

    store.$set = setter

    return () => {
        // each component needs its own state
        let [v, sv] = useState(store)
        // but we only want the setter from the first useState
        !init && ((init = true), (setStore = sv))

        return [store, setter]
    }
}
