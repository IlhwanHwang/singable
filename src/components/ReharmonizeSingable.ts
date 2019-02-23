import Component, { Container } from "./Component"
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
  granularity: Array<number>
}

export default class ReharmonizeSingable extends Singable {
  className: string = "reharmonize"
  data: ReharmonizeStructure
  op: OutEndpoint
  ip: InEndpoint

  constructor(parent: Component, parentTarget: string = "default") {
    super(parent)
    this.data = {
      restrictions: {},
      scale: {
        tonic: 0,
        quality: "major"
      },
      granularity: [1, 2, 4]
    }
    this.name = "new reharmonize object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component, parentTarget: string = "default"): Component {
    return new ReharmonizeEditor(parent, parentTarget, this, this.data)
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
      ? songToChordNodes(singer.sing(), scale, numeralRestrictions, this.data.granularity)
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

  constructor(parent: Component, parentTarget: string = "default", singable: Singable, data: ReharmonizeStructure) {
    super(parent, parentTarget, singable)
    this.data = data
    this.reharmonizer = (this.singable as ReharmonizeSingable)
  }

  render(): [HTMLElement, Container] {
    const chordNodes = this.reharmonizer.getChordNodes()
    const numerals = this.reharmonizer.getScale().possibleNumerals()
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
          ]),
          createSelectNode(n => {
            n.onchange = e => {
              const granularity = n.value.split(",").map(g => parseInt(g))
              this.data.granularity = granularity
              this.update()
            }
          }, [
            ...[
              [1, 2, 4],
              [2, 4],
              [4],
              [1, 4],
              [1, 3],
              [3],
              [2],
              [1, 2],
              [1]
            ]
              .map(g => createOptionNode(n => {
                n.innerText = g.map(x => x.toString()).join(", ")
                n.value = g.map(x => x.toString()).join(",")
                if (n.value === this.data.granularity.map(x => x.toString()).join(",")) {
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
    return [newDiv, { default: newDiv }]
  }
}