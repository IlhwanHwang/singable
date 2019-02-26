import Component, { Container } from "./Component"
import Draggable, { DragEvent } from "./Draggable"
import {createDivNode, createButtonNode, createInputNode} from "../utils/singable"
import { outConnectionFocus, connections, editorSingable, editorBase } from "../renderer";
import {Timeline} from "../Key"
import { Endpoint, InEndpoint, OutEndpoint } from "./Endpoint";


export default class Singable extends Draggable {
  className: string = "singable"
	name: string
  nameEditing: boolean
  editor: Component
  endpoints: Array<Endpoint>
  data: {}

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent, parentTarget)
    this.name = "new singable object"
    this.endpoints = Array<Endpoint>()
    this.onDragging = e => {
      super.onDragging(e)
      connections.update()
    }
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return null
  }

	render(): [HTMLElement, Container] {
		const newDiv = createDivNode(
			n => {
        n.style.border = "solid 1px black"
        n.style.width = "160px"
        n.style.height = "120px"
        n.style.position = "absolute"
        n.style.left = "0"
        n.style.top = "0"
        n.onmousedown = e => {
          if (editorSingable.get() !== this) {
            if (editorSingable.get() !== null) {
              editorSingable.get().editor.destroy()
            }
            this.editor = this.getEditor(editorBase)
            // this.editor.update()
            editorSingable.set(this)
          }
        }
      },
			[
        createDivNode(n => {
          n.style.height = "24px"
          n.style.backgroundColor = "cyan"
          n.setAttribute("draggable-target", "true")
        }),
        createDivNode(n => {
          n.innerText = this.name
        }),
        createButtonNode(n => {
          n.innerText = "Delete"
          n.onclick = e => {
            if (editorSingable.get() === this) {
              this.editor.destroy()
              editorSingable.set(null)
            }
            this.destroy()
          }
        })
			]
		)
		return [newDiv, { default: newDiv }]
  }
  
  sing(): Timeline {
    return new Timeline(0)
  }

  onDragStart(e: MouseEvent) {
    super.onDragStart(e)
    this.dragSpeed = 1 / singablePanel.zoom
  }

  destroy() {
    const obj = (this as any)
    this.endpoints.forEach(ep => {
      if (ep instanceof InEndpoint) {
        connections.remove(null, ep)
      }
      if (ep instanceof OutEndpoint) {
        connections.remove(ep, null)
      }
    })
    super.destroy()
  }
}


import { singablePanel } from "../renderer";
import ArpeggioSingable from "./ArpeggioSingable";
import AtChannelSingable from "./AtChannelSingable";
import BoundSingable from "./BoundSingable";
import DrumRollSingable from "./DrumRollSingable";
import EnumerateSingable from "./EnumerateSingable";
import OutputSingable from "./OutputSingable";
import ParallelSingable from "./ParallelSingable";
import PianoRollSingable from "./PianoRollSingable";
import RepeatSingable from "./RepeatSingable";
import TransposeSingable from "./TransposeSingable";
import ReharmonizeSingable from "./ReharmonizeSingable";
import SnapSingable from "./SnapSingable";

export const factory: { [index: string]: () => Singable } = {
  arpeggio: () => new ArpeggioSingable(singablePanel),
  "at-channel": () => new AtChannelSingable(singablePanel),
  bound: () => new BoundSingable(singablePanel),
  drumroll: () => new DrumRollSingable(singablePanel),
  enumerate: () => new EnumerateSingable(singablePanel),
  output: () => new OutputSingable(singablePanel),
  parallel: () => new ParallelSingable(singablePanel),
  pianoroll: () => new PianoRollSingable(singablePanel),
  repeat: () => new RepeatSingable(singablePanel),
  reharmonize: () => new ReharmonizeSingable(singablePanel),
  snap: () => new SnapSingable(singablePanel),
  transpose: () => new TransposeSingable(singablePanel)
}
