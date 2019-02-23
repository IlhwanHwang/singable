import Component, { Container } from "./Component"
import {createDivNode, createButtonNode} from "../utils/singable"
import DrumRollSingable from "./DrumRollSingable";
import TransposeSingable from "./TransposeSingable";
import OutputSingable from "./OutputSingable"
import PianoRollSingable from "./PianoRollSingable"
import AtChannelSingable from "./AtChannelSingable";
import ParallelSingable from "./ParallelSingable";
import EnumerateSingable from "./EnumerateSingable";
import ReharmonizeSingable from "./ReharmonizeSingable";
import Singable, { factory } from "./Singable";
import ArpeggioSingable from "./ArpeggioSingable";
import RepeatSingable from "./RepeatSingable";
import BoundSingable from "./BoundSingable";
import Draggable, {DragEvent} from "./Draggable";
import { checkInside } from "../utils";
import { toPairs } from "lodash"
import { svgBackground } from "../utils/draw";

export default class SingablePanel extends Draggable {
  zoom = 1

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.allowTransform = false
  }

  transform() {
    this.containers["default"].style.transform = `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.__translateX}, ${this.__translateY})`
    this.update()
  }

  onDragging(e: DragEvent) {
    super.onDragging(e)
    this.transform()
  }

  dragCriteria(e: DragEvent): boolean {
    return !this.children["default"].some(c => {
      return checkInside(c.element, e.x, e.y)
    })
  }

  onAttached() {
    this.element.appendChild(svgBackground)
  }

  render(): [HTMLElement, Container] {
    const container = createDivNode(n => {
      n.style.width = "0"
      n.style.height = "0"
      n.style.transform = `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.__translateX}, ${this.__translateY})`
    })
    const newDiv = createDivNode(
      n => {
        n.style.border = "solid 1px black",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
        n.style.overflow = "hidden"
        n.onwheel = e => {
          const zoomAfter = (() => {
            if (e.deltaY > 0) { return this.zoom / 1.5 }
            else if (e.deltaY < 0) { return this.zoom * 1.5 }
            else { return this.zoom }
          })()

          const { left, top } = n.getBoundingClientRect()
          const localMouseX = ((e.x - left) - this.__translateX) / this.zoom
          const localMouseY = ((e.y - top) - this.__translateY) / this.zoom
          this.__translateX -= localMouseX * (zoomAfter - this.zoom)
          this.__translateY -= localMouseY * (zoomAfter - this.zoom)
          this.moveTo()

          this.zoom = zoomAfter
          this.transform()
        }
        n.style.width = "100%"
        n.style.height = "100%"
        n.style.position = "relative"
      },
      [
        container,
        ...toPairs(factory)
          .map(x => x as [string, () => Singable])
          .map(([text, factory]) =>
          createButtonNode(n => {
            n.innerText = text
            n.onclick = e => {
              const newSingable = factory()
              newSingable.update()
              newSingable.moveTo(-this.__translateX / this.zoom + 320, -this.__translateY / this.zoom + 160)
            }
          })
        )
      ]
    )
    return [newDiv, { default: container }]
  }
}