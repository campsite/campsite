import React, { useCallback, useMemo, useRef, useState } from 'react'
import { defaultRangeExtractor, Range, useVirtualizer } from '@tanstack/react-virtual'
import deepEqual from 'fast-deep-equal'
import Image from 'next/image'

import { SyncCustomReaction } from '@campsite/types'
import { cn, TextField } from '@campsite/ui'

import { useAddFrequentlyUsedReaction, useFrequentlyUsedReactions } from '@/hooks/reactions/useFrequentlyUsedReactions'
import { useReactionsData } from '@/hooks/reactions/useReactionsData'
import { useSearchReactions } from '@/hooks/reactions/useSearchReactions'
import { notEmpty } from '@/utils/notEmpty'
import { formatReactionData, isStandardReaction, StandardReaction } from '@/utils/reactions'
import { ALL_REACTION_CATEGORIES, getReactionCategoryLabel } from '@/utils/reactions/data'

const COLUMNS = 9
const HEADER_HEIGHT = 36
const REACTION_SIZE = 34
const START_POSITION = { row: 0, column: 0 }
const SEARCH_POSITION = { row: 1, column: 0 } // select the first reaction in the search results

type RowType =
  | {
      type: 'header'
      size: number
      id: string
    }
  | {
      type: 'reactions'
      size: number
      reactions: (StandardReaction | SyncCustomReaction)[]
    }

function isReactionRow(
  row: RowType
): row is { type: 'reactions'; size: number; reactions: (StandardReaction | SyncCustomReaction)[] } {
  return row.type === 'reactions'
}

function isLeftMove(e: React.KeyboardEvent) {
  return e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey) || (e.ctrlKey && e.key === 'h')
}
function isRightMove(e: React.KeyboardEvent) {
  return e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey) || (e.ctrlKey && e.key === 'l')
}
function isUpMove(e: React.KeyboardEvent) {
  return e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'k')
}
function isDownMove(e: React.KeyboardEvent) {
  return e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')
}

interface DesktopReactionPickerProps {
  showCustomReactions?: boolean
  onReactionSelect: (reaction: StandardReaction | SyncCustomReaction) => void
}

export function DesktopReactionPicker({ showCustomReactions, onReactionSelect }: DesktopReactionPickerProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const activeStickyRowIndexRef = useRef<number>(0)
  const reactionsData = useReactionsData()
  const { addReactionIdToFrequents } = useAddFrequentlyUsedReaction()
  const { frequentlyUsedReactions } = useFrequentlyUsedReactions({ hideCustomReactions: !showCustomReactions })
  const activePositionRef = useRef(START_POSITION)
  const { reactionSearchResults } = useSearchReactions(query, {
    maxResults: 90,
    hideCustomReactions: !showCustomReactions
  })

  const handleReactionSelect = (reaction: Parameters<DesktopReactionPickerProps['onReactionSelect']>[number]) => {
    addReactionIdToFrequents({ id: reaction.id })
    onReactionSelect(reaction)
  }

  const { rows, stickyRowIndexes } = useMemo(() => {
    const categories = ALL_REACTION_CATEGORIES.map((categoryId) => {
      // Don't show custom reactions if they are disabled
      if (!showCustomReactions && categoryId === 'custom') return
      // If we are searching, only show the `search` category
      if (query) return categoryId === 'frequent' ? { id: 'search', reactions: reactionSearchResults } : undefined
      if (categoryId === 'frequent') return { id: 'frequent', reactions: frequentlyUsedReactions }

      const reactions = reactionsData?.categories
        .find((category) => category.id === categoryId)
        ?.reactionIds?.map<StandardReaction | SyncCustomReaction | undefined>((reactionId) => {
          const reactionData = reactionsData?.reactions[reactionId]

          if (!reactionData) return undefined
          return formatReactionData(reactionData)
        })
        .filter(notEmpty)

      if (!reactions) return

      return { id: categoryId, reactions }
    })
      .filter(notEmpty)
      .filter(({ id, reactions }) => id === 'search' || reactions.length > 0)

    const rows = categories.reduce<RowType[]>((acc, { id, reactions }) => {
      acc.push({ type: 'header', id, size: HEADER_HEIGHT })
      for (let i = 0; i < reactions.length; i += COLUMNS) {
        acc.push({ type: 'reactions', reactions: reactions.slice(i, i + COLUMNS), size: REACTION_SIZE })
      }

      return acc
    }, [])

    const stickyRowIndexes = rows.reduce<number[]>((acc, row, i) => {
      if (row.type === 'header') acc.push(i)
      return acc
    }, [])

    return { categories, rows, stickyRowIndexes }
  }, [
    query,
    reactionSearchResults,
    frequentlyUsedReactions,
    showCustomReactions,
    reactionsData?.categories,
    reactionsData?.reactions
  ])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: (i) => rows[i].size,
    scrollPaddingStart: 6,
    scrollPaddingEnd: 6,
    paddingEnd: 10,
    overscan: 8,
    // @see https://tanstack.com/virtual/latest/docs/framework/react/examples/sticky
    rangeExtractor: useCallback(
      (range: Range) => {
        const activeStickyRowIndex = [...stickyRowIndexes].reverse().find((index) => range.startIndex >= index)

        if (!activeStickyRowIndex) return defaultRangeExtractor(range)

        activeStickyRowIndexRef.current = activeStickyRowIndex
        const next = new Set([activeStickyRowIndexRef.current, ...defaultRangeExtractor(range)])

        return Array.from(next).sort((a, b) => a - b)
      },
      [stickyRowIndexes]
    )
  })

  /**
   * Instead of using `useState` and trashing ui state by triggering re-renders,
   * we can simply use a ref that holds the state and the mutate the DOM directly.
   */
  const setActivePosition = ({ row, column }: { row: number; column: number }) => {
    const element = scrollAreaRef.current

    if (!element) return

    element.style.removeProperty(
      `--active-position-${activePositionRef.current.row}-${activePositionRef.current.column}`
    )
    element.style.setProperty(`--active-position-${row}-${column}`, 'var(--bg-quaternary)')
    activePositionRef.current = { row, column }
    virtualizer.scrollToIndex(row)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()

      const row = rows[activePositionRef.current.row]

      if (row.type === 'header') return

      handleReactionSelect(row.reactions[activePositionRef.current.column])
      return
    }

    const currentPosition = activePositionRef.current
    const inputSelectionStart = inputRef.current?.selectionStart ?? 0

    /**
     * noop if no moves were recognized
     */
    if (!isUpMove(e) && !isDownMove(e) && !isLeftMove(e) && !isRightMove(e)) return
    /**
     * If we are at start position, allow left/right moves that are
     * contained within the input selection.
     */
    if (deepEqual(currentPosition, START_POSITION) && isLeftMove(e)) return
    if (deepEqual(currentPosition, START_POSITION) && isRightMove(e) && inputSelectionStart !== query.length) return

    e.preventDefault()

    function handleArrowUp({ column }: { column: number }) {
      if (currentPosition.row === 0) return

      if (currentPosition.row === 1) {
        setActivePosition(START_POSITION)
        return
      }

      const nextRowIndex =
        rows[currentPosition.row - 1]?.type === 'header' ? currentPosition.row - 2 : currentPosition.row - 1
      const nextRow = rows[nextRowIndex]

      if (!nextRow) return

      const maxColumns = isReactionRow(nextRow) ? nextRow.reactions.length - 1 : 0

      setActivePosition({ row: nextRowIndex, column: Math.min(column, maxColumns) })
    }

    function handleArrowDown({ column }: { column: number }) {
      if (currentPosition.row === rows.length - 1) return

      const nextRowIndex =
        rows[currentPosition.row + 1]?.type === 'header' ? currentPosition.row + 2 : currentPosition.row + 1
      const nextRow = rows[nextRowIndex]

      if (!nextRow) return

      const maxColumns = isReactionRow(nextRow) ? nextRow.reactions.length - 1 : 0

      setActivePosition({ row: nextRowIndex, column: Math.min(column, maxColumns) })
    }

    if (isUpMove(e)) {
      handleArrowUp({ column: currentPosition.column })
    } else if (isDownMove(e)) {
      handleArrowDown({ column: currentPosition.column })
    } else if (isLeftMove(e)) {
      if (currentPosition.column === 0) {
        handleArrowUp({ column: COLUMNS - 1 })
      } else {
        setActivePosition({ row: currentPosition.row, column: currentPosition.column - 1 })
      }
    } else if (isRightMove(e)) {
      const currentRow = rows[currentPosition.row]

      if (deepEqual(currentPosition, START_POSITION)) {
        handleArrowDown({ column: 0 })
      } else if (currentPosition.column === COLUMNS - 1) {
        handleArrowDown({ column: 0 })
      } else if (isReactionRow(currentRow) && currentRow.reactions.length <= currentPosition.column + 1) {
        handleArrowDown({ column: 0 })
      } else {
        setActivePosition({ row: currentPosition.row, column: currentPosition.column + 1 })
      }
    }
  }

  return (
    <div className='relative isolate flex h-full flex-col overflow-hidden focus:outline-0'>
      <div className='bg-elevated z-20 px-2 pt-2'>
        <TextField
          ref={inputRef}
          value={query}
          onChange={(value) => {
            setQuery(value)
            if (value.trim()) setActivePosition(SEARCH_POSITION)
            else setActivePosition(START_POSITION)
          }}
          placeholder='Search'
          additionalClasses='bg-quaternary h-8 focus:bg-primary border-transparent rounded px-2'
          onKeyDown={handleKeyDown}
        />
      </div>

      <div ref={scrollAreaRef} className='scrollbar-hide flex-1 overflow-y-scroll px-2 focus:outline-0'>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: `${COLUMNS * REACTION_SIZE}px`,
            position: 'relative'
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const rowData = rows[virtualRow.index]

            if (rowData.type === 'header') {
              return (
                <h2
                  key={virtualRow.index}
                  className='bg-elevated text-secondary z-10 w-full whitespace-nowrap px-1.5 pb-1 pt-4 text-xs font-medium'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`
                  }}
                >
                  {getReactionCategoryLabel(rowData.id)}
                </h2>
              )
            }

            if (rowData.type === 'reactions') {
              return (
                <div
                  key={virtualRow.index}
                  className='grid w-full grid-flow-col grid-rows-1 place-content-start items-center'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  {rowData.reactions.map((reaction, columnIndex) => (
                    <button
                      title={reaction.name}
                      data-row={virtualRow.index}
                      data-column={columnIndex}
                      tabIndex={-1}
                      key={reaction.id}
                      className={cn(
                        'hover:!bg-quaternary flex aspect-square shrink-0 items-center justify-center rounded-md font-[emoji] text-xl leading-none transition-colors duration-0 ease-out'
                      )}
                      style={{
                        width: REACTION_SIZE,
                        height: REACTION_SIZE,
                        backgroundColor: `var(--active-position-${virtualRow.index}-${columnIndex})`
                      }}
                      onClick={() => handleReactionSelect(reaction)}
                    >
                      {isStandardReaction(reaction) ? (
                        <span className='mt-1'>{reaction.native}</span>
                      ) : (
                        <Image
                          className='h-5 w-5 object-contain'
                          src={reaction.file_url ?? ''}
                          alt={reaction.name}
                          width={20}
                          height={20}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
