export interface DrumRollRowStructure {
  name: string
  cells: Array<boolean>
  cellsPerBeat: number,
  key: number
}

export default interface DrumRollStructure {
  rows: Array<DrumRollRowStructure>
  length: number
  cellsPerBeat: number
}