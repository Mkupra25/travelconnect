import React, { useState } from 'react'
import axios from 'axios'

type Language = 'en' | 'ka' | 'fr' | 'de' | 'ru' | 'zh'

type PlannerProps = {
  language: Language
}

const translations = {
  en: {
    title: 'Trip Planner',
    country: 'Country',
    city: 'City',
    budget: 'Budget (USD)',
    button: 'Get Recommendations',
    results: 'Results',
    loading: 'Loading...',
    alternatives: 'Alternatives',
    cost: 'Cost',
    rating: 'Rating',
  },
  ka: {
    title: 'სამგზავრო დამგეგმავი',
    country: 'ქვეყანა',
    city: 'ქალაქი',
    budget: 'ბიუჯეტი (USD)',
    button: 'რეკომენდაციების მიღება',
    results: 'შედეგები',
    loading: 'იტვირთება...',
    alternatives: 'ალტერნატივები',
    cost: 'ფასი',
    rating: 'რეიტინგი',
  },
  fr: {
    title: 'Planificateur de voyage',
    country: 'Pays',
    city: 'Ville',
    budget: 'Budget (USD)',
    button: 'Obtenir des recommandations',
    results: 'Résultats',
    loading: 'Chargement...',
    alternatives: 'Alternatives',
    cost: 'Coût',
    rating: 'Note',
  },
  de: {
    title: 'Reiseplaner',
    country: 'Land',
    city: 'Stadt',
    budget: 'Budget (USD)',
    button: 'Empfehlungen abrufen',
    results: 'Ergebnisse',
    loading: 'Lädt...',
    alternatives: 'Alternativen',
    cost: 'Kosten',
    rating: 'Bewertung',
  },
  ru: {
    title: 'Планировщик поездок',
    country: 'Страна',
    city: 'Город',
    budget: 'Бюджет (USD)',
    button: 'Получить рекомендации',
    results: 'Результаты',
    loading: 'Загрузка...',
    alternatives: 'Альтернативы',
    cost: 'Стоимость',
    rating: 'Рейтинг',
  },
  zh: {
    title: '旅行规划器',
    country: '国家',
    city: '城市',
    budget: '预算 (USD)',
    button: '获取建议',
    results: '结果',
    loading: '加载中...',
    alternatives: '替代方案',
    cost: '费用',
    rating: '评分',
  },
} as const

export default function Planner({ language }: PlannerProps){
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const t = translations[language]

  const submit = async (e: React.FormEvent) =>{
    e.preventDefault()
    setStatus('loading')
    try{
      const resp = await axios.post('/api/trips/recommend', { preferred_country: country, preferred_city: city, budget: budget })
      setStatus('done')
      setResults(resp.data.results || [])
      setAlternatives(resp.data.alternatives || [])
    }catch(err){
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto', paddingTop: 70 }}>
      <h2 style={{ color: '#1f2937' }}>{t.title}</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <div>
          <label>{t.country}: </label>
          <input value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
        </div>
        <div>
          <label>{t.city}: </label>
          <input value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
        </div>
        <div>
          <label>{t.budget}: </label>
          <input type="number" value={budget} onChange={e => setBudget(parseFloat(e.target.value || '0'))} style={{ width: '100%', marginTop: 4 }} />
        </div>
        <button type="submit">{t.button}</button>
      </form>

      <div>
        <h3>{t.results}</h3>
        {status === 'loading' && <div>{t.loading}</div>}
        {results.map((r: any) => (
          <div key={r.id} style={{ border: '1px solid #ccc', padding: 8, margin: 6, background: '#fff' }}>
            <strong>{r.name}</strong> — {r.city}, {r.country} — {t.cost}: {r.average_cost} — {t.rating}: {r.rating}
          </div>
        ))}

        {alternatives.length > 0 && (
          <div>
            <h4>{t.alternatives}</h4>
            {alternatives.map((a: any) => (
              <div key={a.id} style={{ border: '1px dashed #ccc', padding: 8, margin: 6, background: '#fff' }}>
                <strong>{a.name}</strong> — {t.cost}: {a.average_cost}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
