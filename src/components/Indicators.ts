import Draggable from "./Draggable";
import Component, { Container } from "./Component";
import { createDivNode, createSpanNode } from "../utils/singable";
import { pitchNotation } from "../Key";
import { range } from "lodash"

export class TimeIndicator extends Draggable {
  length: number
  incompletes: number
  timing: number
  unitBeatLength: number

  constructor(parent: Component, parentTarget: string, unitBeatLength: number) {
    super(parent, parentTarget)
    this.allowTransform = false
    this.unitBeatLength = unitBeatLength
  }

  render(): [HTMLElement, Container] {
    const newDiv = createDivNode(n => {
      n.style.position = "absolute"
      n.style.left = "0"
      n.style.top = "0"
      n.style.width = `${this.unitBeatLength * (this.length + this.incompletes + 1)}px`
      n.style.height = "100%"
    }, [
      ...range(-this.incompletes, this.length).map(t => createDivNode(n => {
        n.innerText = `${Math.floor(t / 4)}:${t % 4}(${t})`
        n.style.position = "absolute"
        n.style.left = `${(t + this.incompletes) * this.unitBeatLength}px`
        n.style.width = `${this.unitBeatLength}px`
        n.style.top = "0"
        n.style.height = "100%"
        n.style.backgroundColor = t % 2 === 0 ? "white" : "lightgray"
      })),
      createDivNode(n => {
        n.classList.add("pianoroll-time-indicator-handle")
        n.style.width = "20px"
        n.style.height = "20px"
        n.style.borderRadius = "10px"
        n.style.backgroundColor = "blue"
        n.style.position = "absolute"
        n.style.left = `${this.timing * this.unitBeatLength - 10}px`
        n.style.top = "0"
      })
    ])

    return [newDiv, { default: newDiv }]
  }
}


export class PitchIndicator extends Draggable {
  pitchMin: number
  pitchMax: number
  unitPitchHeight: number

  render(): [HTMLElement, Container] {
    const newDiv = createDivNode(n => {
      n.style.position = "absolute"
      n.style.left = "0"
      n.style.top = "0px"
      n.style.width = "100%"
    }, [
      ...range(this.pitchMin, this.pitchMax + 1).map(p => {
        return createSpanNode(n => {
          n.style.position = "absolute"
          n.style.width = "100%"
          n.style.height = `${this.unitPitchHeight}px`
          n.style.left = "0px"
          n.style.top = `${(this.pitchMax - p) * this.unitPitchHeight}px`
          n.style.fontSize = "8px"
          n.style.textAlign = "right"
          n.innerText = pitchNotation(p)
        })
      })
    ])

    return [newDiv, { default: newDiv }]
  }
}
