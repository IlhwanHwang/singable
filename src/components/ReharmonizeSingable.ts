import Component from "./Component"
import Singable from "./Singable"
import { InEndpoint, OutEndpoint } from "./Endpoint";
import BaseEditor from "./BaseEditor";
import NoteKey, { Timeline, pitchNotation } from "../Key";
import { range, zip, flatten, sum, toPairs, fromPairs } from "lodash"
import { createDivNode, createSelectNode, createOptionNode } from "../utils/singable";
import { editorSingable } from "../renderer";
import { nvl } from "../utils";

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
    return selectScale(this.data.scale.tonic, this.data.scale.quality)
  }

  getChordNodes() {
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


class Numeral {
  index: number
  secondaryDominant: boolean
  seventh: boolean

  constructor(index: number, seventh: boolean, secondaryDominant: boolean) {
    this.index = index
    this.seventh = seventh
    this.secondaryDominant = secondaryDominant
  }
  
  notation() {
    return (this.secondaryDominant ? "v7/" : "") + ["i", "ii", "iii", "iv", "v", "vi", "vii"][this.index - 1] + (this.seventh ? "7" : "")
  }

  equals(other: Numeral) {
    return this.index === other.index && this.secondaryDominant === other.secondaryDominant && this.seventh === other.seventh
  }

  replace(n: Partial<Numeral>): Numeral {
    return new Numeral(nvl(n.index, this.index), nvl(n.seventh, this.seventh), nvl(n.secondaryDominant, this.secondaryDominant))
  }
}

type Pitch = number

interface Scale {
  tonic: Pitch,
  possibleNumerals: () => Array<Numeral>
  possibleCadences: () => Array<Numeral>
  chord: (numeral: Numeral) => Array<Pitch>
  availableTensionNotesPrimary: (numeral: Numeral) => Array<Pitch>
  availableTensionNotesSecondary: (numeral: Numeral) => Array<Pitch>
  isTransitable: (n1: Numeral, n2: Numeral) => boolean
}


function interval(notation: string) {
  const quality = notation[0]
  const indexRaw = parseInt(notation.slice(1, notation.length))
  const octave = Math.floor((indexRaw - 1) / 7)
  const index = indexRaw - octave * 7
  const semitones = (index == 1 || index == 4 || index == 5)
    ? ['dd', 'd', 'P', 'A', 'AA'].indexOf(quality) - 2
    : ['dd', 'd', 'm', 'M', 'A', 'AA'].indexOf(quality) - 3
  const pitch = [0, 2, 4, 5, 7, 9, 11][index - 1]
  return pitch + semitones + octave * 12
} 


function selectScale(tonic: number, quality: string) {
  if (quality === "major") {
    return new MajorScale(tonic)
  }
  else {
    return null
  }
}


class MajorScale implements Scale {
  tonic: Pitch

  constructor(tonic: Pitch) {
    this.tonic = tonic
  }

  numerals = [
    new Numeral(1, false, false),
    new Numeral(2, false, false),
    new Numeral(3, false, false),
    new Numeral(4, false, false),
    new Numeral(5, false, false),
    new Numeral(6, false, false),
    new Numeral(2, false, true),
    new Numeral(3, false, true),
    new Numeral(4, false, true),
    new Numeral(5, false, true),
    new Numeral(6, false, true),
  ]

  cadences = [
    new Numeral(1, false, false),
    new Numeral(5, false, false),
  ]

  indexTransitions: { [index: string]: Array<Pitch> } = {
    1: [1, 2, 3, 4, 5, 6],
    2: [2, 3, 5],
    3: [2, 3, 4, 5],
    4: [1, 2, 3, 4, 5],
    5: [1, 3, 5, 6],
    6: [2, 3, 4, 6],
  }

  possibleNumerals() { return this.numerals }

  possibleCadences() { return this.cadences }

  isTransitable(n1: Numeral, n2: Numeral) {
    if (n1.secondaryDominant) {
      return n1.index === n2.index
    }
    else {
      return this.indexTransitions[n1.index.toString()]
        .some(i => i === n2.index)
    }
  }

  tone(indexRaw: number) {
    const octave = Math.floor((indexRaw - 1) / 7)
    const index = indexRaw - octave * 7
    return this.tonic + [0, 2, 4, 5, 7, 9, 11][index - 1] + octave * 12
  }

  chord(numeral: Numeral) {
    if (numeral.secondaryDominant) {
      const base = this.tone(numeral.index) + 7
      return numeral.seventh
        ? [base, base + 4, base + 7, base + 11]
        : [base, base + 4, base + 7]
    }
    else {
      return numeral.seventh
        ? [this.tone(numeral.index), this.tone(numeral.index + 2), this.tone(numeral.index + 4), this.tone(numeral.index + 6)]
        : [this.tone(numeral.index), this.tone(numeral.index + 2), this.tone(numeral.index + 4)]
    }
  }

  availableTensionNotesPrimary(numeral: Numeral) {
    const intervals = (() => {
      if (numeral.secondaryDominant) {
        switch (numeral.index) {
          case 2: return [interval("m9"), interval("M9"), interval("A9"), interval("m13")]
          case 3: return [interval("m9"), interval("A9"), interval("m13")]
          case 4: return [interval("M9"), interval("M13")]
          case 5: return [interval("M9"), interval("M13")]
          case 6: return [interval("m9"), interval("A9"), interval("m13")]
        }
      }
      else {
        switch (numeral.index) {
          case 1: return [interval("M9"), interval("M13")]
          case 2: return [interval("M9"), interval("P11")]
          case 3: return [interval("P11")]
          case 4: return [interval("M9"), interval("A11"), interval("M13")]
          case 5: return [interval("M9"), interval("M13")]
          case 6: return [interval("M9"), interval("P11")]
          case 7: return [interval("P11"), interval("m13")]
        }
      }
    })()

    const base = this.tone(numeral.index) + (numeral.secondaryDominant ? 7 : 0)

    return intervals.map(i => base + i)
  }

  availableTensionNotesSecondary(numeral: Numeral) {
    const intervals = (() => {
      if (numeral.secondaryDominant) {
        switch (numeral.index) {
          case 2: return [interval("A11"), interval("M13")]
          case 3: return [interval("A11")]
          case 4: return [interval("m9"), interval("A9"), interval("A11"), interval("m13")]
          case 5: return [interval("m9"), interval("A9"), interval("A11"), interval("m13")]
          case 6: return [interval("M9"), interval("A11")]
        }
      }
      else {
        switch (numeral.index) {
          case 1: return [interval("A11")]
          case 2: return []
          case 3: return [interval("M9")]
          case 4: return []
          case 5: return [interval("m9"), interval("A9"), interval("A11"), interval("m13")]
          case 6: return [interval("M13")]
          case 7: return []

        }
      }
    })()

    const base = this.tone(numeral.index) + (numeral.secondaryDominant ? 7 : 0)
    
    return intervals.map(i => base + i)
  }
}


class ChordNode {
  value: number
  timing: number
  length: number
  numeral: Numeral
  prevs: Array<ChordNode> = Array()
  target: ChordNode = null
  totalValue: number = null

  constructor(numeral: Numeral, value: number, timing: number, length: number) {
    this.numeral = numeral
    this.value = value
    this.timing = timing
    this.length = length
  }

  actualValue(lengthAdvantage: number = 1.1) {
    return Math.pow(this.length, lengthAdvantage) * this.value
  }
}


class ChordDag {
  nodes: Array<ChordNode> = Array()

  constructor(nodes: Array<ChordNode>) {
    this.nodes = nodes
  }

  buildEdge(scale: Scale) {
    const nodesAtEnding: { [index: number]: Array<ChordNode> } = {}
    
    this.nodes.forEach(n => {
      const end = n.timing + n.length
      if (nodesAtEnding[end] === undefined) {
        nodesAtEnding[end] = Array()
      }
      nodesAtEnding[end].push(n)
    })

    this.nodes.forEach(n => {
      const leaders = nodesAtEnding[n.timing]
      if (leaders !== undefined) {
        n.prevs = leaders.filter(m => scale.isTransitable(m.numeral, n.numeral))
      }
    })
  }

  solve(scale: Scale) {
    this.buildEdge(scale)
    
    this.nodes
      .sort((n1, n2) => n1.timing - n2.timing)
      .forEach(n => {
        if (n.prevs.length > 0) {
          const maxLeader = n.prevs.reduce((acc, n) => n.totalValue > acc.totalValue ? n : acc)
          n.totalValue = maxLeader.totalValue + n.actualValue()
          n.target = maxLeader
        }
        else {
          n.totalValue = n.actualValue()
        }
      })
    
    const endMax = Math.max(...this.nodes.map(n => n.timing + n.length))
    const endNode = this.nodes
      .filter(n => n.timing + n.length === endMax)
      .reduce((acc, n) => n.totalValue > acc.totalValue ? n : acc)
    
    const result = Array<ChordNode>()
    let node = endNode
    while (node !== null) {
      result.unshift(node)
      node = node.target
    }

    return result
  }
}


function getMelodyWeight(melody: Array<NoteKey>) {
  return melody.map(k => {
    return k.length
  })
}


interface ScoreMelodyOption {
  scoreFundamental: number
  scoreConsonance: number
  scorePrimary: number
  scoreSecondary: number
  scoreDissonance: number
}


function scoreMelody(scale: Scale, melody: Array<NoteKey>, numeral: Numeral, weight: Array<number>, options: Partial<ScoreMelodyOption> = {}) {
  if (melody.length === 0) {
    return 0
  }
  
  options = {
    scoreFundamental: 1,
    scoreConsonance: 0.5,
    scorePrimary: 0.25,
    scoreSecondary: 0.125,
    scoreDissonance: -1,
    ...options
  }

  const base = scale.chord(numeral.replace({ seventh: true }))
  const primary = scale.availableTensionNotesPrimary(numeral)
  const secondary = scale.availableTensionNotesSecondary(numeral)
  const checkPitch = (p: number, arr: Array<number>) => arr.some(q => (p - q) % 12 === 0)

  const scores = melody
    .map(k => {
      if (checkPitch(k.pitch, base.slice(0, 2))) {
        return options["scoreFundamental"]
      }
      else if (checkPitch(k.pitch, base.slice(2, 4))) {
        return options["scoreConsonance"]
      }
      else if (checkPitch(k.pitch, primary)) {
        return options["scorePrimary"]
      }
      else if (checkPitch(k.pitch, secondary)) {
        return options["scoreSecondary"]
      }
      else {
        return options["scoreDissonance"]
      }
    })
  
  const score = sum(zip(scores, weight).map(([s, w]) => s * w)) / sum(weight)
  return score
}

function songToChordNodes(timeline: Timeline, scale: Scale, restrictions: { [index: number]: Numeral }, granularity: Array<number>, options: any = {}) {
  options = {
    cadenceAt: 16,
    cadenceScore: 1,
    advantages: (n: Numeral) => {
      return n.secondaryDominant
        ? -0.2
        : (
          n.index === 1 || n.index === 4 || n.index === 5
            ? 0.2
            : -0.2
          )
    },
    ...options
  }
  const numerals = scale.possibleNumerals()
  const cadences = scale.possibleCadences()
  const nodes = granularity.map(g => { 
    return range(0, timeline.length, g).map(timing => {
      if (restrictions[timing]) {
        const numeral = restrictions[timing]
        return [new ChordNode(numeral, 0, timing, g)]
      }
      else {
        const melody = timeline
          .slice(timing, g)
          .keys
          .filter(k => k instanceof NoteKey)
          .map(k => k as NoteKey)
        const weight = getMelodyWeight(melody)
        const isCadence = (timing + g) % options.cadenceAt === 0
        const scores = numerals.map(n => scoreMelody(scale, melody, n, weight) + options.advantages(n))
        if (isCadence) {
          return zip(numerals, scores)
            .map(([n, s]) => [n, s + (cadences.some(m => m.equals(n)) ? 0 : -options.cadenceScore)] as [Numeral, number])
            .map(([n, s]) => new ChordNode(n, s, timing, g))
        }
        else {
          return zip(numerals, scores)
            .map(([n, s]) => new ChordNode(n, s, timing, g))
        }
      }
    })
  })

  return new ChordDag(flatten(flatten(nodes))).solve(scale)
}

