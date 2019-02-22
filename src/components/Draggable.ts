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
  __eventMouseMove: (e: MouseEvent) => void = null
  __eventMouseUp: (e: MouseEvent) => void = null

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
    dragNode.onmousedown = this.onDragStart.bind(this)
  }

  onDragStart(e: MouseEvent) {
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

    this.__eventMouseMove =  this.onDragging.bind(this)
    this.__eventMouseUp =  this.onDragStop.bind(this)
    window.addEventListener("mousemove", this.__eventMouseMove)
    window.addEventListener("mouseup", this.__eventMouseUp)
  }

  onDragging(e: MouseEvent) {
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
  }

  onDragStop(e: MouseEvent) {
    window.removeEventListener("mousemove", this.__eventMouseMove)
    window.removeEventListener("mouseup", this.__eventMouseUp)
    this.dragging = false
  }
}