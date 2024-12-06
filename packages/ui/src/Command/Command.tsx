/* eslint-disable max-lines */
import * as React from 'react'
import { useId } from 'react'

import { LayeredHotkeys } from '../DismissibleLayer'
import { cn } from '../utils'
import { commandScore } from '../utils/commandScore'

export interface Children {
  children?: React.ReactNode
}
export interface DivProps extends React.ComponentPropsWithoutRef<'div'> {}

export interface LoadingProps extends Children, DivProps {
  /** Estimated progress of loading asynchronous options. */
  progress?: number
  /**
   * Accessible label for this loading progressbar. Not shown visibly.
   */
  label?: string
}

export interface EmptyProps extends Children, DivProps {}
export interface SeparatorProps extends DivProps {
  /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
  alwaysRender?: boolean
}
export interface ListProps extends Children, DivProps {
  /**
   * Accessible label for this List of suggestions. Not shown visibly.
   */
  label?: string
}
export interface ItemProps extends Children, Omit<DivProps, 'disabled' | 'onSelect' | 'value'> {
  /** Whether this item is currently disabled. */
  disabled?: boolean
  /** Event handler for when this item is selected, either via click or keyboard selection. */
  onSelect?: (value: string, event?: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  /**
   * A unique value for this item.
   * If no value is provided, it will be inferred from `children` or the rendered `textContent`. If your `textContent` changes between renders, you _must_ provide a stable, unique `value`.
   */
  value?: string
  /** Optional keywords to match against when filtering. */
  keywords?: string[]
  /** Whether this item is forcibly rendered regardless of filtering. */
  forceMount?: boolean
  /** Whether to disable onClick handling, used to call onSelect when clicked. You must provide your own click handling (e.g. with <a>). */
  disableOnClick?: boolean
  /** Optional modifier to multiply the score of this item. */
  scoreModifier?: number
}
export interface GroupProps extends Children, Omit<DivProps, 'heading' | 'value'> {
  /** Optional heading to render for this group. */
  heading?: React.ReactNode
  /** If no heading is provided, you must provide a value that is unique for this group. */
  value?: string
  /** Whether this group is forcibly rendered regardless of filtering. */
  forceMount?: boolean
}
export interface InputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'type'> {
  /**
   * Optional controlled state for the value of the search input.
   */
  value?: string
  /**
   * Event handler called when the search value changes.
   */
  onValueChange?: (search: string) => void
}
export interface CommandProps extends Children, DivProps {
  /**
   * Accessible label for this command menu. Not shown visibly.
   */
  label?: string
  /**
   * Optionally set to `false` to turn off the automatic filtering and sorting.
   * If `false`, you must conditionally render valid items based on the search query yourself.
   */
  shouldFilter?: boolean
  /**
   * Custom filter function for whether each command menu item should matches the given search query.
   * It should return a number between 0 and 1, with 1 being the best match and 0 being hidden entirely.
   * By default, uses the `command-score` library.
   */
  filter?: (value: string, search: string, keywords?: string[]) => number
  /**
   * Optional default item value when it is initially rendered.
   */
  defaultValue?: string
  /**
   * Optional controlled state of the selected command menu item.
   */
  value?: string
  /**
   * Event handler called when the selected item of the menu changes.
   */
  onValueChange?: (value: string, event?: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => void
  /**
   * Optionally set to `true` to turn on looping around when using the arrow keys.
   */
  loop?: boolean
  /**
   * Optionally set to `true` to disable selection via pointer events.
   */
  disablePointerSelection?: boolean
  /**
   * Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`.
   */
  vimBindings?: boolean
  /**
   * Set to `true` to call focus() the selected item when it changes.
   */
  focusSelection?: boolean
  /**
   * Set to `true` to disable automatically selecting the first element on render.
   */
  disableAutoSelect?: boolean
  manualInputs?: boolean
  minScore?: number
}

interface Context {
  value: (id: string, value: string, keywords: string[] | undefined, modifier: number) => void
  item: (id: string, groupId: string) => () => void
  group: (id: string) => () => void
  input: (id: string) => () => void
  filter: () => boolean
  label: string
  getDisablePointerSelection: () => boolean
  // Ids
  listId: string
  labelId: string
  inputId: string | undefined
  // Refs
  listInnerRef: React.RefObject<HTMLDivElement | null>
}
interface State {
  search: string
  value: string | undefined
  filtered: { count: number; items: Map<string, number>; groups: Set<string> }
}
interface Store {
  subscribe: (callback: () => void) => () => void
  snapshot: () => State
  setState: <K extends keyof State>(
    key: K,
    value: State[K],
    opts?: any,
    event?: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>
  ) => void
  emit: () => void
}
interface Group {
  id: string
  forceMount?: boolean
}

export interface CommandRef {
  next: () => void
  nextGroup: () => void
  prev: () => void
  prevGroup: () => void
  first: () => void
  last: () => void
  // returns true if an item was selected
  onSelect: () => boolean
  bounce: () => void
}

const GROUP_SELECTOR = `[cmdk-group=""]`
const GROUP_ITEMS_SELECTOR = `[cmdk-group-items=""]`
const GROUP_HEADING_SELECTOR = `[cmdk-group-heading=""]`
const ITEM_SELECTOR = `[cmdk-item=""]`
const VALID_ITEM_SELECTOR = `${ITEM_SELECTOR}:not([aria-disabled="true"]):not([data-render="false"])`
const SELECT_EVENT = `cmdk-item-select`
const VALUE_ATTR = `data-value`
const defaultFilter: CommandProps['filter'] = (value, search, keywords) => commandScore(value, search, keywords)

const CommandContext = React.createContext<Context | null>(null)

export const useCommand = () => React.useContext(CommandContext)

const StoreContext = React.createContext<Store>({
  // eslint-disable-next-line no-empty-function
  subscribe: () => () => {},
  snapshot: () => ({ search: '', value: undefined, filtered: { count: 0, items: new Map(), groups: new Set() } }),
  // eslint-disable-next-line no-empty-function
  setState: () => {},
  // eslint-disable-next-line no-empty-function
  emit: () => {}
})
const useStore = () => React.useContext(StoreContext)
const GroupContext = React.createContext<Group>({ id: '' })

const Command = React.forwardRef<CommandRef, CommandProps>(function Command(props, ref) {
  const state = useLazyRef<State>(() => ({
    /** Value of the search query. */
    search: '',
    /** Currently selected item value. */
    value: props.value ?? props.defaultValue ?? undefined,
    filtered: {
      /** The count of all visible items. */
      count: 0,
      /** Map from visible item id to its search score. */
      items: new Map(),
      /** Set of groups with at least one visible item. */
      groups: new Set()
    }
  }))
  const allItems = useLazyRef<Set<string>>(() => new Set()) // [...itemIds]
  const allGroups = useLazyRef<Map<string, Set<string>>>(() => new Map()) // groupId → [...itemIds]
  const ids = useLazyRef<Map<string, { value: string; keywords?: string[]; modifier?: number }>>(() => new Map()) // id → { value, keywords, modifier }
  const inputId = useLazyRef<string | undefined>(() => undefined)
  const listeners = useLazyRef<Set<() => void>>(() => new Set()) // [...rerenders]
  const {
    label,
    value,
    className,
    disablePointerSelection: _disablePointerSelection = false,
    vimBindings = true,
    focusSelection = false,
    disableAutoSelect = false,
    manualInputs = false,
    minScore = -1,
    // prevent prop spreading invalid attributes
    shouldFilter: _shouldFilter,
    filter: _filter,
    onValueChange: _onValueChange,
    ...etc
  } = props

  const propsRef = React.useRef(props)

  propsRef.current = props

  const listId = useId()
  const labelId = useId()

  const containerRef = React.useRef<HTMLDivElement>(null)
  const listInnerRef = React.useRef<HTMLDivElement>(null)

  const schedule = useScheduleLayoutEffect()

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (cb) => {
        listeners.current.add(cb)
        return () => listeners.current.delete(cb)
      },
      snapshot: () => {
        return state.current
      },
      setState: (key, value, opts, event) => {
        if (Object.is(state.current[key], value)) return
        state.current[key] = value

        if (key === 'search') {
          // Filter synchronously before emitting back to children
          filterItems()
          sort()

          schedule('select-first-item', selectFirstItem)
        } else if (key === 'value') {
          // opts is a boolean referring to whether it should NOT be scrolled into view
          if (!opts) {
            // Scroll the selected item into view
            schedule('value-change-scroll-selected-into-view', scrollSelectedIntoView)
          }
          if (propsRef.current?.value !== undefined) {
            // If controlled, just call the callback instead of updating state internally
            const newValue = (value ?? '') as string

            propsRef.current.onValueChange?.(newValue, event)
            return
          }
        }

        if (focusSelection) {
          schedule('focus-selected', focusSelected)
        }

        // Notify subscribers that state has changed
        store.emit()
      },
      emit: () => {
        listeners.current.forEach((l) => l())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const context: Context = React.useMemo(
    () => ({
      // Keep id → {value, keywords} mapping up-to-date
      value: (id, value, keywords, modifier) => {
        if (value !== ids.current.get(id)?.value) {
          ids.current.set(id, { value, keywords, modifier })
          state.current.filtered.items.set(id, score(value, keywords, modifier))
          schedule('mount-value', () => {
            sort()
            store.emit()
          })
        }
      },
      // Track item lifecycle (mount, unmount)
      item: (id, groupId) => {
        allItems.current.add(id)

        // Track this item within the group
        if (groupId) {
          if (!allGroups.current.has(groupId)) {
            allGroups.current.set(groupId, new Set([id]))
          } else {
            allGroups.current.get(groupId)?.add(id)
          }
        }

        // Batch this, multiple items can mount in one pass
        // and we should not be filtering/sorting/emitting each time
        schedule('item-register-filter-sort', () => {
          filterItems()
          sort()

          // Could be initial mount, select the first item if none already selected
          if (!state.current.value && !disableAutoSelect) {
            selectFirstItem()
          }

          store.emit()
        })

        return () => {
          ids.current.delete(id)
          allItems.current.delete(id)
          state.current.filtered.items.delete(id)
          const selectedItem = getSelectedItem()

          // Batch this, multiple items could be removed in one pass
          schedule('unmount', () => {
            filterItems()

            // The item removed have been the selected one,
            // so selection should be moved to the first
            if (selectedItem?.getAttribute('id') === id) {
              selectFirstItem()
            }

            store.emit()
          })
        }
      },
      // Track group lifecycle (mount, unmount)
      group: (id) => {
        if (!allGroups.current.has(id)) {
          allGroups.current.set(id, new Set())
        }

        return () => {
          ids.current.delete(id)
          allGroups.current.delete(id)
        }
      },
      input: (id) => {
        inputId.current = id
        store.emit()

        return () => {
          inputId.current = undefined
          store.emit()
        }
      },
      filter: () => {
        return propsRef.current.shouldFilter ?? true
      },
      label: label || props['aria-label'] || '',
      getDisablePointerSelection: () => {
        return propsRef.current.disablePointerSelection ?? false
      },
      listId,
      inputId: inputId.current,
      labelId,
      listInnerRef
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  function score(value: string, keywords: string[] | undefined, modifier: number) {
    const filter = propsRef.current?.filter ?? defaultFilter
    const result = value ? (filter?.(value, state.current.search, keywords) ?? 0) : 0
    const modifiedResult = result * modifier

    return modifiedResult > minScore ? modifiedResult : 0
  }

  /** Sorts items by score, and groups by highest item score. */
  function sort() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      return
    }

    const scores = state.current.filtered.items

    // Sort the groups
    const groups: [string, number][] = []

    state.current.filtered.groups.forEach((value) => {
      const items = allGroups.current.get(value)

      // Get the maximum score of the group's items
      let max = 0

      items?.forEach((item) => {
        const score = scores.get(item) ?? 0

        max = Math.max(score, max)
      })

      groups.push([value, max])
    })

    // Sort items within groups to bottom
    // Sort items outside of groups
    // Sort groups to bottom (pushes all non-grouped items to the top)
    const listInsertionElement = listInnerRef.current

    // Sort the items
    getValidItems()
      .sort((a, b) => {
        const valueA = a.getAttribute('id') ?? ''
        const valueB = b.getAttribute('id') ?? ''

        return (scores.get(valueB) ?? 0) - (scores.get(valueA) ?? 0)
      })
      .forEach((item) => {
        const group = item.closest(GROUP_ITEMS_SELECTOR)

        if (group) {
          // @ts-ignore
          group.appendChild(item.parentElement === group ? item : item.closest(`${GROUP_ITEMS_SELECTOR} > *`))
        } else {
          listInsertionElement?.appendChild(
            // @ts-ignore
            item.parentElement === listInsertionElement ? item : item.closest(`${GROUP_ITEMS_SELECTOR} > *`)
          )
        }
      })

    groups
      .sort((a, b) => b[1] - a[1])
      .forEach((group) => {
        const element = listInnerRef.current?.querySelector(
          `${GROUP_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(group[0])}"]`
        )

        element?.parentElement?.appendChild(element)
      })
  }

  function selectFirstItem() {
    const item = getValidItems().find((item) => item.getAttribute('aria-disabled') !== 'true')
    const value = item?.getAttribute(VALUE_ATTR)

    if (value) {
      store.setState('value', value)
      queueMicrotask(() => scrollSelectedIntoView())
    }
  }

  /** Filters the current items. */
  function filterItems() {
    if (
      !state.current.search ||
      // Explicitly false, because true | undefined is the default
      propsRef.current.shouldFilter === false
    ) {
      state.current.filtered.count = allItems.current.size
      // Do nothing, each item will know to show itself because search is empty
      return
    }

    // Reset the groups
    state.current.filtered.groups = new Set()
    let itemCount = 0

    // Check which items should be included
    for (const id of Array.from(allItems.current)) {
      const value = ids.current.get(id)?.value ?? ''
      const keywords = ids.current.get(id)?.keywords ?? []
      const modifier = ids.current.get(id)?.modifier ?? 1
      const rank = score(value, keywords, modifier)

      state.current.filtered.items.set(id, rank)
      if (rank > 0) itemCount++
    }

    // Check which groups have at least 1 item shown
    for (const [groupId, group] of Array.from(allGroups.current)) {
      for (const itemId of Array.from(group)) {
        if (state.current.filtered.items.get(itemId) ?? 0 > 0) {
          state.current.filtered.groups.add(groupId)
          break
        }
      }
    }

    state.current.filtered.count = itemCount
  }

  function scrollSelectedIntoView() {
    const item = getSelectedItem()

    if (item) {
      if (item.parentElement?.firstChild === item) {
        // First item in Group, ensure heading is in view
        item.closest(GROUP_SELECTOR)?.querySelector(GROUP_HEADING_SELECTOR)?.scrollIntoView({ block: 'nearest' })
      }

      // Ensure the item is always in view
      item.scrollIntoView({ block: 'nearest' })
    }
  }

  function focusSelected() {
    const item = getSelectedItem()

    item?.focus({ preventScroll: true })
  }

  /** Getters */

  function getSelectedItem() {
    const selector = `${ITEM_SELECTOR}[aria-selected="true"]`
    const element = listInnerRef.current?.querySelector(selector)

    return element instanceof HTMLElement ? element : null
  }

  function getValidItems() {
    return Array.from(listInnerRef.current?.querySelectorAll(VALID_ITEM_SELECTOR) || [])
  }

  /** Setters */

  function updateSelectedToIndex(index: number) {
    const items = getValidItems()
    const value = items.at(index)?.getAttribute(VALUE_ATTR)

    if (value) store.setState('value', value)
  }

  function updateSelectedByItem(change: 1 | -1) {
    const selected = getSelectedItem()
    const items = getValidItems()
    const index = items.findIndex((item) => item === selected)

    // Get item at this index
    let newValue = items[index + change]?.getAttribute(VALUE_ATTR)

    if (propsRef.current?.loop) {
      const next =
        index + change < 0
          ? items[items.length - 1]
          : index + change === items.length
            ? items[0]
            : items[index + change]

      newValue = next?.getAttribute(VALUE_ATTR)
    }

    if (newValue) store.setState('value', newValue)
  }

  function updateSelectedByGroup(change: 1 | -1) {
    const selected = getSelectedItem()
    let group = selected?.closest(GROUP_SELECTOR)
    let value: string | null | undefined

    while (group && !value) {
      group = change > 0 ? findNextSibling(group, GROUP_SELECTOR) : findPreviousSibling(group, GROUP_SELECTOR)
      value = group?.querySelector(VALID_ITEM_SELECTOR)?.getAttribute(VALUE_ATTR)
    }

    if (value) {
      store.setState('value', value)
    } else {
      updateSelectedByItem(change)
    }
  }

  const hasInput = inputId.current !== undefined
  const eventTargetIsCmdkInput = (e: KeyboardEvent) => {
    return !hasInput || (e.target as HTMLElement)?.getAttribute('cmdk-input') !== null
  }
  const last = () => updateSelectedToIndex(getValidItems().length - 1)

  const next = (e: KeyboardEvent, mod: 'none' | 'meta' | 'alt' = 'none') => {
    if (!eventTargetIsCmdkInput(e)) return

    e.preventDefault()

    if (mod === 'meta') {
      // Last item
      last()
    } else if (mod === 'alt') {
      // Next group
      updateSelectedByGroup(1)
    } else {
      // Next item
      updateSelectedByItem(1)
    }
  }

  const prev = (e: KeyboardEvent, mod: 'none' | 'meta' | 'alt' = 'none') => {
    if (!eventTargetIsCmdkInput(e)) return

    e.preventDefault()

    if (mod === 'meta') {
      // First item
      updateSelectedToIndex(0)
    } else if (mod === 'alt') {
      // Previous group
      updateSelectedByGroup(-1)
    } else {
      // Previous item
      updateSelectedByItem(-1)
    }
  }

  const hotkeyEditableOptions = { enableOnFormTags: true }

  React.useImperativeHandle(
    ref,
    () => ({
      next: () => updateSelectedByItem(1),
      nextGroup: () => updateSelectedByGroup(1),
      prev: () => updateSelectedByItem(-1),
      prevGroup: () => updateSelectedByGroup(-1),
      first: () => updateSelectedToIndex(0),
      last,
      onSelect: () => {
        const item = getSelectedItem()

        if (item) {
          const event = new Event(SELECT_EVENT)

          item.dispatchEvent(event)

          return true
        }

        return false
      },
      bounce: () => {
        if (!containerRef.current) return

        const ref = containerRef.current

        ref.style.transform = 'scale(0.99)'

        setTimeout(() => {
          ref.style.transform = ''
        }, 150)
      }
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useLayoutEffect(() => {
    schedule('initial-scroll-selected-into-view', scrollSelectedIntoView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Controlled mode `value` handling. */
  useLayoutEffect(() => {
    if (value !== undefined) {
      const v = value.trim()

      state.current.value = v
      store.emit()

      /**
       * Defer scroll execution to the next layout effect cycle. Otherwise,
       * we risk running into a race condition where the `scrollSelectedIntoView`
       * runs before the DOM is updated with the new selected item.
       *
       * @see https://github.com/campsite/campsite/pull/10272
       */
      schedule('controlled-value-change-scroll-selected-into-view', scrollSelectedIntoView)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <>
      <LayeredHotkeys
        keys={['ArrowDown']}
        options={{ repeat: true, enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => next(e, 'none')}
      />
      <LayeredHotkeys
        keys={['alt+ArrowDown']}
        options={{ repeat: true, enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => next(e, 'alt')}
      />
      <LayeredHotkeys
        keys={['mod+ArrowDown']}
        options={{ repeat: true, enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => next(e, 'meta')}
      />
      <LayeredHotkeys
        keys={['n', 'j']}
        options={{ repeat: true, enabled: !manualInputs && vimBindings }}
        callback={(e) => next(e, 'none')}
      />
      <LayeredHotkeys
        keys={['alt+n', 'alt+j']}
        options={{ repeat: true, enabled: !manualInputs && vimBindings }}
        callback={(e) => next(e, 'alt')}
      />
      <LayeredHotkeys
        keys={['ArrowUp']}
        options={{ repeat: true, enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => prev(e, 'none')}
      />
      <LayeredHotkeys
        keys={['alt+ArrowUp']}
        options={{ repeat: true, enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => prev(e, 'alt')}
      />
      <LayeredHotkeys
        keys={['mod+ArrowUp']}
        options={{ repeat: true, enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => prev(e, 'meta')}
      />
      <LayeredHotkeys
        keys={['p', 'k']}
        options={{ repeat: true, enabled: !manualInputs && vimBindings }}
        callback={(e) => prev(e, 'none')}
      />
      <LayeredHotkeys
        keys={['alt+p', 'alt+k']}
        options={{ repeat: true, enabled: !manualInputs && vimBindings }}
        callback={(e) => prev(e, 'alt')}
      />
      <LayeredHotkeys
        keys={['Home']}
        options={{ enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => {
          if (!eventTargetIsCmdkInput(e)) return

          updateSelectedToIndex(0)
        }}
      />
      <LayeredHotkeys
        keys={['End']}
        options={{ enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => {
          if (!eventTargetIsCmdkInput(e)) return

          last()
        }}
      />
      <LayeredHotkeys
        keys={['Enter']}
        options={{ enabled: !manualInputs, ...hotkeyEditableOptions }}
        callback={(e) => {
          if (!eventTargetIsCmdkInput(e)) return

          if (!e.isComposing && e.keyCode !== 229) {
            // Trigger item onSelect
            e.preventDefault()
            const item = getSelectedItem()

            if (item) {
              const event = new Event(SELECT_EVENT, e)

              item.dispatchEvent(event)
            }
          }
        }}
      />

      <div
        ref={containerRef}
        tabIndex={-1}
        className={cn('outline-none', className)}
        {...etc}
        // eslint-disable-next-line react/no-unknown-property
        cmdk-root=''
      >
        <label
          // eslint-disable-next-line react/no-unknown-property
          cmdk-label=''
          htmlFor={context.inputId}
          id={context.labelId}
          // Screen reader only
          style={srOnlyStyles}
        >
          {label}
        </label>
        {SlottableWithNestedChildren(props, (child) => (
          <StoreContext.Provider value={store}>
            <CommandContext.Provider value={context}>{child}</CommandContext.Provider>
          </StoreContext.Provider>
        ))}
      </div>
    </>
  )
})

/**
 * Command menu item. Becomes active on pointer enter or through keyboard navigation.
 * Preferably pass a `value`, otherwise the value will be inferred from `children` or
 * the rendered item's `textContent`.
 */
const Item = React.forwardRef<HTMLDivElement, ItemProps>(function Item(props, forwardedRef) {
  const id = useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const groupContext = React.useContext(GroupContext)
  const context = useCommand()!
  const propsRef = useAsRef(props)
  const forceMount = propsRef.current?.forceMount ?? groupContext?.forceMount

  useLayoutEffect(() => {
    if (!forceMount) {
      return context.item(id, groupContext?.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceMount])

  const value = useValue(id, ref, [props.value, props.children, ref], props.keywords, props.scoreModifier)

  const store = useStore()
  const selected = useCmdk((state) => state.value && state.value === value.current)
  const render = useCmdk((state) =>
    forceMount
      ? true
      : context.filter() === false
        ? true
        : !state.search
          ? true
          : (state.filtered.items.get(id) || 0) > 0
  )

  React.useEffect(() => {
    const element = ref.current

    if (!element || props.disabled) return

    function onSelect() {
      select()
      if (value.current) propsRef.current.onSelect?.(value.current)
    }

    element.addEventListener(SELECT_EVENT, onSelect)
    return () => element.removeEventListener(SELECT_EVENT, onSelect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render, props.onSelect, props.disabled])

  function select(event?: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) {
    if (value.current) store.setState('value', value.current, true, event)
  }

  function deselect() {
    if (value.current) store.setState('value', undefined, true)
  }

  const {
    disabled,
    disableOnClick,
    style,
    value: _value,
    onSelect: _onSelect,
    forceMount: _forceMount,
    keywords: _keywords,
    scoreModifier: _scoreModifier,
    ...etc
  } = props

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || disableOnClick) return

    if (e.defaultPrevented) return

    select(e)
    if (value.current) {
      propsRef.current.onSelect?.(value.current, e)
    }
  }

  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      // must still mount a DOM element as getValidItems() uses mounted elements for filtering and sorting
      data-render={render}
      style={{ ...style, display: render ? undefined : 'none' }}
      id={id}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-item=''
      tabIndex={0}
      role='option'
      aria-disabled={Boolean(disabled)}
      aria-selected={Boolean(selected)}
      data-disabled={Boolean(disabled)}
      data-selected={Boolean(selected)}
      onPointerMove={disabled || context.getDisablePointerSelection() ? undefined : select}
      onFocus={
        disabled ||
        context.getDisablePointerSelection() ||
        // prevent re-entrant selection
        selected
          ? undefined
          : () => select()
      }
      onBlur={disabled || context.getDisablePointerSelection() || !selected ? undefined : deselect}
      onClick={handleClick}
      onAuxClick={handleClick}
    >
      {props.children}
    </div>
  )
})

/**
 * Group command menu items together with a heading.
 * Grouped items are always shown together.
 */
const Group = React.forwardRef<HTMLDivElement, GroupProps>(function Group(props, forwardedRef) {
  const { heading, forceMount, ...etc } = props
  const id = useId()
  const ref = React.useRef<HTMLDivElement>(null)
  const headingRef = React.useRef<HTMLDivElement>(null)
  const headingId = useId()
  const context = useCommand()!
  const render = useCmdk((state) =>
    forceMount ? true : context.filter() === false ? true : !state.search ? true : state.filtered.groups.has(id)
  )

  useLayoutEffect(() => {
    return context.group(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useValue(id, ref, [props.value, props.heading, headingRef])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = React.useMemo(() => ({ id, forceMount }), [forceMount])

  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-group=''
      role='presentation'
      hidden={render ? undefined : true}
    >
      {heading && (
        <div
          ref={headingRef}
          // eslint-disable-next-line react/no-unknown-property
          cmdk-group-heading=''
          aria-hidden
          id={headingId}
        >
          {heading}
        </div>
      )}
      {SlottableWithNestedChildren(props, (child) => (
        <div
          // eslint-disable-next-line react/no-unknown-property
          cmdk-group-items=''
          role='group'
          aria-labelledby={heading ? headingId : undefined}
        >
          <GroupContext.Provider value={contextValue}>{child}</GroupContext.Provider>
        </div>
      ))}
    </div>
  )
})

/**
 * A visual and semantic separator between items or groups.
 * Visible when the search query is empty or `alwaysRender` is true, hidden otherwise.
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(props, forwardedRef) {
  const { alwaysRender, ...etc } = props
  const ref = React.useRef<HTMLDivElement>(null)
  const render = useCmdk((state) => !state.search)

  if (!alwaysRender && !render) return null
  return (
    <div
      ref={mergeRefs([ref, forwardedRef])}
      {...etc}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-separator=''
      role='separator'
    />
  )
})

/**
 * Command menu input.
 * All props are forwarded to the underyling `input` element.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, forwardedRef) {
  const { onValueChange, ...etc } = props
  const id = useId()
  const isControlled = props.value != null
  const store = useStore()
  const search = useCmdk((state) => state.search)
  const value = useCmdk((state) => state.value)
  const context = useCommand()!

  const selectedItemId = React.useMemo(() => {
    if (!value) return

    const item = context.listInnerRef.current?.querySelector(
      `${ITEM_SELECTOR}[${VALUE_ATTR}="${encodeURIComponent(value)}"]`
    )

    return item?.getAttribute('id')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (props.value != null) {
      store.setState('search', props.value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value])

  useLayoutEffect(() => {
    return context.input(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <input
      ref={forwardedRef}
      {...etc}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-input=''
      autoComplete='off'
      autoCorrect='off'
      spellCheck={false}
      aria-autocomplete='list'
      role='combobox'
      aria-expanded={true}
      aria-controls={context.listId}
      aria-labelledby={context.labelId}
      aria-activedescendant={selectedItemId ?? undefined}
      id={id}
      type='text'
      value={isControlled ? props.value : search}
      onChange={(e) => {
        if (!isControlled) {
          store.setState('search', e.target.value)
        }

        onValueChange?.(e.target.value)
      }}
    />
  )
})

/**
 * Contains `Item`, `Group`, and `Separator`.
 * Use the `--cmdk-list-height` CSS variable to animate height based on the number of results.
 */
const List = React.forwardRef<HTMLDivElement, ListProps>(function List(props, forwardedRef) {
  const { label = 'Suggestions', ...etc } = props
  const context = useCommand()!

  return (
    <div
      ref={mergeRefs([forwardedRef, context.listInnerRef])}
      {...etc}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-list=''
      role='listbox'
      aria-label={label}
      id={context.listId}
    >
      {SlottableWithNestedChildren(props, (child) => (
        <>{child}</>
      ))}
    </div>
  )
})

/**
 * Automatically renders when there are no results for the search query.
 */
const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(function Empty(props, forwardedRef) {
  const render = useCmdk((state) => state.filtered.count === 0)

  if (!render) return null
  return (
    <div
      ref={forwardedRef}
      {...props}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-empty=''
      role='presentation'
    />
  )
})

/**
 * You should conditionally render this with `progress` while loading asynchronous items.
 */
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(function Loading(props, forwardedRef) {
  const { progress, label = 'Loading...', ...etc } = props

  return (
    <div
      ref={forwardedRef}
      {...etc}
      // eslint-disable-next-line react/no-unknown-property
      cmdk-loading=''
      role='progressbar'
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      {SlottableWithNestedChildren(props, (child) => (
        <div aria-hidden>{child}</div>
      ))}
    </div>
  )
})

const pkg = Object.assign(Command, {
  List,
  Item,
  Input,
  Group,
  Separator,
  Empty,
  Loading
})

export { useCmdk as useCommandState }
export { pkg as Command }
export { defaultFilter }

export { Command as CommandRoot }
export { List as CommandList }
export { Item as CommandItem }
export { Input as CommandInput }
export { Group as CommandGroup }
export { Separator as CommandSeparator }
export { Empty as CommandEmpty }
export { Loading as CommandLoading }

/**
 *
 *
 * Helpers
 *
 *
 */

function findNextSibling(el: Element, selector: string) {
  let sibling = el.nextElementSibling

  while (sibling) {
    if (sibling.matches(selector)) return sibling
    sibling = sibling.nextElementSibling
  }
}

function findPreviousSibling(el: Element, selector: string) {
  let sibling = el.previousElementSibling

  while (sibling) {
    if (sibling.matches(selector)) return sibling
    sibling = sibling.previousElementSibling
  }
}

function useAsRef<T>(data: T) {
  const ref = React.useRef<T>(data)

  useLayoutEffect(() => {
    ref.current = data
  })

  return ref
}

const useLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

export function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T>()

  if (ref.current === undefined) {
    ref.current = fn()
  }

  return ref as React.MutableRefObject<T>
}

// ESM is still a nightmare with Next.js so I'm just gonna copy the package code in
// https://github.com/gregberge/react-merge-refs
// Copyright (c) 2020 Greg Bergé
function mergeRefs<T = any>(refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref != null) {
        ;(ref as React.MutableRefObject<T | null>).current = value
      }
    })
  }
}

/** Run a selector against the store state. */
function useCmdk<T = any>(selector: (state: State) => T) {
  const store = useStore()
  const cb = () => selector(store.snapshot())

  return React.useSyncExternalStore(store?.subscribe, cb, cb)
}

function useValue(
  id: string,
  ref: React.RefObject<HTMLElement>,
  deps: (string | React.ReactNode | React.RefObject<HTMLElement>)[],
  aliases: string[] = [],
  scoreModifier: number = 1
) {
  const valueRef = React.useRef<string>()
  const context = useCommand()!

  useLayoutEffect(() => {
    const value = (() => {
      for (const part of deps) {
        if (typeof part === 'string') {
          return part.trim()
        }

        if (typeof part === 'object' && part && 'current' in part) {
          if (part.current) {
            return part.current.textContent?.trim()
          }
          return valueRef.current
        }
      }
    })()

    const keywords = aliases.map((alias) => alias.trim())

    if (value) {
      context.value(id, value, keywords, scoreModifier)
      ref.current?.setAttribute(VALUE_ATTR, value)
      valueRef.current = value
    }
  })

  return valueRef
}

/** Imperatively run a function on the next layout effect cycle. */
const useScheduleLayoutEffect = () => {
  const [s, ss] = React.useState<object>()
  const fns = useLazyRef(() => new Map<string | number, () => void>())

  useLayoutEffect(() => {
    fns.current.forEach((f) => f())
    fns.current = new Map()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s])

  return (id: string | number, cb: () => void) => {
    fns.current.set(id, cb)
    ss({})
  }
}

function renderChildren(children: React.ReactElement) {
  const childrenType = children.type as any
  // The children is a component

  if (typeof childrenType === 'function') return childrenType(children.props)
  // The children is a component with `forwardRef`
  else if ('render' in childrenType) return childrenType.render(children.props)
  // It's a string, boolean, etc.
  else return children
}

function SlottableWithNestedChildren(
  { asChild, children }: { asChild?: boolean; children?: React.ReactNode },
  render: (child: React.ReactNode) => JSX.Element
) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(renderChildren(children), { ref: (children as any).ref }, render(children.props.children))
  }
  return render(children)
}

const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: '0'
} as const
