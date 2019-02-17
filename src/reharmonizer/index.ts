import {nvl} from "../utils"
import NoteKey, { Timeline } from "../Key";
import { range, zip, flatten, sum, toPairs, fromPairs } from "lodash"
import { ChordNode, ChordDag } from "./ChordDag";
import { Scale } from "./Scale";

export type Pitch = number

export class Numeral {
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

  static parse(notation: string) {
    if (notation) {
      const [_, secondaryDominantStr, indexStr, seventhStr] = notation.match(RegExp("(v7/)?(iii|vii|vi|ii|iv|v|i)(7)?"))
      return new Numeral(
        ["i", "ii", "iii", "iv", "v", "vi", "vii"].indexOf(indexStr) + 1,
        seventhStr ? true : false,
        secondaryDominantStr ? true : false)
    }
    else {
      return null
    }
  }
}

export function interval(notation: string) {
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

export function songToChordNodes(timeline: Timeline, scale: Scale, restrictions: { [index: string]: Numeral }, granularity: Array<number>, options: any = {}) {
  options = {
    cadenceAt: 16,
    cadenceScore: 1,
    restrictionAdvantage: 256,
    advantages: (n: Numeral) => {
      return n.secondaryDominant
        ? -0.1
        : (
          n.index === 1 || n.index === 4 || n.index === 5
            ? 0.1
            : -0.1
          )
    },
    ...options
  }
  const numerals = scale.possibleNumerals()
  const cadences = scale.possibleCadences()
  const nodes = granularity.map(g => { 
    return range(0, timeline.length, g).map(timing => {
      if (g === 1 && restrictions[timing.toString()]) {
        const numeral = restrictions[timing.toString()]
        console.log(numeral)
        return [new ChordNode(numeral, options.restrictionAdvantage, timing, g)]
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

