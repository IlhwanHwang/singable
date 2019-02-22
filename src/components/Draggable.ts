import Component from "./Component"

export interface DragEvent extends MouseEvent {
  deltaX: number,
  deltaY: number,
}

export default class Draggable extends Component {
  __mousePrevX: number
  __mousePrevY: number
  __translateX: number = 0
  __translateY: number = 0
  __deltaX: number
  __deltaY: number
  allowTransform = true
  dragging = false
  dragSpeed = 1

  moveTo(x: number = null, y: number = null) {
    if (x === null && y === null) {
      x = this.__translateX
      y = this.__translateY
    }
    else {
      this.__translateX = x
      this.__translateY = y
    }
    this.target.style.transform = `translate(${x}px, ${y}px)`   
  }

  dragCriteria(e: MouseEvent): boolean {
    return true
  }

  create() {
    super.create()

    const targetNode = this.target 
    const dragNode = (targetNode.querySelector("[draggable-target='true']") as HTMLElement) || this.target

    if (this.__translateX !== undefined && this.__translateY !== undefined) {
      if (this.allowTransform) {
        this.moveTo()
      }
    }

    dragNode.onmousedown = e => {
      this.__mousePrevX = e.x
      this.__mousePrevY = e.y
      this.__deltaX = 0
      this.__deltaY = 0

      if (this.__translateX === undefined && this.__translateY === undefined) {
        this.__translateX = 0
        this.__translateY = 0
      }

      if (!this.dragCriteria(e)) {
        return
      }

      this.dragging = true

      this.onDragStart(e)
      
      const dragging = (e: MouseEvent) => {
        e.preventDefault()

        const deltaX = (e.x - this.__mousePrevX) * this.dragSpeed
        const deltaY = (e.y - this.__mousePrevY) * this.dragSpeed

        this.__deltaX += deltaX
        this.__deltaY += deltaY
        
        this.__translateX += deltaX
        this.__translateY += deltaY
        if (this.allowTransform) {
          this.moveTo()
        }

        this.__mousePrevX = e.x
        this.__mousePrevY = e.y

        if (this.onDragging && this.target) {
          this.onDragging({
            deltaX: this.__deltaX, 
            deltaY: this.__deltaY, 
            ...e
          })
        }
      }
      
      const dragStop = (e: MouseEvent) => {
        window.removeEventListener("mousemove", dragging)
        window.removeEventListener("mouseup", dragStop)
        this.dragging = false
        
        if (this.target) {
          this.onDragStop(e)
        }
      }

      window.addEventListener("mousemove", dragging)
      window.addEventListener("mouseup", dragStop)
    }
  }

  onDragStart(e: MouseEvent) {

  }

  onDragging(e: DragEvent) {
    
  }

  onDragStop(e: MouseEvent) {
    
  }
}