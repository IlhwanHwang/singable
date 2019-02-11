export function fillArray<T>(arr: Array<T>, value: T) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = value
  }
  return arr
}