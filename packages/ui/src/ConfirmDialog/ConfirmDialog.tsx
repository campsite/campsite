import React, { createContext, useContext, useState } from 'react'

import { Button, ButtonProps } from '../Button'
import * as CampsiteDialog from '../Dialog'

export type ConfirmDialogResolveFn = (onOpenChange: (open: boolean) => void) => void

const ConfirmDialogContext = createContext<{
  open: boolean
  isLoading: boolean
  setOpen: (open: boolean) => void
  onConfirm: (onOpenChange: (open: boolean) => void) => void
  handleOpenChange: (open: boolean) => void
} | null>(null)

function useConfirmDialogContext() {
  const context = useContext(ConfirmDialogContext)

  if (!context) {
    throw new Error('ConfirmDialog subcomponents must be used within a ConfirmDialog.Root')
  }
  return context
}

interface RootProps {
  children: React.ReactNode
  onConfirm: ConfirmDialogResolveFn
  isLoading?: boolean
}

function Root({ children, onConfirm, isLoading = false }: RootProps) {
  const [open, setOpen] = useState(false)

  function handleOpenChange(open: boolean) {
    setOpen(open)
  }

  const contextValue = {
    open,
    setOpen,
    onConfirm,
    isLoading,
    handleOpenChange
  }

  return <ConfirmDialogContext.Provider value={contextValue}>{children}</ConfirmDialogContext.Provider>
}

interface TriggerProps extends ButtonProps {}

function Trigger({ variant = 'base', ...props }: TriggerProps) {
  const { setOpen } = useConfirmDialogContext()

  return <Button variant={variant} onClick={() => setOpen(true)} {...props} />
}

interface DialogProps {
  title: string
  description: string | React.ReactNode
  confirmLabel?: string
  dialogProps?: Omit<CampsiteDialog.DialogProps, 'open' | 'onOpenChange' | 'children'>
}

function Dialog({ title, description, confirmLabel = 'Confirm', dialogProps = { size: 'base' } }: DialogProps) {
  const { open, handleOpenChange, onConfirm, isLoading, setOpen } = useConfirmDialogContext()

  return (
    <CampsiteDialog.Root open={open} onOpenChange={handleOpenChange} {...dialogProps}>
      <CampsiteDialog.Header>
        <CampsiteDialog.Title>{title}</CampsiteDialog.Title>
      </CampsiteDialog.Header>
      <CampsiteDialog.Content>
        <CampsiteDialog.Description className='text-sm'>{description}</CampsiteDialog.Description>
      </CampsiteDialog.Content>
      <CampsiteDialog.Footer>
        <CampsiteDialog.TrailingActions>
          <Button variant='flat' onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() => onConfirm(handleOpenChange)}
            disabled={isLoading}
            loading={isLoading}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </CampsiteDialog.TrailingActions>
      </CampsiteDialog.Footer>
    </CampsiteDialog.Root>
  )
}

export const ConfirmDialog = Object.assign({}, { Root, Trigger, Dialog })
