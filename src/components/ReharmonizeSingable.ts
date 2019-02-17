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
    [index: string]: string
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

  getScaleNotation(scaleData: ReharmonizeStructure["scale"] = null) {
    if (scaleData) {
      return `${scaleData.tonic}-${scaleData.quality}`
    }
    else {
      return `${this.data.scale.tonic}-${this.data.scale.quality}`
    }
  }

  parseScaleNotation(notation: string) {
    const [tonicStr, qualityStr] = notation.split("-")
    return {
      tonic: parseInt(tonicStr),
      quality: qualityStr
    }
  }

  getChordNodes(): Array<ChordNode> {
    const numeralRestrictions = fromPairs(
      toPairs(this.data.restrictions)
        .filter(([k, r]) => r !== "")
        .map(([k, r]) => [k, Numeral.parse(r)])
    )
    const scale = this.getScale()
    const op = this.ip.findOut()
    const singer = op ? op.parent as Singable : null
    const chordNodes = singer
      ? songToChordNodes(singer.sing(), scale, numeralRestrictions, [1, 2, 4])
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
  reharmonizer: ReharmonizeSingable

  constructor(parent: Component, singable: Singable, data: ReharmonizeStructure) {
    super(parent, singable)
    this.data = data
    this.reharmonizer = (this.singable as ReharmonizeSingable)
  }

  render(): [HTMLElement, HTMLElement] {
    try {
      const chordNodes = this.reharmonizer.getChordNodes()
      const numerals = this.reharmonizer.getScale().possibleNumerals()
      console.log(this.data.restrictions)
      const newDiv = createDivNode(n => {
          n.style.border = "solid 1px orange",
          n.style.width = "100%",
          n.style.height = "100%",
          n.style.boxSizing = "border-box"
        }, [
          createDivNode(null, [
            createSelectNode(n => {
              n.onchange = e => {
                const { tonic, quality } = this.reharmonizer.parseScaleNotation(n.value)
                this.data.scale.tonic = tonic
                this.data.scale.quality = quality
                this.update()
              }
            }, [
              ...range(0, 12).map(p => createOptionNode(n => {
                n.value = this.reharmonizer.getScaleNotation({ tonic: p, quality: "major"})
                n.innerText = `${pitchNotation(p, false)} Major`
                if (n.value === this.reharmonizer.getScaleNotation()) {
                  n.selected = true
                }
              })),
              ...range(0, 12).map(p => createOptionNode(n => {
                n.value = this.reharmonizer.getScaleNotation({ tonic: p, quality: "minor"})
                n.innerText = `${pitchNotation(p, false)} Minor`
                if (n.value === this.reharmonizer.getScaleNotation()) {
                  n.selected = true
                }
              }))
            ])
          ]),
          createDivNode(null, [
            ...flatten(
              chordNodes.map(cn => range(cn.length).map(i => {
                const timing = cn.timing + i
                return createDivNode(n => {
                  n.innerText = cn.numeral.notation()
                  n.style.display = "inline-block"
                  n.style.width = "48px"
                  n.style.border = "solid 1px cyan"
                }, [
                  createSelectNode(n => {
                    n.onchange = e => {
                      this.data.restrictions[timing] = n.value
                      this.update()
                    }
                  }, [
                    createOptionNode(n => {
                      n.innerText = "None"
                      n.value = ""
                    }),
                    ...numerals.map(numeral => createOptionNode(n => {
                      n.innerText = numeral.notation()
                      n.value = numeral.notation()
                      if (n.value === this.data.restrictions[timing.toString()]) {
                        n.selected = true
                      }
                    }))
                  ])
                ])
              }))
            )
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