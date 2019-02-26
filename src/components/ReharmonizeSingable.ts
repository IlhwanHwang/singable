import Component, { Container } from "./Component"
import Singable from "./Singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import BaseEditor from "./BaseEditor";
import NoteKey, { Timeline, pitchNotation } from "../Key";
import { range, flatten, sum, toPairs, fromPairs } from "lodash"
import { createDivNode, createSelectNode, createOptionNode, createButtonNode, createInputNode, createSpanNode } from "../utils/singable";
import { MajorScale, NaturalMinorScale } from "../reharmonizer/Scale";
import { Numeral, songToChordNodes } from "../reharmonizer";;
import { ChordNode } from "../reharmonizer/ChordDag";
import { TimeIndicator } from "./Indicators";
import Player from "../utils/Player";

export interface ReharmonizeStructure {
  restrictions: {
    [index: string]: string
  }
  scale: {
    tonic: number,
    quality: string
  }
  granularity: Array<number>
  outputScale: boolean
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
      granularity: [1, 2, 4],
      outputScale: false
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

  getSong(): Timeline {
    const op = this.ip.findOut()
    const singer = op ? op.parent as Singable : null
    return singer ? singer.sing() : null
  }

  getChordNodes(): Array<ChordNode> {
    const numeralRestrictions = fromPairs(
      toPairs(this.data.restrictions)
        .filter(([k, r]) => r !== "")
        .map(([k, r]) => [k, Numeral.parse(r)])
    )
    const scale = this.getScale()
    const song = this.getSong()
    const chordNodes = song
      ? songToChordNodes(song, scale, numeralRestrictions, this.data.granularity)
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
          .map(cn => {
            const pitches = this.data.outputScale
              ? scale.chord(cn.numeral)
                .concat(scale.availableTensionNotesPrimary(cn.numeral))
                .concat(scale.availableTensionNotesSecondary(cn.numeral))
              : scale.chord(cn.numeral)
            return pitches.map(p => [p, cn.timing, cn.length])
          })
      ).map(([pitch, timing, length]) => new NoteKey(timing, length, pitch + 60))
    )
  }
}


export class ReharmonizeEditor extends BaseEditor {
  data: ReharmonizeStructure
  reharmonizer: ReharmonizeSingable
  unitBeatLength: number = 64
  unitPitchHeight: number = 5
  pitchMax: number = 80
  pitchMin: number = 40
  timing: number = 0
  timeIndicator: TimeIndicator
  player: Player = null
  bpm: number = 120
  timingTracker: number = null
  latency: number = 0.5
  scrollX: number = 0

  constructor(parent: Component, parentTarget: string = "default", singable: Singable, data: ReharmonizeStructure) {
    super(parent, parentTarget, singable)
    this.data = data
    this.reharmonizer = (this.singable as ReharmonizeSingable)

    this.timeIndicator = new class extends TimeIndicator {
      dragAction(e: MouseEvent) {
        const rectX = this.element.getBoundingClientRect().left
        const mouseX = e.x - rectX
        const parent = (this.parent as ReharmonizeEditor)
        parent.updateTimeIndicator(mouseX / this.unitBeatLength)
      }

      onDragStart(e: MouseEvent) {
        super.onDragStart(e)
        this.dragAction(e)
      }

      onDragging(e: MouseEvent) {
        super.onDragging(e)
        this.dragAction(e)
      }
    }(this, "time-indicator", this.unitBeatLength)
    this.timeIndicator.length = this.reharmonizer.getSong().length
    this.timeIndicator.incompletes = 0
  }

  updateTimeIndicator(timing: number) {
    this.timing = timing
    this.timeIndicator.timing = timing
    this.timeIndicator.update()
    // this.update()
    const bar = this.element.querySelector(".reharmonize-time-indicator-bar") as HTMLElement
    bar.style.left = `${this.timing * this.unitBeatLength}px`
  }

  onAttached() {
    this.element.querySelector(".scroll-area").scroll(this.scrollX, 0)
  }

  render(): [HTMLElement, Container] {
    const chordNodes = this.reharmonizer.getChordNodes()
    const song = this.reharmonizer.getSong()
    const numerals = this.reharmonizer.getScale().possibleNumerals()
    const length = Math.max(...chordNodes.map(cn => cn.timing + cn.length))
    const minimumGrain = Math.min(...this.data.granularity)

    this.pitchMax = Math.max(...song.keys.filter(k => k instanceof NoteKey).map(k => (k as NoteKey).pitch))
    this.pitchMin = Math.min(...song.keys.filter(k => k instanceof NoteKey).map(k => (k as NoteKey).pitch))
    
    const timeIndicator = createDivNode(n => {
      n.style.position = "relative"
      n.style.width = `${length * this.unitBeatLength}px`
      n.style.height = "20px"
    })

    const noteView = createDivNode(n => {
      n.style.position = "relative"
      n.style.width = "100%"
      n.style.height = `${(this.pitchMax - this.pitchMin + 1) * this.unitPitchHeight}px`
    }, [
      ...song.keys
        .filter(k => k instanceof NoteKey)
        .map(k => k as NoteKey)
        .map(k => createDivNode(n => {
          n.style.position = "absolute"
          n.style.left = `${this.unitBeatLength * k.timing}px`
          n.style.width = `${this.unitBeatLength * k.length}px`
          n.style.top = `${this.unitPitchHeight * (this.pitchMax - k.pitch)}px`
          n.style.height = `${this.unitPitchHeight}px`
          n.style.backgroundColor = "gray"
        })),
      createDivNode(n => {
        n.classList.add("reharmonize-time-indicator-bar")
        n.style.position = "absolute"
        n.style.borderLeft = "solid 1px black"
        n.style.width = "0px"
        n.style.height = "100%"
        n.style.left = `${this.timing * this.unitBeatLength}px`
        n.style.top = "0"
      })
    ])

    const newDiv = createDivNode(n => {
        n.style.border = "solid 1px orange",
        n.style.width = "100%",
        n.style.height = "100%",
        n.style.boxSizing = "border-box"
      }, [
        createDivNode(null, [
          createButtonNode(n => {
            n.innerText = "Play"
            const stop = () => {
              if (this.player) {
                this.player.stop()
                this.player = null
                n.innerText = "Play"
              }
              if (this.timingTracker !== null) {
                clearInterval(this.timingTracker)
                this.timingTracker = null
              }
            }
            const play = () => {
              const chord = this.reharmonizer.sing()
              const song = this.reharmonizer.getSong()
              const timeline = song.merge(chord)
              timeline.slice(this.timing, timeline.length - this.timing).toFile("./temp.mid")
              this.player = new Player()
              this.player.play("temp.mid", _ => stop())
              const started = Date.now() / 1000
              const startedTiming = this.timing
              this.timingTracker = setInterval(() => {
                const elapsed = Date.now() / 1000 - started
                this.updateTimeIndicator(startedTiming + elapsed * (this.bpm / 60) - this.latency)
              })
              n.innerText = "Stop"
            }
            n.onclick = e => this.player === null ? play() : stop()
          }),
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
          ]),
          createSpanNode(n => {
            n.innerText = "Output scale"
          }, [
            createInputNode(n => {
              n.type = "checkbox"
              n.checked = this.data.outputScale
              n.onchange = e => {
                this.data.outputScale = n.checked
              }
            })
          ])
        ]),
        createDivNode(n => {
          n.classList.add("scroll-area")
          n.style.width = "100%"
          n.style.overflow = "scroll"
          n.onscroll = e => {
            this.scrollX = n.scrollLeft
          }
        }, [
          timeIndicator,
          createDivNode(n => {
            n.style.position = "relative"
            n.style.width = `${length * this.unitBeatLength}px`
            n.style.height = "20px"
          }, [
            ...range(0, length, minimumGrain).map(t => createDivNode(n => {
              n.style.position = "absolute"
              n.style.left = `${t * this.unitBeatLength}px`
              n.style.width = `${minimumGrain * this.unitBeatLength}px`
              n.style.height = "100%"
              n.style.border = "solid 1px cyan"
              n.style.boxSizing = "border-box"
            }, [
              createSelectNode(n => {
                n.onchange = e => {
                  this.data.restrictions[t.toString()] = n.value
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
                  if (n.value === this.data.restrictions[t.toString()]) {
                    n.selected = true
                  }
                }))
              ])
            ]))
          ]),
          createDivNode(n => {
            n.style.position = "relative"
            n.style.width = `${length * this.unitBeatLength}px`
            n.style.height = "20px"
          }, [
            ...chordNodes.map(cn => createDivNode(n => {
              n.innerText = `${cn.numeral.notation()}`
              n.style.height = "100%"
              n.style.position = "absolute"
              n.style.left = `${cn.timing * this.unitBeatLength}px`
              n.style.width = `${cn.length * this.unitBeatLength}px`
              n.style.border = "solid 1px magenta"
              n.style.boxSizing = "border-box"
            }))
          ]),
          noteView
        ])
      ]
    )
    return [newDiv, { default: newDiv, "time-indicator": timeIndicator }]
  }
}