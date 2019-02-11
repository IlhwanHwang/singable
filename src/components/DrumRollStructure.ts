export interface DrumRollRowStructure {
  name: string
  beats: Array<boolean>
}

export default interface DrumRollStructure {
  rows: Array<DrumRollRowStructure>
  length: number
}