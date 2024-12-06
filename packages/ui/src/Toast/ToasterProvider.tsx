import { useTheme } from 'next-themes'
import { Toaster } from 'react-hot-toast'

export function ToasterProvider() {
  const { resolvedTheme } = useTheme()
  const position = 'bottom-center'
  const isDark = resolvedTheme === 'dark'

  return (
    <Toaster
      containerClassName='toaster-container'
      position={position}
      toastOptions={{
        // Define default options
        duration: 5000,
        // can't use tailwind classes because of conflicts with default toast styles
        style: {
          background: isDark ? '#313131' : '#000',
          color: '#fff',
          fontWeight: '500',
          fontSize: '14px',
          boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
          borderRadius: '9999px'
        }
      }}
    />
  )
}
