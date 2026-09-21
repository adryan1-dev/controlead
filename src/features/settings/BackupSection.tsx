import { useRef, useState } from 'react'

import { Download, Upload } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/domain/dates'
import type { BackupFile } from '@/domain/schemas'
import { BackupValidationError, exportBackup, getCurrentCounts, importBackup, validateBackupFile } from '@/services/backupService'

const TABLE_LABELS: Record<string, string> = {
  leads: 'Leads',
  tasks: 'Tarefas',
  events: 'Eventos',
  projects: 'Projetos',
  projectItems: 'Itens de projeto',
  payments: 'Pagamentos',
  settings: 'Configurações',
}

type Counts = Record<string, number>

export function BackupSection() {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exporting, setExporting] = useState(false)
  const [importError, setImportError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState<{ backup: BackupFile; currentCounts: Counts } | undefined>(undefined)
  const [importing, setImporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportBackup()
      showToast('Backup exportado')
    } finally {
      setExporting(false)
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImportError(undefined)
    try {
      const text = await file.text()
      let json: unknown
      try {
        json = JSON.parse(text)
      } catch {
        throw new BackupValidationError('Arquivo corrompido: não é um JSON válido.')
      }
      const backup = validateBackupFile(json)
      const currentCounts = await getCurrentCounts()
      setPending({ backup, currentCounts })
    } catch (err) {
      setImportError(err instanceof BackupValidationError ? err.message : 'Não foi possível ler este arquivo.')
    }
  }

  async function handleConfirmImport() {
    if (!pending) return
    setImporting(true)
    try {
      await importBackup(pending.backup)
      showToast('Backup importado com sucesso')
      setPending(undefined)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Backup</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Seus dados ficam só neste computador. Exporte regularmente para não perder nada.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" icon={<Download size={15} />} onClick={handleExport} disabled={exporting}>
          Exportar backup
        </Button>
        <Button
          variant="secondary"
          icon={<Upload size={15} />}
          onClick={() => fileInputRef.current?.click()}
        >
          Importar backup
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileSelected} />
      </div>

      {importError ? <p className="text-sm text-[var(--color-danger)]">{importError}</p> : null}

      <ConfirmDialog
        open={!!pending}
        onCancel={() => setPending(undefined)}
        onConfirm={handleConfirmImport}
        title="Substituir todos os dados?"
        danger
        confirmLabel={importing ? 'Importando…' : 'Substituir dados'}
        requireTypedConfirmation="SUBSTITUIR"
        description={
          pending
            ? `Backup de ${formatDate(pending.backup.exportedAt.slice(0, 10))}. Isso apaga tudo o que existe hoje neste computador e substitui pelos dados do arquivo (um backup do estado atual é baixado automaticamente antes). ` +
              Object.entries(pending.backup.counts ?? {})
                .map(([key, count]) => `${TABLE_LABELS[key] ?? key}: ${pending.currentCounts[key]} → ${count}`)
                .join(' · ')
            : ''
        }
      />
    </Card>
  )
}
