import Component from "./Component"

export interface DragEvent {
  deltaX: number,
  deltaY: number
}

export default class Draggable extends Component {
  __mousePrevX: number
  __mousePrevY: number
  __translateX: number
  __translateY: number
  onDragging: (e: DragEvent) => void

  create() {
    super.create()

    const targetNode = this.target 
    const dragNode = (targetNode.querySelector("[draggable-target='true']") as HTMLElement) || this.target

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

        if (this.onDragging) {
          this.onDragging({deltaX: deltaX, deltaY: deltaY})
        }
      }
      
      const dragStop = (e: Event) => {
        window.removeEventListener("mousemove", dragging)
        window.removeEventListener("mouseup", dragStop)
      }

      window.addEventListener("mousemove", dragging)
      window.addEventListener("mouseup", dragStop)
    }
  }
}