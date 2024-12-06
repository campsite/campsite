import { createContext, useContext } from 'react'
import { LaunchCommand } from 'src/types'

export const CommandContext = createContext<LaunchCommand>('quick-post')

export function useCommand() {
  return useContext(CommandContext)
}
