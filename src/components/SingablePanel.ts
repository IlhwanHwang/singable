import Component from "./Component"
import {createDivNode, createButtonNode} from "../utils/singable"
import DrumRollSingable from "./DrumRollSingable";
import TransposeSingable from "./TransposeSingable";
import OutputSingable from "./OutputSingable"
import PianoRollSingable from "./PianoRollSingable"
import AtChannelSingable from "./AtChannelSingable";
import ParallelSingable from "./ParallelSingable";
import EnumerateSingable from "./EnumerateSingable";
import ReharmonizeSingable from "./ReharmonizeSingable";
import Singable from "./Singable";
import ArpeggioSingable from "./ArpeggioSingable";
import RepeatSingable from "./RepeatSingable";
import BoundSingable from "./BoundSingable";
import Draggable, {DragEvent} from "./Draggable";
import { checkInside } from "../utils";

export default class SingablePanel extends Draggable {
  zoom = 1

  constructor(parent: Component) {
    super(parent)
    this.allowTransform = false
  }

  transform() {
    this.container.style.transform = `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.__translateX}, ${this.__translateY})`
    this.update()
  }

  onDragging(e: DragEvent) {
    this.transform()
  }

  dragCriteria(e: DragEvent): boolean {
    return !this.children.some(c => {
      return checkInside(c.target, e.x, e.y)
    })
  }

  render(): [HTMLElement, HTMLElement] {
    const container = createDivNode(n => {
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
          if (e.deltaY > 0) { this.zoom /= 1.5 }
          if (e.deltaY < 0) { this.zoom *= 1.5 }
          this.transform()
        }
        n.style.width = "100%"
        n.style.height = "100%"
        n.style.position = "relative"
      },
      [
        container,
        ...[
          ["New drum roll", () => new DrumRollSingable(this)],
          ["New piano roll", () => new PianoRollSingable(this)],
          ["New transpose", () => new TransposeSingable(this)],
          ["New at-channel", () => new AtChannelSingable(this)],
          ["New output", () => new OutputSingable(this)],
          ["New parallel", () => new ParallelSingable(this)],
          ["New enumerate", () => new EnumerateSingable(this)],
          ["New reharmonize", () => new ReharmonizeSingable(this)],
          ["New arpeggio", () => new ArpeggioSingable(this)],
          ["New repeat", () => new RepeatSingable(this)],
          ["New bound", () => new BoundSingable(this)],
        ]
          .map(x => x as [string, () => Singable])
          .map(([text, factory]) =>
          createButtonNode(n => {
            n.innerText = text
            n.onclick = e => {
              const newSingable = factory()
              newSingable.update()
            }
          })
        )
      ]
    )
    return [newDiv, container]
  }
}