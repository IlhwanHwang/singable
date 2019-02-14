import Component from "./Component"

export interface DragEvent {
  deltaX: number,
  deltaY: number,
  x: number,
  y: number
}

export default class Draggable extends Component {
  __mousePrevX: number
  __mousePrevY: number
  __translateX: number
  __translateY: number
  __deltaX: number
  __deltaY: number
  allowTransform = true
  dragging = false

  create() {
    super.create()

    const targetNode = this.target 
    const dragNode = (targetNode.querySelector("[draggable-target='true']") as HTMLElement) || this.target

    if (this.__translateX !== undefined && this.__translateY !== undefined) {
      if (this.allowTransform) {
        targetNode.style.transform = `translate3D(${this.__translateX}px, ${this.__translateY}px, 0)`
      }
    }

    dragNode.onmousedown = e => {
      const me = e as MouseEvent

      this.__mousePrevX = me.x
      this.__mousePrevY = me.y
      this.__deltaX = 0
      this.__deltaY = 0

      if (this.__translateX === undefined && this.__translateY === undefined) {
        this.__translateX = 0
        this.__translateY = 0
      }

      this.dragging = true

      this.onDragStart({
        deltaX: this.__deltaX, 
        deltaY: this.__deltaY, 
        x: me.x + this.target.getClientRects()[0].left, 
        y: me.y + this.target.getClientRects()[0].right
      })
      
      const dragging = (e: Event) => {
        e.preventDefault()

        const me = e as MouseEvent
        const deltaX = me.x - this.__mousePrevX
        const deltaY = me.y - this.__mousePrevY

        this.__deltaX += deltaX
        this.__deltaY += deltaY
        
        this.__translateX += deltaX
        this.__translateY += deltaY
        if (this.allowTransform) {
          targetNode.style.transform = `translate3D(${this.__translateX}px, ${this.__translateY}px, 0)`
        }

        this.__mousePrevX = me.x
        this.__mousePrevY = me.y

        if (this.onDragging) {
          this.onDragging({
            deltaX: this.__deltaX, 
            deltaY: this.__deltaY, 
            x: me.x + this.target.getClientRects()[0].left, 
            y: me.y + this.target.getClientRects()[0].right
          })
        }
      }
      
      const dragStop = (e: Event) => {
        window.removeEventListener("mousemove", dragging)
        window.removeEventListener("mouseup", dragStop)
        this.dragging = false
        
        try {
          this.onDragStop({
            deltaX: this.__deltaX, 
            deltaY: this.__deltaY, 
            x: me.x + this.target.getClientRects()[0].left, 
            y: me.y + this.target.getClientRects()[0].right
          })
        }
        catch (e) {

        }
      }

      window.addEventListener("mousemove", dragging)
      window.addEventListener("mouseup", dragStop)
    }
  }

  onDragStart(e: DragEvent) {

  }

  onDragging(e: DragEvent) {
    
  }

  onDragStop(e: DragEvent) {
    
  }
}