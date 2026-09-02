import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import L from 'leaflet'

// Fix default icon path for leaflet in many bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadowUrl from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

type Dest = {
  id: number
  name: string
  latitude?: number
  longitude?: number
  rating?: number
}

type Biz = {
  id: number
  name: string
  latitude?: number
  longitude?: number
  rating?: number
}

export default function MapView(){
  const [destinations, setDestinations] = useState<Dest[]>([])
  const [businesses, setBusinesses] = useState<Biz[]>([])

  useEffect(()=>{
    axios.get('/api/destinations/').then(r=>setDestinations(r.data)).catch(()=>{})
    axios.get('/api/businesses/').then(r=>setBusinesses(r.data)).catch(()=>{})
  },[])

  const center: [number, number] = [41.7151, 44.8271] // default: Tbilisi

  return (
    <MapContainer center={center} zoom={6} style={{height: '100%'}}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
        id="mapbox/streets-v11"
        tileSize={512}
        zoomOffset={-1}
      />

      {destinations.map(d=> d.latitude && d.longitude && (
        <Marker key={`dest-${d.id}`} position={[d.latitude, d.longitude]}>
          <Popup>
            <strong>{d.name}</strong><br />Rating: {d.rating ?? 'n/a'}
          </Popup>
        </Marker>
      ))}

      {businesses.map(b=> b.latitude && b.longitude && (
        <Marker key={`biz-${b.id}`} position={[b.latitude, b.longitude]}>
          <Popup>
            <strong>{b.name}</strong><br />Rating: {b.rating ?? 'n/a'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
