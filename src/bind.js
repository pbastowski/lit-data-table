import { directive, EventPart } from './libs.js'

const cache = new WeakMap()
const queue = window.queueMicrotask || window.setTimeout

export const bind = directive((context, name, { event, allowUnset = false } = {}) => part => {
    const el = part.committer.element
    const radio = el.type === 'radio'
    const checkbox = el.type === 'checkbox'

    const hasValue = () => el.attributes.hasOwnProperty('value')
    const elValue = () => (hasValue() ? el.value : undefined)

    // Checkboxes can be bound to an array for a multiple choice result
    const arrayBinding = Array.isArray(context[name])

    // Always set the prop value based on the passed in value
    let value
    if (radio) {
        // radios are always mutually exclusive.
        // and their "value" needs to be read in the next tick,
        // otherwise they will have the value of "on".
        queue(() => {
            value = hasValue() ? context[name] === elValue() : context[name]
            part.setValue(value)
            // We need to commit the change, because the
            // update is asynchronous (queued).
            part.commit()
        })
    } else {
        if (checkbox) {
            queue(() => {
                value = arrayBinding
                    ? // Arrays hold multiple choices.
                      context[name].includes(elValue())
                    : // Otherwise checkboxes are mutually exclusive if they
                    // share the binding
                    hasValue()
                    ? context[name] === elValue()
                    : context[name]
                part.setValue(value)
                part.commit()
            })
        } else {
            // text/number inputs are always just values, as typed
            // by the user and passed in with .value
            value = context[name]
            part.setValue(value)
        }
    }
    // Add an event handler to set the value of the binding
    if (!cache.has(el)) {
        const _event = event || (radio && 'click') || (checkbox && 'change') || 'input'
        const _value = 'value'

        cache.set(el, _event)

        const eventPart = new EventPart(el, _event, part.options)

        eventPart.setValue(e => {
            if (radio && allowUnset) {
                if (el.checked && context[name] === el.value) {
                    el.checked = false
                    context[name] = undefined
                } else context[name] = el.value
            } else {
                if (checkbox && arrayBinding) {
                    context[name] = el.checked
                        ? [...context[name], el.value]
                        : context[name].filter(v => v !== el.value)
                } else if (checkbox) {
                    context[name] = hasValue() ? (el.checked ? el.value : '') : el.checked
                } else context[name] = el[_value]
            }
        })
        eventPart.commit()
    }
})

export default bind
