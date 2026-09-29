import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

type Bobina = { id: string; nome: string; codigo: string; fornecedor: string }
export type ProducaoDiaria = { id: string; data: string; bobinaId: string; fardo: string; fardos: number; comentario: string; lote: string; operador: string }

type Props = { bobinas: Bobina[]; producoes: ProducaoDiaria[]; setProducoes: (value: ProducaoDiaria[]) => void; notify: (message: string) => void }

const hoje = new Date().toISOString().slice(0, 10)
const dateFmt = (value: string) => value ? value.split('-').reverse().join('/') : '-'
const numberFmt = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
const fardoOptions = ['30x1', '10x1', '6x5', 'Sacos', 'Begs']

export default function DailyProduction({ bobinas, producoes, setProducoes, notify }: Props) {
  const [date, setDate] = useState(hoje)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<Omit<ProducaoDiaria, 'id'>>({ data: hoje, bobinaId: bobinas[0]?.id || '', fardo: fardoOptions[0], fardos: 0, comentario: '', lote: '', operador: '' })
  const names = useMemo(() => new Map(bobinas.map(item => [item.id, item])), [bobinas])
  const todayTotal = producoes.filter(item => item.data === date).reduce((sum, item) => sum + item.fardos, 0)
  const filtered = producoes.filter(item => item.data === date && `${names.get(item.bobinaId)?.nome || ''} ${item.operador} ${item.lote} ${item.comentario}`.toLowerCase().includes(search.toLowerCase())).slice().reverse()
  const update = (key: keyof typeof form, value: string | number) => setForm(current => ({ ...current, [key]: value }))
  const save = () => {
    if (!form.data || !form.bobinaId || !form.fardo || form.fardos <= 0 || !form.lote.trim() || !form.operador.trim()) return notify('Preencha data, produto, fardo, fardos, lote e operador.')
    setProducoes([...producoes, { ...form, id: crypto.randomUUID() }])
    setDate(form.data)
    setForm(current => ({ ...current, fardos: 0, comentario: '', lote: '', operador: '' }))
    notify('Produção diária registrada.')
  }

  return <>
    <section className="surface form-surface"><div className="section-heading"><div><span className="eyebrow">NOVO LANÇAMENTO</span><h2>Lançar produção</h2></div><span className="required-note">* obrigatório</span></div><div className="form-grid three"><label className="field-label">Data *<input type="date" value={form.data} onChange={event => update('data', event.target.value)} /></label><label className="field-label">Produto *<select value={form.bobinaId} onChange={event => update('bobinaId', event.target.value)}>{bobinas.map(item => <option key={item.id} value={item.id}>{item.codigo} · {item.nome}</option>)}</select></label><label className="field-label">Fardo *<select value={form.fardo} onChange={event => update('fardo', event.target.value)}>{fardoOptions.map(option => <option key={option}>{option}</option>)}</select></label><label className="field-label">Fardos *<input type="number" min="0" step="1" value={form.fardos || ''} onChange={event => update('fardos', Number(event.target.value))} placeholder="Quantidade" /></label><label className="field-label">Lote *<input value={form.lote} onChange={event => update('lote', event.target.value)} placeholder="Identificação do lote" /></label><label className="field-label">Operador *<input value={form.operador} onChange={event => update('operador', event.target.value)} placeholder="Nome do operador" /></label></div><label className="field-label">Comentário<textarea rows={3} value={form.comentario} onChange={event => update('comentario', event.target.value)} placeholder="Observações da produção..." /></label><div className="form-footer"><span>O total do dia é atualizado a cada lançamento.</span><button className="primary-button" onClick={save}><Plus size={17} />Lançar produção</button></div></section>
    <section className="surface table-surface"><div className="section-heading"><div><span className="eyebrow">HISTÓRICO</span><h2>Produções lançadas</h2><p>{filtered.length} registros encontrados · Total do dia: <strong>{numberFmt(todayTotal)} fardos</strong></p></div><div className="toolbar-actions"><input className="compact-search" placeholder="Buscar produto, lote ou operador" value={search} onChange={event => setSearch(event.target.value)} /><label className="date-field">Selecionar dia<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label></div></div><div className="table-wrap"><table><thead><tr><th>Data</th><th>Produto</th><th>Fardo</th><th>Fardos</th><th>Lote</th><th>Operador</th><th>Comentário</th><th>Ação</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td>{dateFmt(item.data)}</td><td><strong>{names.get(item.bobinaId)?.nome || 'Produto removido'}</strong><small className="table-subline">{names.get(item.bobinaId)?.codigo || '-'}</small></td><td>{item.fardo}</td><td><strong>{numberFmt(item.fardos)}</strong></td><td>{item.lote}</td><td>{item.operador}</td><td>{item.comentario || '-'}</td><td><button className="table-icon" title="Remover lançamento" onClick={() => setProducoes(producoes.filter(entry => entry.id !== item.id))}><Trash2 size={15} /></button></td></tr>)}</tbody></table>{!filtered.length && <div className="empty"><ClipboardList size={22} /><span>Nenhuma produção diária encontrada para este dia.</span></div>}</div></section>
  </>
}
