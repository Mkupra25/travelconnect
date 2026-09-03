import { FormEvent, useState } from 'react'

type Language = 'en' | 'ka' | 'ru' | 'es'
type Props = { language: Language; onTripCreated?: () => void }

const places = [
  { name: 'Narikala Fortress', kind: 'History · Viewpoint', time: '10:00 – 11:30', rating: 4.8, image: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=900&q=80' },
  { name: 'Fabrika Courtyard', kind: 'Food · Local culture', time: '13:00 – 14:30', rating: 4.6, image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=900&q=80' },
  { name: 'Abanotubani Baths', kind: 'Wellness · Landmark', time: '17:30 – 19:00', rating: 4.7, image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&w=900&q=80' },
]

const labels = {
  en: { title: 'Build a trip around you', lead: 'Tell Compass what you enjoy and it will shape a realistic day, not just a list of cities.', country: 'Country', city: 'City', interests: 'What are you interested in?', activity: 'What would you rather do?', time: 'When do you like to go out?', budget: 'Daily budget (USD)', make: 'Create my route', picks: 'Your first-day picks', add: 'Add to route', added: 'Added to your route' },
  ka: { title: 'შექმენი შენზე მორგებული მოგზაურობა', lead: 'მოგვიყევი ინტერესების შესახებ და Compass შექმნის რეალისტურ მარშრუტს.', country: 'ქვეყანა', city: 'ქალაქი', interests: 'რა გაინტერესებს?', activity: 'რას ისურვებდი?', time: 'როდის გირჩევნია გასვლა?', budget: 'დღიური ბიუჯეტი (USD)', make: 'მარშრუტის შექმნა', picks: 'შენი პირველი დღის არჩევანი', add: 'მარშრუტში დამატება', added: 'მარშრუტს დაემატა' },
  ru: { title: 'Создайте поездку для себя', lead: 'Расскажите Compass о своих интересах — он составит реалистичный маршрут на день.', country: 'Страна', city: 'Город', interests: 'Что вам интересно?', activity: 'Что вы предпочитаете?', time: 'Когда хотите выходить?', budget: 'Дневной бюджет (USD)', make: 'Создать маршрут', picks: 'Идеи на первый день', add: 'Добавить в маршрут', added: 'Добавлено в маршрут' },
  es: { title: 'Crea un viaje a tu medida', lead: 'Cuéntale a Compass qué te gusta y preparará un día realista, no solo una lista de ciudades.', country: 'País', city: 'Ciudad', interests: '¿Qué te interesa?', activity: '¿Qué prefieres hacer?', time: '¿Cuándo te gusta salir?', budget: 'Presupuesto diario (USD)', make: 'Crear mi ruta', picks: 'Ideas para tu primer día', add: 'Añadido a la ruta', added: 'Añadido a la ruta' },
} as const

export default function Planner({ language, onTripCreated }: Props) {
  const t = labels[language]
  const [interests, setInterests] = useState<string[]>(['Food'])
  const [activity, setActivity] = useState('Explore at my pace')
  const [dayTime, setDayTime] = useState('Morning to evening')
  const [created, setCreated] = useState(false)
  const [added, setAdded] = useState<string[]>([])
  const toggle = (item: string) => setInterests((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])
  const submit = (event: FormEvent) => { event.preventDefault(); setCreated(true); onTripCreated?.() }
  return <div className="planner-content detailed-planner"><span className="eyebrow">COMPASS TRIP BUILDER</span><h2>{t.title}</h2><p className="planner-lead">{t.lead}</p><form onSubmit={submit}>
    <div className="destination-row"><label>{t.country}<input defaultValue="Georgia" /></label><label>{t.city}<input defaultValue="Tbilisi" /></label><label>{t.budget}<input type="number" defaultValue="80" min="0" /></label></div>
    <fieldset><legend>{t.interests}</legend><div className="choice-row">{['Food', 'History', 'Nature', 'Art', 'Nightlife', 'Wellness'].map((item) => <button type="button" className={interests.includes(item) ? 'selected' : ''} onClick={() => toggle(item)} key={item}>{item}</button>)}</div></fieldset>
    <div className="preference-grid"><fieldset><legend>{t.activity}</legend>{['Explore at my pace', 'See the highlights', 'Meet locals'].map((item) => <label className="radio" key={item}><input type="radio" checked={activity === item} onChange={() => setActivity(item)} />{item}</label>)}</fieldset><fieldset><legend>{t.time}</legend>{['Early morning', 'Morning to evening', 'Late afternoon & night'].map((item) => <label className="radio" key={item}><input type="radio" checked={dayTime === item} onChange={() => setDayTime(item)} />{item}</label>)}</fieldset></div><button className="build-route" type="submit">✦ {t.make}</button></form>
    {created && <section className="place-suggestions"><div><span className="eyebrow">CUSTOM PICKS</span><h3>{t.picks}</h3></div><div className="place-grid">{places.map((place) => <article className="place-suggestion" key={place.name}><img src={place.image} alt={place.name} /><div><span>{place.time}</span><h4>{place.name}</h4><p>{place.kind} · ★ {place.rating}</p><button onClick={() => setAdded((current) => current.includes(place.name) ? current : [...current, place.name])}>{added.includes(place.name) ? `✓ ${t.added}` : `+ ${t.add}`}</button></div></article>)}</div></section>}
  </div>
}
