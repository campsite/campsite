import { NormalizerConfig } from '@/utils/normy/core/types'

export const defaultConfig: Required<NormalizerConfig> = {
  getNormalizationObjectKey: (obj) => obj.id as string | undefined,
  devLogging: false,
  structuralSharing: true
}
