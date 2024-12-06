export function setsAreEqual<T>(setA: Set<T>, setB: Set<T>) {
  if (setA.size !== setB.size) {
    return false
  }

  const arrayA = Array.from(setA)
  const arrayB = Array.from(setB)

  return arrayA.every((value, index) => value === arrayB[index])
}
