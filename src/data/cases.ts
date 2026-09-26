// DEMO applicant queue for the SCA officer dashboard and VLE operator mode.
// Every case is a real engine run over these inputs, nothing on the dashboard is typed in by hand.
import type { SavedCase } from '../lib/store'
import type { PlanInput } from '../engine/plan'

const f = (experience: 0 | 1 | 2, familyLabour: 0 | 1 | 2, hours: 0 | 1 | 2, training: 0 | 1, interest: 1 | 2 | 3 | 4 | 5) => ({ experience, familyLabour, hours, training, interest })

const seed: [string, string, Omit<PlanInput, 'name'>, SavedCase['status'], string][] = [
  ['GUS-24101', 'Sunita Devi', { lgd: '146021', activity: 'dairy', sizeId: null, margin: 100000, category: 'SC', familyIncome: 180000, fit: f(1, 1, 2, 0, 4), mode: 'serviced' }, 'draft', '2026-09-24T10:12:00+05:30'],
  ['GUS-24102', 'Rekha Kumari', { lgd: '146022', activity: 'tailoring', sizeId: null, margin: 10000, category: 'SC', familyIncome: 120000, fit: f(0, 0, 1, 0, 4), mode: 'serviced' }, 'draft', '2026-09-24T11:40:00+05:30'],
  ['GUS-24103', 'Ramesh Pasi', { lgd: '146021', activity: 'kirana', sizeId: 'kirana-m', margin: 45000, category: 'SC', familyIncome: 210000, fit: f(1, 1, 2, 0, 3), mode: 'serviced' }, 'revision', '2026-09-23T15:05:00+05:30'],
  ['GUS-24104', 'Anita Gautam', { lgd: '146030', activity: 'mobile', sizeId: 'mobile-s', margin: 12000, category: 'SC', familyIncome: 90000, fit: f(2, 0, 2, 1, 5), mode: 'serviced' }, 'ready', '2026-09-22T09:30:00+05:30'],
  ['GUS-24105', 'Mahesh Kori', { lgd: '146026', activity: 'goat', sizeId: 'goat-20', margin: 30000, category: 'SC', familyIncome: 140000, fit: f(2, 1, 2, 0, 4), mode: 'serviced' }, 'ready', '2026-09-22T12:18:00+05:30'],
  ['GUS-24106', 'Pooja Rawat', { lgd: '146029', activity: 'dairy', sizeId: 'dairy-6', margin: 60000, category: 'SC', familyIncome: 160000, fit: f(2, 2, 2, 1, 5), mode: 'serviced' }, 'draft', '2026-09-25T08:50:00+05:30'],
  ['GUS-24107', 'Suresh Valmiki', { lgd: '146023', activity: 'chakki', sizeId: 'chakki-1', margin: 25000, category: 'SAFAI', familyIncome: 110000, fit: f(1, 1, 2, 0, 4), mode: 'serviced' }, 'draft', '2026-09-25T10:02:00+05:30'],
  ['GUS-24108', 'Kiran Yadav', { lgd: '146032', activity: 'tea', sizeId: 'tea-m', margin: 20000, category: 'OBC', familyIncome: 150000, fit: f(1, 1, 2, 0, 4), mode: 'serviced' }, 'draft', '2026-09-25T13:25:00+05:30'],
  ['GUS-24109', 'Vijay Kumar', { lgd: '146024', activity: 'poultry', sizeId: 'poultry-1000', margin: 40000, category: 'SC', familyIncome: 260000, fit: f(0, 1, 1, 0, 3), mode: 'serviced' }, 'revision', '2026-09-21T16:40:00+05:30'],
  ['GUS-24110', 'Geeta Devi', { lgd: '146035', activity: 'tailoring', sizeId: 'tailor-2', margin: 15000, category: 'SC', familyIncome: 95000, fit: f(2, 1, 2, 1, 5), mode: 'serviced' }, 'ready', '2026-09-20T11:15:00+05:30'],
  ['GUS-24111', 'Rajesh Dhobi', { lgd: '146028', activity: 'kirana', sizeId: 'kirana-s', margin: 14000, category: 'SC', familyIncome: 130000, fit: f(1, 1, 2, 0, 4), mode: 'serviced' }, 'draft', '2026-09-25T15:45:00+05:30'],
  ['GUS-24112', 'Lalita Sonkar', { lgd: '146037', activity: 'nursery', sizeId: 'nursery-1', margin: 35000, category: 'SC', familyIncome: 170000, fit: f(1, 2, 2, 1, 4), mode: 'serviced' }, 'draft', '2026-09-26T09:10:00+05:30'],
  ['GUS-24113', 'Manoj Rawat', { lgd: '146033', activity: 'dairy', sizeId: 'dairy-10', margin: 150000, category: 'SC', familyIncome: 240000, fit: f(0, 1, 1, 0, 3), mode: 'serviced' }, 'revision', '2026-09-19T14:00:00+05:30'],
  ['GUS-24114', 'Shabnam Bano', { lgd: '146036', activity: 'tailoring', sizeId: 'tailor-1', margin: 8000, category: 'OBC', familyIncome: 80000, fit: f(2, 0, 1, 1, 5), mode: 'serviced' }, 'ready', '2026-09-18T10:30:00+05:30'],
]

export const SEED_CASES: SavedCase[] = seed.map(([id, name, input, status, createdAt]) => ({
  id,
  input: { name, ...input },
  createdAt,
  status,
  channel: id === 'GUS-24101' || id === 'GUS-24102' ? 'self' : 'vle',
  remarks:
    status === 'revision'
      ? [{ by: 'A. Srivastava (SCA)', at: createdAt, text: 'Loan asked is above what the unit can repay. Please revise to the recommended size.' }]
      : status === 'ready'
        ? [{ by: 'A. Srivastava (SCA)', at: createdAt, text: 'Documents complete. Forwarded for PM-SURAJ.' }]
        : [],
}))
