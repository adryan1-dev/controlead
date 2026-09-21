import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/layout/AppShell'
import { ClientsPage } from '@/features/clients/ClientsPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { FinancePage } from '@/features/finance/FinancePage'
import { LeadsPage } from '@/features/leads/LeadsPage'
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

const devRoutes = import.meta.env.DEV
  ? [
      {
        path: 'dev/ui',
        lazy: async () => {
          const { DevUIPage } = await import('@/features/dev/DevUIPage')
          return { Component: DevUIPage }
        },
      },
    ]
  : []

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'leads', element: <LeadsPage /> },
      { path: 'leads/:id', element: <LeadsPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'settings', element: <SettingsPage /> },
      ...devRoutes,
    ],
  },
])
