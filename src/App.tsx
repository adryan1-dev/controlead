import { RouterProvider } from 'react-router'

import { ToastProvider } from '@/components/ui/Toast'
import { router } from '@/router'

export function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}
