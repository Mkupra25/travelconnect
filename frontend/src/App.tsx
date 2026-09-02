import React from 'react'
import MapView from './pages/MapView'
import Planner from './pages/Planner'
import { useState } from 'react'

export default function App(){
  const [view, setView] = useState<'map'|'planner'>('map')
  return (
    <div style={{height: '100vh'}}>
      <div style={{position: 'absolute', zIndex: 1000, padding: 10}}>
        <button onClick={()=>setView('map')}>Map</button>
        <button onClick={()=>setView('planner')}>Planner</button>
      </div>
      {view==='map' ? <MapView /> : <Planner />}
    </div>
  )
}
