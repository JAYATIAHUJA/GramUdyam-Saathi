import { useState } from 'react'
import { type SavedCase, useT } from '../../lib/store'

export function RemarksPanel({ c, onAdd }: { c: SavedCase; onAdd: (text: string) => void }) {
  const t = useT()
  const [note, setNote] = useState('')
  return (
    <div>
      <div className="space-y-2">
        {c.remarks.map((m, i) => (
          <div key={i} className="rounded-lg border border-line px-3 py-2 text-[13.5px]">
            <div className="text-[11.5px] text-muted">
              {m.by}, {new Date(m.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            {m.text}
          </div>
        ))}
        {c.remarks.length === 0 && <p className="text-[13px] text-muted">{t('No remarks yet.', 'अभी कोई टिप्पणी नहीं।')}</p>}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!note.trim()) return
          onAdd(note.trim())
          setNote('')
        }}
      >
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('Note for the applicant / VLE', 'आवेदक / VLE के लिए टिप्पणी')} className="flex-1 rounded-lg border border-line px-3 py-2 text-[14px]" />
        <button className="rounded-lg bg-indigo px-3 text-[14px] font-semibold text-white">{t('Add', 'जोड़ें')}</button>
      </form>
    </div>
  )
}
