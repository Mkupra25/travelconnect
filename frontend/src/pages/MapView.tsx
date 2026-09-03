import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
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

type MapViewProps = { showRoute?: boolean; routeNames?: string[] }

const demoRoute: [number, number][] = [[41.6938, 44.8015], [41.6915, 44.8087], [41.6882, 44.8112], [41.6871, 44.8179]]

function MapControls({ satellite, setSatellite }: { satellite: boolean; setSatellite: (value: boolean) => void }) {
  const map = useMap()
  const locate = () => map.locate({ setView: true, maxZoom: 15 })
  return <div className="map-controls"><button type="button" onClick={() => setSatellite(!satellite)}>{satellite ? 'Map view' : 'Satellite'}</button><button type="button" onClick={locate} aria-label="Find my location">◎</button></div>
}

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  useMapEvents({ locationfound: event => setPosition([event.latlng.lat, event.latlng.lng]) })
  return position ? <Marker position={position}><Popup>You are here</Popup></Marker> : null
}

export default function MapView({ showRoute = false, routeNames }: MapViewProps){
  const [destinations, setDestinations] = useState<Dest[]>([])
  const [businesses, setBusinesses] = useState<Biz[]>([])
  const [satellite, setSatellite] = useState(false)

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

  const center: [number, number] = [41.6938, 44.8086]
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
  const tileUrl = satellite && mapboxToken
    ? `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : tileUrlForMap(mapboxToken)
  const satelliteUrl = mapboxToken
    ? `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

  const builtInAttractions: Dest[] = [
    { id: -1, name: 'Narikala Fortress', latitude: 41.6871, longitude: 44.8086, rating: 4.8 },
    { id: -5, name: 'Fabrika Courtyard', latitude: 41.7070, longitude: 44.7935, rating: 4.6 },
    { id: -6, name: 'Abanotubani Baths', latitude: 41.6885, longitude: 44.8112, rating: 4.7 },
    { id: -2, name: 'Holy Trinity Cathedral', latitude: 41.6979, longitude: 44.8162, rating: 4.7 },
    { id: -3, name: 'Mtatsminda Park', latitude: 41.6943, longitude: 44.7865, rating: 4.6 },
    { id: -4, name: 'Dry Bridge Market', latitude: 41.7060, longitude: 44.8051, rating: 4.5 },
  ]
  const mappedDestinations = Array.isArray(destinations)
    ? destinations.filter((destination) => typeof destination.latitude === 'number' && typeof destination.longitude === 'number')
    : []
  const safeDestinations = mappedDestinations.length ? mappedDestinations : builtInAttractions
  const safeBusinesses = Array.isArray(businesses) ? businesses : []
  const selectedRouteNames = routeNames ?? builtInAttractions.map(destination => destination.name)
  const routeDestinations = builtInAttractions.filter(destination => selectedRouteNames.includes(destination.name))
  const routePositions = routeDestinations.filter(destination => typeof destination.latitude === 'number' && typeof destination.longitude === 'number').map(destination => [destination.latitude as number, destination.longitude as number] as [number, number])
  const visibleDestinations = showRoute ? routeDestinations : safeDestinations

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom style={{height: '100%'}}>
      <TileLayer
        url={satellite ? satelliteUrl : tileUrl}
        attribution={mapboxToken ? '&copy; Mapbox' : '&copy; OpenStreetMap contributors'}
        id={mapboxToken ? 'mapbox/streets-v11' : undefined}
        tileSize={mapboxToken ? 512 : 256}
        zoomOffset={mapboxToken ? -1 : 0}
      />
      <MapControls satellite={satellite} setSatellite={setSatellite} />
      <LocationMarker />

      {visibleDestinations.filter(d => typeof d.latitude === 'number' && typeof d.longitude === 'number').map(d => (
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
      {showRoute && routePositions.length > 1 && <Polyline positions={routePositions} pathOptions={{ color: '#8b75ec', weight: 5, opacity: 0.9 }} />}
    </MapContainer>
  )
}

function tileUrlForMap(mapboxToken?: string) {
  return mapboxToken
    ? `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}
