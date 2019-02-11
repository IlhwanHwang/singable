import { create } from "domain";

let id = 0


export default class Component {
    target: Node = null
    container: Node = null
    parent: Component = null
    debugName: string = `component-${id++}`
    chlidren = Array<Component>()

    constructor(parent: Component = null) {
        this.parent = parent
        if (this.parent === null) {
            this.container = document.querySelector("body")
        }
        else {
            this.parent.chlidren.push(this)
        }
        this.create()
    }

    destroy() {
        this.target.parentNode.removeChild(this.target)
        this.parent.chlidren = this.parent.chlidren.filter((c) => { return this !== c })
    }

    create() {
        if (this.parent !== null) {
            const [newTarget, newContainer] = this.render()
            this.parent.container.insertBefore(newTarget, this.target)
            if (this.target !== null) {
                const oldTarget = this.target
                oldTarget.parentNode.removeChild(oldTarget)
            }
            this.target = newTarget;
            this.container = newContainer;
        }
    }

    update() {
        this.create()
        this.chlidren.forEach((c) => {
            c.target = null
            c.update()
        })
    }

    render(): [Node, Node] {
        return [null, null]
    }
}