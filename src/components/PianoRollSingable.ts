import Singable from "./Singable"
import Component from "./Component";
import { OutEndpoint } from "./Endpoint";
import NoteKey, {Timeline, pitchMax, pitchMin, pitchNotation, ProgramChangeKey} from "../Key"
import { range, toPairs } from "lodash"
import { createDivNode, createSpanNode, createButtonNode, createSelectNode, createOptionNode, createInputNode } from "../utils/singable";
import Draggable, {DragEvent} from "./Draggable";
import { checkInside } from "../utils";
import { instruments } from "../keys";
import Player from "../utils/Player"
import BaseEditor from "./BaseEditor";

export interface PianoRollStructure {
  keys: Array<NoteKey>
  length: number
  instrumentKey: number
  channel: number
}

export default class PianoRollSingable extends Singable {
  data: PianoRollStructure
  op: OutEndpoint
  instrumentName: string = instruments["1"]

  constructor(parent: Component) {
    super(parent)
    this.data = {
      keys: Array<NoteKey>(),
      length: 16,
      instrumentKey: 1,
      channel: 1
    }
    this.name = "new piano roll object"
    this.op = new OutEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new PianoRollEditor(parent, this.data)
  }

  render(): [HTMLElement, HTMLElement] {
    const [newDiv, container] = super.render()
    newDiv.appendChild(
      createDivNode(n => {
        n.innerText = this.instrumentName
      })
    )
    return [newDiv, container]
  }

  sing(): Timeline {
    return new Timeline(
      this.data.length,
      [
        new ProgramChangeKey(0, this.data.instrumentKey, this.data.channel),
        ...this.data.keys.map(k => k.replace({channel: this.data.channel}))
      ]
    )
  }
}

export class PianoRollEditor extends BaseEditor {
  data: PianoRollStructure
  unitBeatLength = 48
  unitPitchHeight = 10
  beatsPerBar = 4
  snapBeatResolution = 1/4
  snapToGrid = true
  lengthPrev = 2
  player: Player = null

  constructor(parent: Component, singable: PianoRollSingable) {
    super(parent, singable)
    this.data = singable.data
    this.data.keys.forEach(k => {
      const pianoKey = new PianoRollKey(this, k)
      const snapped = this.unsnap(k.pitch, k.timing)
      pianoKey.x = snapped.x
      pianoKey.y = snapped.y
    })
  }

  render(): [HTMLElement, HTMLElement] {
    const container = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "100%"
      n.style.position = "absolute"
      n.style.left = "0px"
      n.style.top = "0px"
    })
    
    const newDiv = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "100%"
    }, [
      createDivNode(n => {
        n.style.width = "100%"
        n.style.height = "24px"
      }, [
        createButtonNode(n => {
          n.innerText = "Play"
          const stop = () => {
            if (this.player) {
              this.player.stop()
              this.player = null
              n.innerText = "Play"
            }
          }
          const play = () => {
            this.singable..sing().toFile("./temp.mid")
            this.player = new Player()
            this.player.play("temp.mid", _ => stop())
            n.innerText = "Stop"
          }
          n.onclick = e => this.player === null ? play() : stop()
        }),
        createSelectNode(n => {
          n.value = this.data.instrumentKey.toString()
          n.onchange = e => {
            this.data.instrumentKey = parseInt((e.target as HTMLOptionElement).value)
            const singable = (this.singable as PianoRollSingable)
            singable.instrumentName = instruments[this.data.instrumentKey]
            singable.update()
          }
        }, [
          ...toPairs(instruments)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([key, name]) => {
              return createOptionNode(n => {
                n.innerText = name
                n.value = key
                if (n.value === this.data.instrumentKey.toString()) {
                  n.selected = true
                }
            })
          })
        ]),
        createSelectNode(n => {
          n.value = this.data.channel.toString()
          n.onchange = e => {
            this.data.channel = parseInt((e.target as HTMLOptionElement).value)
            this.singable.update()
          }
        }, [
          ...range(16).map(i => {
            return createOptionNode(n => {
              n.value = (i + 1).toString()
              n.innerText = (i + 1).toString()
              if (n.value === this.data.channel.toString()) {
                n.selected = true
              }
            })
          })
        ]),
        createInputNode(n => {
          n.value = this.data.length.toString()
          n.onchange = e => {
            const length = parseInt((e.target as HTMLInputElement).value)
            this.data.length = length
            this.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "+"
          n.onclick = e => {
            this.unitBeatLength *= 1.5
            this.update()
          }
        }),
        createButtonNode(n => {
          n.innerText = "-"
          n.onclick = e => {
            this.unitBeatLength /= 1.5
            this.update()
          }
        })
      ]),
      createDivNode(n => {
        n.style.width = "100%"
        n.style.height = "calc(100% - 24px)"
        n.style.display = "flex"
      }, [
        createDivNode(n => {
          n.style.position = "relative"
          n.style.width = "40px"
          n.style.height = "100%"
          n.style.border = "solid 1px blue"
          n.style.overflow = "hidden"
          n.classList.add("pianoroll-pitch-notation")
        }, [
          ...range(pitchMin, pitchMax + 1).map(p => {
            return createSpanNode(n => {
              n.style.position = "absolute"
              n.style.width = "100%"
              n.style.height = `${this.unitPitchHeight}px`
              n.style.left = "0px"
              n.style.top = `${(pitchMax - p) * this.unitPitchHeight}px`
              n.style.fontSize = "8px"
              n.style.textAlign = "right"
              n.innerText = pitchNotation(p)
            })
          })
        ]),
        createDivNode(n => {
          n.style.width = "calc(100% - 40px)"
          n.style.height = "100%"
          n.style.overflow = "scroll"
          n.onscroll = e => {
            const pitchNotation = this.target.querySelector(".pianoroll-pitch-notation")
            pitchNotation.scroll(0, n.scrollTop)
          }
          n.onload = e => {
            n.scroll(0, 480)
          }
        }, [
          createDivNode(n => {
            n.style.position = "relative"
            n.style.width = `${this.unitBeatLength * this.data.length}px`
            n.style.height = `${this.unitPitchHeight * (pitchMax - pitchMin + 1)}px`
            n.style.border = "solid 1px red"
            n.onmousedown = e => {
              const overlapped = this.children.filter(c => c instanceof PianoRollKey).filter(c => checkInside(c.target, e.pageX, e.pageY)).length > 0
              if (!overlapped) {
                const snapped = this.snap(e.x - this.container.getClientRects()[0].left, e.y - this.container.getClientRects()[0].top)
                const key = new NoteKey(snapped.timing, this.lengthPrev, snapped.pitch)
                const pianoKey = new PianoRollKey(this, key)
                pianoKey.update()
                pianoKey.target.onmousedown(e)
                this.data.keys.push(key)
              }
            }
          }, [
            ...range(pitchMin, pitchMax + 1).map(p => {
              return createDivNode(n => {
                n.style.position = "absolute"
                n.style.width = "100%"
                n.style.height = `${this.unitPitchHeight}px`
                n.style.left = "0px"
                n.style.top = `${(pitchMax - p) * this.unitPitchHeight}px`
                const isBlack = (p % 12) == 1 || (p % 12) == 3 || (p % 12) == 6 || (p % 12) == 8 || (p % 12) == 10
                n.style.backgroundColor = isBlack
                  ? "lightgray"
                  : "white"
              })
            }),
            ...range(0, this.data.length).map(b => {
              return createDivNode(n => {
                n.style.position = "absolute"
                n.style.width = `${this.unitBeatLength}px`
                n.style.height = "100%"
                n.style.left = `${b * this.unitBeatLength}px`
                n.style.top = "0px"
                const isBar = ((b + 1) % this.beatsPerBar) == 0
                n.style.borderRight = isBar
                  ? "solid 1px gray"
                  : "solid 1px lightgray"
              })
            }),
            container
          ])
        ])
      ])
    ])

    return [newDiv, container]
  }

  snap(x: number, y: number): {x: number, y: number, pitch: number, timing: number} {
    const timing = this.snapToGrid
      ? Math.floor(x / this.unitBeatLength / this.snapBeatResolution) * this.snapBeatResolution
      : x / this.unitBeatLength
    const pitch = pitchMax - Math.floor(y / this.unitPitchHeight)
    return {
      x: timing * this.unitBeatLength,
      y: (pitchMax - pitch) * this.unitPitchHeight,
      pitch: pitch,
      timing: timing
    }
  }

  unsnap(pitch: number, timing: number): {x: number, y: number} {
    return {
      x: timing * this.unitBeatLength,
      y: (pitchMax - pitch) * this.unitPitchHeight
    }
  }
}

class PianoRollKey extends Draggable {
  key: NoteKey
  x: number
  y: number
  xStart: number
  yStart: number
  lengthStart: number
  dragEdge: boolean = false
  justCreated = true

  constructor(parent: Component, key: NoteKey) {
    super(parent)
    this.key = key
    this.allowTransform = false
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      const parent = (this.parent as PianoRollEditor)
      const snapped = parent.unsnap(this.key.pitch, this.key.timing)
      this.x = snapped.x
      this.y = snapped.y
      n.style.position = "absolute"
      n.style.left = `${this.x}px`
      n.style.top = `${this.y}px`
      n.style.width = `${this.key.length * parent.unitBeatLength}px`
      n.style.height = `${parent.unitPitchHeight}px`
      n.style.backgroundColor = "red"
      n.style.resize = "horizontal"
      n.oncontextmenu = e => {
        e.preventDefault()
        // TODO: smarter data sync
        parent.data.keys = parent.data.keys.filter(k => k !== this.key)
        this.destroy()
      }
      n.onmouseup = e => {
        this.justCreated = false
      }
    })
    return [newDiv, newDiv]
  }

  onDragStart(e: DragEvent) {
    const margin = 8
    const mouseX = e.x - this.target.getClientRects()[0].left
    const edgeX = this.target.getClientRects()[0].width - margin
    this.dragEdge = !this.justCreated && (mouseX > edgeX)
    this.xStart = this.x
    this.yStart = this.y
    this.lengthStart = this.key.length
  }

  onDragging(e: DragEvent) {
    const parent = (this.parent as PianoRollEditor)
    const snapped = parent.snap(this.xStart + e.deltaX, this.yStart + e.deltaY + parent.unitPitchHeight / 2)
    if (this.dragEdge) {
      const oldKey = this.key
      const newLength = Math.max(snapped.timing - this.key.timing + this.lengthStart, parent.snapBeatResolution)
      const newKey = this.key.replace({ length: newLength })
      this.key = newKey
      parent.lengthPrev = newLength
      parent.data.keys = parent.data.keys.map(k => k === oldKey ? newKey : k)
    }
    else {
      this.x = Math.max(snapped.x, 0)
      this.y = snapped.y
      const oldKey = this.key
      const newKey = this.key.replace({ pitch: snapped.pitch, timing: Math.max(snapped.timing, 0) })
      this.key = newKey
      parent.data.keys = parent.data.keys.map(k => k === oldKey ? newKey : k)
    }
    this.update()
  }
}