import { observe } from '../libs'

export default observe(
    {
        abc: 123,
        messages: 3,
        doStuff() {
            this.abc = 'Hello human!'
        }
    },
    { batch: true, bind: true }
)
