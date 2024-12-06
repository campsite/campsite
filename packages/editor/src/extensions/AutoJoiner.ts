import { Extension, getNodeType } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { autoJoin } from '../utils/autoJoin'

type AutoJoinerOptions = {
  nodeTypes: string[]
}

export const AutoJoiner = Extension.create<AutoJoinerOptions>({
  name: 'autoJoiner',

  addOptions() {
    return {
      nodeTypes: []
    }
  },

  addProseMirrorPlugins() {
    const nodeTypes = this.options.nodeTypes.map((type) => {
      return getNodeType(type, this.editor.schema)
    })

    return [
      new Plugin({
        key: new PluginKey('listItemAutoJoiner'),
        appendTransaction(transactions, _, newState) {
          const newTr = newState.tr
          let joined = false

          for (const transaction of transactions) {
            const anotherJoin = autoJoin({ prevTr: transaction, nextTr: newTr, nodeTypes })

            joined = anotherJoin || joined
          }
          if (joined) {
            return newTr
          }
        }
      })
    ]
  }
})
