import { TaskList as TiptapTaskList } from '@tiptap/extension-task-list'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const TaskList = TiptapTaskList.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ block: TaskList.name })
  },

  markdownToken: 'task_list'
}).configure({
  HTMLAttributes: {
    class: 'task-list'
  }
})
