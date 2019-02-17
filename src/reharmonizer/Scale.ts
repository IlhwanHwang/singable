import { Pitch, Numeral, interval } from "./index"


export interface Scale {
  tonic: Pitch,
  possibleNumerals: () => Array<Numeral>
  possibleCadences: () => Array<Numeral>
  chord: (numeral: Numeral) => Array<Pitch>
  availableTensionNotesPrimary: (numeral: Numeral) => Array<Pitch>
  availableTensionNotesSecondary: (numeral: Numeral) => Array<Pitch>
  isTransitable: (n1: Numeral, n2: Numeral) => boolean
}

export class MajorScale implements Scale {
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


export class NaturalMinorScale implements Scale {
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
    new Numeral(7, false, false),
    new Numeral(3, false, true),
    new Numeral(4, false, true),
    new Numeral(5, false, true),
    new Numeral(6, false, true),
    new Numeral(7, false, true),
  ]

  cadences = [
    new Numeral(1, false, false),
    new Numeral(5, false, false),
  ]

  indexTransitions: { [index: string]: Array<Pitch> } = {
    1: [1, 2, 3, 4, 5, 6, 7],
    2: [2, 3, 5],
    3: [1, 2, 3, 4, 6],
    4: [1, 2, 4, 5, 7],
    5: [1, 3, 5, 6],
    6: [2, 4, 5, 6, 7],
    7: [1, 3, 5, 6, 7],
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
    return this.tonic + [0, 2, 3, 5, 7, 8, 10][index - 1] + octave * 12
  }

  chord(numeral: Numeral) {
    if (numeral.secondaryDominant) {
      const base = this.tone(numeral.index) - 5
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
          case 3: return [interval("M9"), interval("M13")]
          case 4: return [interval("m9"), interval("M9"), interval("A9"), interval("m13")]
          case 5: return [interval("m9"), interval("A9"), interval("m13")]
          case 6: return [interval("M9"), interval("M13")]
          case 7: return [interval("M9"), interval("A9"), interval("M13")]
        }
      }
      else {
        switch (numeral.index) {
          case 1: return [interval("M9"), interval("P11")]
          case 2: return [interval("P11"), interval("m13")]
          case 3: return [interval("M9"), interval("M13")]
          case 4: return [interval("M9"), interval("P11"), interval("M13")]
          case 5: return [interval("m9"), interval("A9"), interval("m13")]
          case 6: return [interval("M9"), interval("A9"), interval("M13")]
          case 7: return [interval("M9"), interval("M13")]

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
          case 3: return [interval("m9"), interval("A11"), interval("m13")]
          case 4: return [interval("A11"), interval("M13")]
          case 5: return [interval("A11")]
          case 6: return [interval("m9"), interval("A11"), interval("m13")]
          case 7: return [interval("m9"), interval("A9"), interval("m13")]
        }
      }
      else {
        switch (numeral.index) {
          case 1: return [interval("M13")]
          case 2: return []
          case 3: return [interval("A11")]
          case 4: return []
          case 5: return [interval("M9"), interval("A11")]
          case 6: return []
          case 7: return []
        }
      }
    })()

    const base = this.tone(numeral.index) + (numeral.secondaryDominant ? 7 : 0)
    
    return intervals.map(i => base + i)
  }
}