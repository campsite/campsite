export type DataPrimitive = string | number | boolean | null | undefined | Date

export type DataPrimitiveArray = string[] | number[] | boolean[] | null[] | undefined[] | Date[]

export type DataObject = {
  // eslint-disable-next-line no-use-before-define
  [index: string]: Data
}

export type Data = DataPrimitive | DataObject | DataPrimitiveArray | DataObject[]

export type NormalizerConfig = {
  getNormalizationObjectKey?: (obj: DataObject) => string | undefined
  devLogging?: boolean
  structuralSharing?: boolean
}

export type UsedKeys = { [path: string]: ReadonlyArray<string> }

export type NormalizedData = {
  queries: {
    [queryKey: string]: {
      data: Data
      dependencies: ReadonlyArray<string>
      usedKeys: UsedKeys
    }
  }
  objects: { [objectId: string]: DataObject }
  dependentQueries: { [objectId: string]: ReadonlyArray<string> }
}
