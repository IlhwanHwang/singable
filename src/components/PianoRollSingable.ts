import Singable from "./Singable"
import Component from "./Component";
import { OutEndpoint, InEndpoint } from "./Endpoint";
import NoteKey, {Timeline, pitchMax, pitchMin, pitchNotation, ProgramChangeKey} from "../Key"
import { range, toPairs, zip, flatten } from "lodash"
import { createDivNode, createSpanNode, createButtonNode, createSelectNode, createOptionNode, createInputNode } from "../utils/singable";
import Draggable from "./Draggable";
import { checkInside } from "../utils";
import { instruments } from "../keys";
import Player from "../utils/Player"
import BaseEditor from "./BaseEditor";

export interface PianoRollStructure {
  keys: Array<NoteKey>
  length: number
  incompletes: number
  instrumentKey: number
  channel: number
  screen: Array<{ timing: number, length: number }>
}

export default class PianoRollSingable extends Singable {
  className: string = "pianoroll"
  data: PianoRollStructure
  op: OutEndpoint
  ip: InEndpoint
  instrumentName: string = instruments["1"]
  scrollX = 0
  scrollY = 480

  constructor(parent: Component) {
    super(parent)
    this.data = {
      keys: Array<NoteKey>(),
      length: 16,
      incompletes: 0,
      instrumentKey: 1,
      channel: 1,
      screen: Array<{ timing: number, length: number }>()
    }
    this.name = "new piano roll object"
    this.op = new OutEndpoint(this)
    this.ip = new InEndpoint(this)
  }

  getEditor(parent: Component): Component {
    return new PianoRollEditor(parent, this)
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
    const inherited = this.ip.findOut()
      ? (this.ip.findOut().parent as Singable).sing().keys
      : []
    const screened = flatten(inherited.map(k => {
      if (k instanceof NoteKey) {
        const overlapping = this.data.screen.filter(s => s.timing <= k.timing && s.timing + s.length >= k.timing + k.length)
        if (overlapping[0]) {
          return []
        }
        const crossing = this.data.screen.filter(s => s.timing > k.timing && s.timing + s.length < k.end())
        const heading = this.data.screen.filter(s => s.timing <= k.timing && s.timing + s.length > k.timing)
        const tailing = this.data.screen.filter(s => s.timing < k.end() && s.timing + s.length >= k.end())
        if (crossing.length + heading.length + tailing.length === 0) {
          return [k]
        }
        else {
          console.log(k.timing, heading, tailing, crossing)
          crossing.unshift({ timing: 0, length: heading[0] ? heading[0].timing + heading[0].length : k.end() })
          crossing.push({ timing: tailing[0] ? tailing[0].timing : k.timing + k.length, length: 0 })
          console.log(k.timing, crossing)
          return zip(crossing.slice(0, crossing.length - 1), crossing.slice(1, crossing.length))
            .map(([a, b]) => {
              const timing = a.timing + a.length
              const end = b.timing
              return k.replace({ timing: timing, length: end - timing })
            })
            .filter(t => t.length > 0)
        }
      }
      else {
        return [k]
      }
    }))
    return new Timeline(
      this.data.length,
      [
        new ProgramChangeKey(0, this.data.instrumentKey, this.data.channel),
        ...this.data.keys.map(k => k.replace({channel: this.data.channel})),
        ...screened
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
  timing = 0
  timingDragging = false
  timingTracker: number = null
  bpm = 120

  constructor(parent: Component, singable: PianoRollSingable) {
    super(parent, singable)
    this.data = singable.data
    if (singable.ip.findOut()) {
      const song = (singable.ip.findOut().parent as Singable).sing()
      song.keys.forEach(k => {
        if (k instanceof NoteKey) {
          const pianoKey = new ShadowKey(this, k)
          const snapped = this.unsnap(k.pitch, k.timing)
          pianoKey.x = snapped.x
          pianoKey.y = snapped.y
        }
      })
    }
    this.data.keys.forEach(k => {
      const pianoKey = new PianoRollKey(this, k)
      const snapped = this.unsnap(k.pitch, k.timing)
      pianoKey.x = snapped.x
      pianoKey.y = snapped.y
    })
  }

  addScreen(timing: number, length: number) {
    const end = timing + length
    const mergeFront = this.data.screen.filter(s => timing > s.timing && timing <= s.timing + s.length)
    const mergeEnd = this.data.screen.filter(s => end >= s.timing && end < s.timing + s.length)
    const unmerged = this.data.screen.filter(s => timing > s.timing + s.length || end < s.timing)

    const mergedTiming = mergeFront.length > 0 ? mergeFront[0].timing : timing
    const mergedEnd = mergeEnd.length > 0 ? mergeEnd[0].timing + mergeEnd[0].length : end

    this.data.screen = unmerged
      .concat({ timing: mergedTiming, length: mergedEnd - mergedTiming })
      .sort((a, b) => a.timing - b.timing)
    this.update()
  }

  removeScreen(timing: number, length: number) {
    const end = timing + length
    const mergeFront = this.data.screen.filter(s => timing > s.timing && timing <= s.timing + s.length)
    const mergeEnd = this.data.screen.filter(s => end >= s.timing && end < s.timing + s.length)
    const unmerged = this.data.screen.filter(s => timing > s.timing + s.length || end < s.timing)

    this.data.screen = unmerged
    
    if (mergeFront.length > 0) {
      this.data.screen.push({
        timing: mergeFront[0].timing,
        length: timing - mergeFront[0].timing
      })
    }
    if (mergeEnd.length > 0) {
      this.data.screen.push({
        timing: end,
        length: mergeEnd[0].timing + mergeEnd[0].length - end
      })
    }
    this.update()
  }

  onAttached() {
    const singable = this.singable as PianoRollSingable
    this.target.querySelector(".pianoroll-scrollarea").scroll(singable.scrollX, singable.scrollY)
  }

  updateTimeIndicator(timing: number = null) {
    if (timing === null) { timing = this.timing }
    else { this.timing = timing }

    const handle = this.target.querySelector(".pianoroll-time-indicator-handle") as HTMLElement
    const bar = this.target.querySelector(".pianoroll-time-indicator-bar") as HTMLElement
    const snapped = this.unsnap(0, timing)

    handle.style.left = `${snapped.x - 10}px`
    bar.style.left = `${snapped.x}px`
  }

  render(): [HTMLElement, HTMLElement] {
    const container = createDivNode(n => {
      n.style.width = "100%"
      n.style.height = "100%"
      n.style.position = "absolute"
      n.style.left = "0px"
      n.style.top = "0px"
    })

    const timeIndicator = createDivNode(n => {
      n.classList.add("pianoroll-time-indicator")
      n.style.position = "absolute"
      n.style.left = "40px"
      n.style.top = "0"
      n.style.width = "calc(100% - 40px)"
      n.style.height = "20px"
      n.style.border = "solid 1px magenta"
      n.style.boxSizing = "border-box"
      n.style.overflow = "hidden"
    }, [
      createDivNode(n => {
        n.style.position = "absolute"
        n.style.left = "0"
        n.style.top = "0"
        n.style.width = `${this.unitBeatLength * (this.data.length + this.data.incompletes + 1)}px`
        n.style.height = "20px"
        const timeIndicatorUpdate = (e: MouseEvent) => {
          const rectX = n.getBoundingClientRect().left
          const mouseX = e.x - rectX
          const snapped = this.snap(mouseX, 0)
          this.updateTimeIndicator(Math.max(snapped.timing, -this.data.incompletes))
        }
        n.onmousedown = e => { this.timingDragging = true; timeIndicatorUpdate(e) }
        window.addEventListener("mousemove", e => {
          if (this.timingDragging) { timeIndicatorUpdate(e) }
        })
        window.addEventListener("mouseup", e => {
          this.timingDragging = false
        })
      }, [
        ...range(-this.data.incompletes, this.data.length).map(t => createDivNode(n => {
          const snapped = this.unsnap(0, t)
          n.innerText = `${Math.floor(t / 4)}:${t % 4}(${t})`
          n.style.position = "absolute"
          n.style.left = `${snapped.x}px`
          n.style.width = `${this.unitBeatLength}px`
          n.style.top = "0"
          n.style.height = "20px"
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
    ])
    
    const pitchIndicator = createDivNode(n => {
      n.style.position = "absolute"
      n.style.left = "0"
      n.style.top = "20px"
      n.style.width = "40px"
      n.style.height = "calc(100% - 20px)"
      n.style.border = "solid 1px blue"
      n.style.boxSizing = "border-box"
      n.style.overflow = "hidden"
      n.classList.add("pianoroll-pitch-indicator")
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
    ])

    const scrollArea = createDivNode(n => {
      n.classList.add("pianoroll-scrollarea")
      n.style.position = "absolute"
      n.style.left = "40px"
      n.style.top = "20px"
      n.style.width = "calc(100% - 40px)"
      n.style.height = "calc(100% - 20px)"
      n.style.overflow = "scroll"
      n.onscroll = e => {
        const pitchNotation = this.target.querySelector(".pianoroll-pitch-indicator")
        pitchNotation.scroll(0, n.scrollTop)
        const timeIndicator = this.target.querySelector(".pianoroll-time-indicator")
        timeIndicator.scroll(n.scrollLeft, 0)
        const singable = (this.singable as PianoRollSingable)
        singable.scrollX = n.scrollLeft
        singable.scrollY = n.scrollTop
      }
    }, [
      createDivNode(n => {
        n.style.position = "relative"
        n.style.width = `${this.unitBeatLength * (this.data.length + this.data.incompletes)}px`
        n.style.height = `${this.unitPitchHeight * (pitchMax - pitchMin + 1)}px`
        n.style.border = "solid 1px red"
        n.onmousedown = e => {
          const overlapped = this.children.filter(c => c instanceof PianoRollKey).filter(c => checkInside(c.target, e.pageX, e.pageY)).length > 0
          if (!overlapped) {
            e.preventDefault()
            const snapped = this.snap(e.x - this.container.getClientRects()[0].left, e.y - this.container.getClientRects()[0].top)
            if (e.button === 0) {
              if (e.shiftKey) {
                const selectArea = new PianoRollSelectArea(this, snapped.timing, snapped.pitch)
                selectArea.update()
                selectArea.target.onmousedown(e)
              }
              else {
                const key = new NoteKey(snapped.timing, this.lengthPrev, snapped.pitch)
                const pianoKey = new PianoRollKey(this, key)
                pianoKey.update()
                this.children
                  .filter(c => c instanceof PianoRollKey)
                  .map(c => c as PianoRollKey)
                  .forEach(pk => {
                    pk.selected = false
                    pk.update()
                  })
                pianoKey.target.onmousedown(e)
                this.data.keys.push(key)
              }
            }
            else if (e.button === 2) {
              const screen = new PianoRollScreen(this, snapped.timing, e.ctrlKey)
              screen.update()
              screen.target.onmousedown(e)
            }
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
        ...range(-this.data.incompletes, this.data.length).map(b => {
          return createDivNode(n => {
            const snapped = this.unsnap(0, b)
            n.style.position = "absolute"
            n.style.width = `${this.unitBeatLength}px`
            n.style.height = "100%"
            n.style.left = `${snapped.x}px`
            n.style.top = "0px"
            const isBar = ((b + 1) % this.beatsPerBar) == 0
            n.style.borderRight = isBar
              ? "solid 1px gray"
              : "solid 1px lightgray"
          })
        }),
        ...this.data.screen.map(s => {
          return createDivNode(n => {
            const left = this.unsnap(0, s.timing).x
            const right = this.unsnap(0, s.timing + s.length).x
            n.style.backgroundColor = "orange"
            n.style.position = "absolute"
            n.style.left = `${left}px`
            n.style.width = `${right - left}px`
            n.style.top = "0"
            n.style.height = "100%"
          })
        }),
        container,
        createDivNode(n => {
          n.classList.add("pianoroll-time-indicator-bar")
          n.style.position = "absolute"
          n.style.borderLeft = "solid 1px black"
          n.style.width = "0px"
          n.style.height = "100%"
          n.style.left = `${this.timing * this.unitBeatLength}px`
          n.style.top = "0"
        })
      ])
    ])

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
            if (this.timingTracker !== null) {
              clearInterval(this.timingTracker)
              this.timingTracker = null
            }
          }
          const play = () => {
            const timeline = this.singable.sing()
            timeline.slice(this.timing, timeline.length - this.timing).toFile("./temp.mid")
            this.player = new Player()
            this.player.play("temp.mid", _ => stop())
            const started = Date.now() / 1000
            const startedTiming = this.timing
            this.timingTracker = setInterval(() => {
              const elapsed = Date.now() / 1000 - started
              this.updateTimeIndicator(startedTiming + elapsed * (this.bpm / 60))
            })
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
          n.value = this.data.incompletes.toString()
          n.onchange = e => {
            const incompletes = parseInt((e.target as HTMLInputElement).value)
            this.data.incompletes = incompletes
            this.update()
          }
        }),
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
        n.style.position = "relative"
        // n.style.display = ""
      }, [
        createDivNode(n => {
          n.style.position = "absolute"
          n.style.left = "0"
          n.style.top = "0"
          n.style.width = "40px"
          n.style.height = "20px"
          n.style.border = "solid 1px magenta"
          n.style.boxSizing = "border-box"
        }),
        timeIndicator,
        pitchIndicator,
        scrollArea
      ])
    ])

    return [newDiv, container]
  }

  snap(x: number, y: number): {x: number, y: number, pitch: number, timing: number} {
    const timing = this.snapToGrid
      ? Math.round(x / this.unitBeatLength / this.snapBeatResolution) * this.snapBeatResolution - this.data.incompletes
      : x / this.unitBeatLength - this.data.incompletes
    const pitch = pitchMax - Math.floor(y / this.unitPitchHeight)
    return {
      x: (timing + this.data.incompletes) * this.unitBeatLength,
      y: (pitchMax - pitch) * this.unitPitchHeight,
      pitch: pitch,
      timing: timing
    }
  }

  unsnap(pitch: number, timing: number): {x: number, y: number} {
    return {
      x: (timing + this.data.incompletes) * this.unitBeatLength,
      y: (pitchMax - pitch) * this.unitPitchHeight
    }
  }
}


class PianoRollSelectArea extends Draggable {
  timing: number
  length: number = 0
  pitch1: number
  pitch2: number
  editorParent: PianoRollEditor

  constructor(parent: Component, timing: number, pitch: number) {
    super(parent)
    this.editorParent = parent as PianoRollEditor
    this.timing = timing
    this.pitch1 = pitch
    this.allowTransform = false
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      const pitch1 = Math.min(this.pitch1, this.pitch2)
      const pitch2 = Math.max(this.pitch1, this.pitch2)
      const snapped1 = this.editorParent.unsnap(pitch1 - 1, this.timing)
      const snapped2 = this.editorParent.unsnap(pitch2, this.timing + this.length)
      const x1 = snapped1.x
      const y1 = snapped2.y
      const x2 = snapped2.x
      const y2 = snapped1.y
      const startX = Math.min(x1, x2)
      const width = Math.abs(x1 - x2)
      n.style.position = "absolute"
      n.style.left = `${startX}px`
      n.style.width = `${width}px`
      n.style.top = `${y1}px`
      n.style.height = `${y2 - y1}px`
      n.style.border = "solid 2px blue"
      n.style.boxSizing = "border-box"
    })

    return [newDiv, newDiv]
  }

  onDragging(e: MouseEvent) {
    super.onDragging(e)
    const { x, y } = this.editorParent.unsnap(this.pitch1, this.timing)
    const { timing, pitch } = this.editorParent.snap(x + this.__deltaX, y + this.__deltaY)
    this.length = timing - this.timing
    this.pitch2 = pitch
    this.update()
  }

  onDragStop(e: MouseEvent) {
    super.onDragStop(e)
    const timing = Math.min(this.timing, this.timing + this.length)
    const length = Math.abs(this.length)
    const end = timing + length
    const pitch1 = Math.min(this.pitch1, this.pitch2)
    const pitch2 = Math.max(this.pitch1, this.pitch2)
    this.editorParent.children
      .filter(c => c instanceof PianoRollKey)
      .map(c => c as PianoRollKey)
      .filter(pk => !(
        pk.key.end() <= timing || 
        pk.key.timing >= end || 
        pk.key.pitch < pitch1 ||
        pk.key.pitch > pitch2)
      )
      .forEach(pk => {
        pk.selected = true
        pk.update()
      })
    this.destroy()
  }
}


class PianoRollScreen extends Draggable {
  timing: number
  length: number = 0
  editorParent: PianoRollEditor
  remove: boolean

  constructor(parent: Component, timing: number, remove: boolean) {
    super(parent)
    this.editorParent = parent as PianoRollEditor
    this.timing = timing
    this.allowTransform = false
    this.remove = remove
  }

  render(): [HTMLElement, HTMLElement] {
    const newDiv = createDivNode(n => {
      const x1 = this.editorParent.unsnap(0, this.timing).x
      const x2 = this.editorParent.unsnap(0, this.timing + this.length).x
      const startX = Math.min(x1, x2)
      const width = Math.abs(x1 - x2)
      n.style.position = "absolute"
      n.style.left = `${startX}px`
      n.style.width = `${width}px`
      n.style.top = "0"
      n.style.height = "100%"
      n.style.backgroundColor = this.remove ? "pink" : "yellow"
    })

    return [newDiv, newDiv]
  }

  onDragging(e: MouseEvent) {
    super.onDragging(e)
    const { x } = this.editorParent.unsnap(0, this.timing)
    const { timing } = this.editorParent.snap(x + this.__deltaX, 0)
    this.length = timing - this.timing
    this.update()
  }

  onDragStop(e: MouseEvent) {
    super.onDragStop(e)
    const timing = Math.min(this.timing, this.timing + this.length)
    const length = Math.abs(this.length)
    if (this.remove) {
      this.editorParent.removeScreen(timing, length)
    }
    else {
      this.editorParent.addScreen(timing, length)
    }
    this.destroy()
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
  selected = false
  selectionPivot = true

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
      n.style.backgroundColor = this.selected ? "orange" : "red"
      n.style.resize = "horizontal"
      n.style.border = "solid 1px black"
      n.style.boxSizing = "border-box"
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

  onDragStart(e: MouseEvent) {
    super.onDragStart(e)

    if (e.shiftKey) {
      this.selected = !this.selected
    }
    else {
      const margin = 8
      const mouseX = e.x - this.target.getClientRects()[0].left
      const edgeX = this.target.getClientRects()[0].width - margin
      this.dragEdge = !this.justCreated && (mouseX > edgeX)
      this.xStart = this.x
      this.yStart = this.y
      this.lengthStart = this.key.length
      if (this.selectionPivot) {
        const parent = this.parent as PianoRollEditor
        parent.children
          .filter(c => c instanceof PianoRollKey)
          .map(c => c as PianoRollKey)
          .filter(pk => pk.selected)
          .forEach(pk => {
            pk.selectionPivot = false
            pk.target.onmousedown(e)
            pk.dragEdge = this.dragEdge
            pk.selectionPivot = true
          })
      }
    }
  }

  onDragging(e: MouseEvent) {
    super.onDragging(e)
    const parent = (this.parent as PianoRollEditor)
    const snapped = parent.snap(this.xStart + this.__deltaX, this.yStart + this.__deltaY + parent.unitPitchHeight / 2)
    if (this.dragEdge) {
      const oldKey = this.key
      const newLength = Math.max(snapped.timing - this.key.timing + this.lengthStart, parent.snapBeatResolution)
      const newKey = this.key.replace({ length: newLength })
      this.key = newKey
      parent.lengthPrev = newLength
      parent.data.keys = parent.data.keys.map(k => k === oldKey ? newKey : k)
    }
    else {
      // this.x = Math.max(snapped.x, 0)
      // this.y = snapped.y
      const oldKey = this.key
      const newKey = this.key.replace({ pitch: snapped.pitch, timing: Math.max(snapped.timing, -parent.data.incompletes) })
      this.key = newKey
      parent.data.keys = parent.data.keys.map(k => k === oldKey ? newKey : k)
    }
    this.update()
  }
}

class ShadowKey extends PianoRollKey {
  suppress = false

  render(): [HTMLElement, HTMLElement] {
    const [target, container] = super.render()
    target.style.backgroundColor = this.suppress ? "cyan" : "blue"
    target.oncontextmenu = e => {
      // const parent = (this.parent as PianoRollEditor)
      // parent.data.keys = parent.data.push()
      // this.suppress = !this.suppress
    }
    return [target, container]
  }

  onDragStart(e: MouseEvent) {
  }

  onDragging(e: MouseEvent) {
  }
}