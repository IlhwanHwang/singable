import Singable from "./Singable"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";
import Key, {Timeline} from "../Key"
import {flatten} from "lodash"
import { createDivNode } from "../utils/singable";
import Draggable, {DragEvent} from "./Draggable";
import { checkInside } from "../utils";

export interface PianoRollStructure {
  keys: Array<Key>
  length: number
}

export default class PianoRollSingable extends Singable {
  data: PianoRollStructure
  op: OutEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      length: 16,
      keys: Array<Key>()
    }
    this.name = "new piano roll object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new PianoRollEditor(parent, this.data)
  }

  sing(): Timeline {
    return new Timeline(
      this.data.length,
      [...this.data.keys]
    )
  }
}

export class PianoRollEditor extends Component {
  data: PianoRollStructure
  unitBeatLength = 48
  unitPitchHeight = 10
  snapBeatResolution = 1/4
  snapToGrid = true
  lengthPrev = 2

  constructor(parent: Component, data: PianoRollStructure) {
    super(parent)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    const container = createDivNode(n => {
      n.style.position = "relative"
      n.style.width = "100%"
      n.style.height = "300%"
      n.style.border = "solid 1px red"
      n.onmousedown = e => {
        const overlapped = this.children.filter(c => c instanceof PianoRollKey).filter(c => checkInside(c.target, e.pageX, e.pageY)).length > 0
        if (!overlapped) {
          const snapped = this.snap(e.x - this.container.getClientRects()[0].left, e.y - this.container.getClientRects()[0].top)
          const pianoKey = new PianoRollKey(this, new Key(snapped.timing, this.lengthPrev, snapped.pitch))
          pianoKey.x = snapped.x
          pianoKey.y = snapped.y
          pianoKey.update()
          pianoKey.target.onmousedown(e)
          // pianoKey.entered = true
        }
      }
    })
    const newDiv = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "100%"
      n.style.display = "flex"
    }, [
      createDivNode(n => {
        n.style.width = "40px"
        n.style.height = "100%"
        n.style.border = "solid 1px blue"
      }),
      createDivNode(n => {
        n.style.width = "calc(100% - 40px)"
        n.style.height = "100%"
        n.style.overflow = "scroll"
      }, [
        container
      ])
    ])
    return [newDiv, container]
  }

  snap(x: number, y: number): {x: number, y: number, pitch: number, timing: number} {
    const timing = this.snapToGrid
      ? Math.floor(x / this.unitBeatLength / this.snapBeatResolution) * this.snapBeatResolution
      : x / this.unitBeatLength
    const pitch = Math.floor(y / this.unitPitchHeight)
    return {
      x: timing * this.unitBeatLength,
      y: pitch * this.unitPitchHeight,
      pitch: pitch,
      timing: timing
    }
  }
}

class PianoRollKey extends Draggable {
  key: Key
  x: number
  y: number
  xStart: number
  yStart: number

  constructor(parent: Component, key: Key) {
    super(parent)
    this.key = key
    this.allowTransform = false
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      const parent = (this.parent as PianoRollEditor)
      n.style.position = "absolute"
      n.style.left = `${this.x}px`
      n.style.top = `${this.y}px`
      n.style.width = `${this.key.length * parent.unitBeatLength}px`
      n.style.height = `${parent.unitPitchHeight}px`
      n.style.backgroundColor = "red"
      n.oncontextmenu = e => {
        e.preventDefault()
        this.destroy()
      }
    })
    return [newDiv, newDiv]
  }

  onDragStart(e: DragEvent) {
    this.xStart = this.x
    this.yStart = this.y
  }

  onDragging(e: DragEvent) {
    const parent = (this.parent as PianoRollEditor)
    const snapped = parent.snap(this.xStart + e.deltaX, this.yStart + e.deltaY + parent.unitPitchHeight / 2)
    this.x = snapped.x
    this.y = snapped.y
    this.key.tone = snapped.pitch
    this.key.start = snapped.timing
    this.update()
  }
}