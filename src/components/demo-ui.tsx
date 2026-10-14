import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const toast = (m: string) => setMsg(m)
  const node = msg ? <Toast message={msg} onDone={() => setMsg(null)} /> : null
  return { toast, ToastSlot: node }
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return createPortal(
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-green-brand/30 bg-charcoal px-4 py-3 text-white shadow-2xl sm:left-auto sm:right-6 sm:bottom-6">
      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-brand" />
      <p className="text-[13px] font-semibold leading-snug">{message}</p>
      <button onClick={onDone} className="ml-1 shrink-0 text-slate-400 hover:text-white" aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>,
    document.body,
  )
}

export function Modal({
  open,
  title,
  children,
  onClose,
  wide,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className={`relative max-h-[min(90dvh,40rem)] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-extrabold text-charcoal">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-charcoal" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-soft px-3.5 py-2.5 text-sm outline-none transition focus:border-green-brand focus:bg-white focus:ring-4 focus:ring-green-brand/15'

export function FormActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void
  submitLabel: string
}) {
  return (
    <div className="mt-5 flex gap-2">
      <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-[13px] font-bold hover:bg-slate-50">
        Cancel
      </button>
      <button type="submit" className="flex-1 rounded-lg bg-green-brand py-2.5 text-[13px] font-bold text-white hover:bg-green-deep">
        {submitLabel}
      </button>
    </div>
  )
}

export function submitForm(e: FormEvent, then: () => void) {
  e.preventDefault()
  then()
}
