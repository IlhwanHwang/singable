export interface DrumRollRowStructure {
  name: string
  beats: Array<boolean>
  key: number
}

export default interface DrumRollStructure {
  rows: Array<DrumRollRowStructure>
  length: number
}