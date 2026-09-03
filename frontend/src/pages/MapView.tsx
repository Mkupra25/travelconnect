import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
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

type MapViewProps = { showRoute?: boolean }

const demoRoute: [number, number][] = [[41.6938, 44.8015], [41.6915, 44.8087], [41.6882, 44.8112], [41.6871, 44.8179]]

export default function MapView({ showRoute = false }: MapViewProps){
  const [destinations, setDestinations] = useState<Dest[]>([])
  const [businesses, setBusinesses] = useState<Biz[]>([])

  useEffect(()=>{
    axios.get('/api/destinations/').then(r => {
      const data = Array.isArray(r.data) ? r.data : []
      setDestinations(data)
    }).catch(() => setDestinations([]))

    axios.get('/api/businesses/').then(r => {
      const data = Array.isArray(r.data) ? r.data : []
      setBusinesses(data)
    }).catch(() => setBusinesses([]))
  },[])

  const center: [number, number] = [41.7151, 44.8271] // default: Tbilisi
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
  const tileUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

  const builtInAttractions: Dest[] = [
    { id: -1, name: 'Narikala Fortress', latitude: 41.6871, longitude: 44.8086, rating: 4.8 },
    { id: -2, name: 'Holy Trinity Cathedral', latitude: 41.6979, longitude: 44.8162, rating: 4.7 },
    { id: -3, name: 'Mtatsminda Park', latitude: 41.6943, longitude: 44.7865, rating: 4.6 },
    { id: -4, name: 'Dry Bridge Market', latitude: 41.7060, longitude: 44.8051, rating: 4.5 },
  ]
  const mappedDestinations = Array.isArray(destinations)
    ? destinations.filter((destination) => typeof destination.latitude === 'number' && typeof destination.longitude === 'number')
    : []
  const safeDestinations = mappedDestinations.length ? mappedDestinations : builtInAttractions
  const safeBusinesses = Array.isArray(businesses) ? businesses : []

  return (
    <MapContainer center={center} zoom={6} style={{height: '100%'}}>
      <TileLayer
        url={tileUrl}
        attribution={mapboxToken ? '&copy; Mapbox' : '&copy; OpenStreetMap contributors'}
        id={mapboxToken ? 'mapbox/streets-v11' : undefined}
        tileSize={mapboxToken ? 512 : 256}
        zoomOffset={mapboxToken ? -1 : 0}
      />

      {safeDestinations.filter(d => typeof d.latitude === 'number' && typeof d.longitude === 'number').map(d => (
        <Marker key={`dest-${d.id}`} position={[d.latitude as number, d.longitude as number]}>
          <Popup>
            <strong>{d.name}</strong><br />Attraction<br />Rating: {d.rating ?? 'n/a'}
          </Popup>
        </Marker>
      ))}

      {safeBusinesses.filter(b => typeof b.latitude === 'number' && typeof b.longitude === 'number').map(b => (
        <Marker key={`biz-${b.id}`} position={[b.latitude as number, b.longitude as number]}>
          <Popup>
            <strong>{b.name}</strong><br />Business / establishment<br />Rating: {b.rating ?? 'n/a'}
          </Popup>
        </Marker>
      ))}
      {showRoute && <Polyline positions={demoRoute} pathOptions={{ color: '#8b75ec', weight: 5, opacity: 0.9 }} />}
    </MapContainer>
  )
}
