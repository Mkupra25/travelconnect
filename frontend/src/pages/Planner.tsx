import React, { useState } from 'react'
import axios from 'axios'

export default function Planner(){
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const [alternatives, setAlternatives] = useState<any[]>([])
  const [status, setStatus] = useState('')

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
    <div style={{padding: 12}}>
      <h2>Trip Planner</h2>
      <form onSubmit={submit}>
        <div>
          <label>Country: </label>
          <input value={country} onChange={e=>setCountry(e.target.value)} />
        </div>
        <div>
          <label>City: </label>
          <input value={city} onChange={e=>setCity(e.target.value)} />
        </div>
        <div>
          <label>Budget (USD): </label>
          <input type="number" value={budget} onChange={e=>setBudget(parseFloat(e.target.value||'0'))} />
        </div>
        <button type="submit">Get Recommendations</button>
      </form>

      <div>
        <h3>Results</h3>
        {status==='loading' && <div>Loading...</div>}
        {results.map((r:any)=> (
          <div key={r.id} style={{border: '1px solid #ccc', padding:8, margin:6}}>
            <strong>{r.name}</strong> — {r.city}, {r.country} — Cost: {r.average_cost} — Rating: {r.rating}
          </div>
        ))}

        {alternatives.length>0 && (
          <div>
            <h4>Alternatives</h4>
            {alternatives.map((a:any)=> (
              <div key={a.id} style={{border: '1px dashed #ccc', padding:8, margin:6}}>
                <strong>{a.name}</strong> — Cost: {a.average_cost}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
