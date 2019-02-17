import Component from "./Component"
import Singable from "./Singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import BaseEditor from "./BaseEditor";
import NoteKey, { Timeline, pitchNotation } from "../Key";
import { range, flatten, sum, toPairs, fromPairs } from "lodash"
import { createDivNode, createSelectNode, createOptionNode } from "../utils/singable";
import { MajorScale, NaturalMinorScale } from "../reharmonizer/Scale";
import { Numeral, songToChordNodes } from "../reharmonizer";;
import { ChordNode } from "../reharmonizer/ChordDag";

export interface ReharmonizeStructure {
  restrictions: {
    [index: number]: {
      index: number,
      secondaryDominant: boolean
    }
  }
  scale: {
    tonic: number,
    quality: string
  }
}

export default class ReharmonizeSingable extends Singable {
  data: ReharmonizeStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component) {
    super(parent)
    this.data = {
      restrictions: {},
      scale: {
        tonic: 0,
        quality: "major"
      }
    }
    this.name = "new reharmonize object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new ReharmonizeEditor(parent, this, this.data)
  }

  getScale() {
    switch (this.data.scale.quality) {
      case "major": return new MajorScale(this.data.scale.tonic)
      case "minor": return new NaturalMinorScale(this.data.scale.tonic)
      default: return null
    }
  }

  getChordNodes(): Array<ChordNode> {
    const scale = this.getScale()
    const op = this.ip.findOut()
    const singer = op ? op.parent as Singable : null
    const numeralRestrictions = fromPairs(toPairs(this.data.restrictions)
      .map(([k, r]) => [k, new Numeral(r.index, false, r.secondaryDominant)]))
    const chordNodes = singer
      ? songToChordNodes(singer.sing(), scale, numeralRestrictions, [1, 2, 4], {advantages: (n: Numeral) => 0})
      : []
    return chordNodes
  }

  sing(): Timeline {
    const chordNodes = this.getChordNodes()
    const scale = this.getScale()
    return new Timeline(
      sum(chordNodes.map(cn => cn.length)),
      flatten(
        chordNodes
          .map(cn => scale.chord(cn.numeral).map(p => [p, cn.timing, cn.length]))
      ).map(([pitch, timing, length]) => new NoteKey(timing, length, pitch + 60))
    )
  }
}


export class ReharmonizeEditor extends BaseEditor {
  data: ReharmonizeStructure

  constructor(parent: Component, singable: Singable, data: ReharmonizeStructure) {
    super(parent, singable)
    this.data = data
  }

  render(): [HTMLElement, HTMLElement] {
    try {
      const chordNodes = (this.singable as ReharmonizeSingable).getChordNodes()
      const newDiv = createDivNode(n => {
          n.style.border = "solid 1px orange",
          n.style.width = "100%",
          n.style.height = "100%",
          n.style.boxSizing = "border-box"
        }, [
          createDivNode(null, [
            createSelectNode(n => {
              n.value = `${this.data.scale.tonic},${this.data.scale.quality}`
              console.log(`${this.data.scale.tonic},${this.data.scale.quality}`)
              n.onchange = e => {
                const [tonicStr, qualityStr] = (e.target as HTMLSelectElement).value.split(",")
                this.data.scale.tonic = parseInt(tonicStr)
                this.data.scale.quality = qualityStr
                this.update()
              }
            }, [
              ...range(0, 12).map(p => createOptionNode(n => {
                n.value = `${p},major`
                n.innerText = `${pitchNotation(p, false)} Major`
              })),
              ...range(0, 12).map(p => createOptionNode(n => {
                n.value = `${p},minor`
                n.innerText = `${pitchNotation(p, false)} Minor`
              }))
            ])
          ]),
          createDivNode(null, [
            ...chordNodes.map(cn => createDivNode(n => {
              n.innerText = cn.numeral.notation()
              n.style.display = "inline-block"
              n.style.width = `${cn.length * 48}px`
              n.style.border = "solid 1px cyan"
            }))
          ])
        ]
      )
      return [newDiv, newDiv]
    }
    catch (e) {
      console.error(e)
      const newDiv = createDivNode()
      return [newDiv, newDiv]
    }
  }
}