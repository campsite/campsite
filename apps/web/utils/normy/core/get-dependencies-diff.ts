export const getDependenciesDiff = (
  oldDependencies: ReadonlyArray<string>,
  newDependencies: ReadonlyArray<string>
) => ({
  addedDependencies: newDependencies.filter((newDependency) => !oldDependencies.includes(newDependency)),
  removedDependencies: oldDependencies.filter((oldDependency) => !newDependencies.includes(oldDependency))
})
