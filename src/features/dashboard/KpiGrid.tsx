import { AlertTriangle, Banknote, CalendarClock, Handshake, TrendingUp, UserPlus, Users2, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router'

import { MoneyText } from '@/components/shared/MoneyText'
import { StatCard, type StatCardChip } from '@/components/ui/StatCard'
import { currentMonthKey, today } from '@/domain/dates'
import type { DashboardData } from '@/hooks/useDashboard'

interface KpiGridProps {
  data: DashboardData
}

interface KpiConfig {
  label: string
  value: React.ReactNode
  icon: React.ReactNode
  chip: StatCardChip
  tone?: 'neutral' | 'warning' | 'danger'
  to: string
}

export function KpiGrid({ data }: KpiGridProps) {
  const navigate = useNavigate()
  const monthStart = `${currentMonthKey()}-01`
  const monthEnd = today()

  const kpis: KpiConfig[] = [
    { label: 'Leads ativos', value: data.activeLeadsCount, icon: <Users2 size={16} />, chip: 'violet', to: '/leads' },
    {
      label: 'Follow-up pendente',
      value: data.followUpPendingCount,
      icon: <AlertTriangle size={16} />,
      chip: 'amber',
      tone: data.followUpPendingCount > 0 ? 'warning' : 'neutral',
      to: '/leads?followup=1',
    },
    {
      label: 'Novos no mês',
      value: data.newLeadsThisMonth,
      icon: <UserPlus size={16} />,
      chip: 'blue',
      to: `/leads?createdFrom=${monthStart}&createdTo=${monthEnd}`,
    },
    { label: 'Fechados no mês', value: data.closedDealsThisMonth, icon: <Handshake size={16} />, chip: 'teal', to: '/clients' },
    { label: 'Em produção', value: data.projectsInProgress, icon: <TrendingUp size={16} />, chip: 'blue', to: '/projects?status=in_progress' },
    {
      label: 'Prazo atrasado',
      value: data.deadlineOverdueCount,
      icon: <CalendarClock size={16} />,
      chip: 'rose',
      tone: data.deadlineOverdueCount > 0 ? 'danger' : 'neutral',
      to: '/projects?deadline=overdue',
    },
    {
      label: 'Aguardando pagamento',
      value: data.awaitingPaymentCount,
      icon: <Wallet size={16} />,
      chip: 'amber',
      tone: data.awaitingPaymentCount > 0 ? 'warning' : 'neutral',
      to: '/finance',
    },
    {
      label: 'Recebido no mês',
      value: <MoneyText cents={data.receivedThisMonthCents} tone="success" />,
      icon: <Banknote size={16} />,
      chip: 'teal',
      to: '/finance',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          icon={kpi.icon}
          chip={kpi.chip}
          tone={kpi.tone}
          onClick={() => navigate(kpi.to)}
        />
      ))}
    </div>
  )
}
