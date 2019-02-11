import Component from "./Component"

export default class Draggable extends Component {
  __mousePrevX: number
  __mousePrevY: number
  __translateX: number
  __translateY: number

  create() {
    super.create()

    const targetNode = this.target as HTMLElement
    const dragNode = targetNode.querySelector("[draggable-target='true']") as HTMLElement

    if (this.__translateX !== undefined && this.__translateY !== undefined) {
      targetNode.style.transform = `translate3D(${this.__translateX}px, ${this.__translateY}px, 0)`
    }

    dragNode.onmousedown = e => {
      const me = e as MouseEvent

      this.__mousePrevX = me.x
      this.__mousePrevY = me.y

      if (this.__translateX === undefined && this.__translateY === undefined) {
        this.__translateX = 0
        this.__translateY = 0
      }
      
      const dragging = (e: Event) => {
        e.preventDefault()

        const me = e as MouseEvent
        const deltaX = me.x - this.__mousePrevX
        const deltaY = me.y - this.__mousePrevY
        
        this.__translateX += deltaX
        this.__translateY += deltaY
        targetNode.style.transform = `translate3D(${this.__translateX}px, ${this.__translateY}px, 0)`

        this.__mousePrevX = me.x
        this.__mousePrevY = me.y
      }
      
      const dragStop = (e: Event) => {
        // TODO: remove event
        // window.removeEventListener("onmousemove", dragging)
        // window.removeEventListener("onmouseup", dragStop)
        window.onmousemove = null
        window.onmouseup = null
      }

      // TODO: add event
      // window.addEventListener("onmousemove", dragging)
      // window.addEventListener("onmouseup", dragStop)
      window.onmousemove = dragging
      window.onmouseup = dragStop
    }
  }
}