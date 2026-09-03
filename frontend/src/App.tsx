import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import MapView from './pages/MapView'
import Planner from './pages/Planner'
import './theme.css'
import './fixes.css'
import './layout.css'

type Section = 'home' | 'plan' | 'map' | 'visited' | 'friends' | 'profile'
type AuthPage = 'login' | 'register'
type Language = 'en' | 'ka' | 'ru' | 'es'
type Message = { id: number; role: 'assistant' | 'user'; text: string }
type User = { first_name: string; last_name: string; email: string; role?: string }

const stops = [
  { time: '10:00', name: 'Narikala Fortress', note: 'Walk and viewpoint' },
  { time: '13:00', name: 'Fabrika Courtyard', note: 'Lunch reservation' },
  { time: '17:30', name: 'Abanotubani Baths', note: 'Booked - 90 minutes' },
]
const ideas = [
  ['Tbilisi old town', 'Culture and food', 'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=900&q=80'],
  ['Kazbegi mountains', 'Nature day', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'],
  ['Kakheti wine road', 'Weekend escape', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80'],
]

function Landing({ go }: { go: (path: string) => void }) {
  return <main className="landing-page"><nav className="landing-nav"><button className="brand" onClick={() => go('/')}><span className="brand-mark">T</span><span>travelconnect</span></button><button className="text-button" onClick={() => go('/login')}>Log in</button></nav><section className="landing-hero"><div><span className="eyebrow">YOUR TRAVEL, YOUR PEOPLE</span><h1>Plan together.<br /><em>Travel deeper.</em></h1><p>Turn shared ideas into thoughtful routes, memorable places, and stories worth bringing home.</p><div className="landing-actions"><button className="primary-action" onClick={() => go('/login')}>Log in <span>↗</span></button><button className="outline-action" onClick={() => go('/register')}>Create an account</button></div></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1200&q=85" alt="Friends sharing a meal while travelling" /><div className="floating-note"><strong>Today in Tbilisi</strong><span>3 stops · 4.2 km · with friends</span></div></div></section><section className="landing-features"><div><span>01</span><h3>Compass AI</h3><p>Shape a day around your pace, taste, and real budget.</p></div><div><span>02</span><h3>Routes that breathe</h3><p>See every stop and the path between them, at a glance.</p></div><div><span>03</span><h3>Travel in company</h3><p>Share plans, discover communities, and decide together.</p></div></section></main>
}

function AuthPage({ mode, onSuccess, go }: { mode: AuthPage; onSuccess: () => void; go: (path: string) => void }) {
  const register = mode === 'register'
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '', role: 'tourist', terms: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const update = (key: string, value: string | boolean) => setValues(current => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (register && !values.name.trim()) next.name = 'Enter your name.'
    if (!values.email.match(/^\S+@\S+\.\S+$/)) next.email = 'Enter a valid email address.'
    if (values.password.length < 8) next.password = 'Use at least 8 characters.'
    if (register && values.confirm !== values.password) next.confirm = 'Passwords do not match.'
    if (register && !values.terms) next.terms = 'Accept the terms to continue.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      if (register) {
        const [firstName, ...lastNameParts] = values.name.trim().split(/\s+/)
        await axios.post('/api/auth/register', {
          first_name: firstName,
          last_name: lastNameParts.join(' ') || firstName,
          email: values.email.trim(),
          password: values.password,
          role: values.role,
        })
      }
      const body = new URLSearchParams({ username: values.email.trim(), password: values.password })
      const response = await axios.post('/api/auth/token', body, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      localStorage.setItem('travelconnect-token', response.data.access_token)
      onSuccess()
    } catch (error) {
      const message = axios.isAxiosError(error) && typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'We could not complete that request. Please try again.'
      setErrors({ form: message })
    } finally {
      setSubmitting(false)
    }
  }
  return <main className="auth-page"><button className="brand auth-brand" onClick={() => go('/')}><span className="brand-mark">T</span><span>travelconnect</span></button><form className="auth-card" onSubmit={submit}><span className="eyebrow">{register ? 'JOIN THE NETWORK' : 'WELCOME BACK'}</span><h1>{register ? 'Make room for more journeys.' : 'Pick up where you left off.'}</h1><p>{register ? 'Your next shared route starts here.' : 'Your routes, people, and places are waiting.'}</p>{errors.form && <small className="field-error">{errors.form}</small>}{register && <label>Name<input value={values.name} onChange={e => update('name', e.target.value)} placeholder="Alex Morgan" />{errors.name && <small className="field-error">{errors.name}</small>}</label>}<label>Email<input type="email" value={values.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />{errors.email && <small className="field-error">{errors.email}</small>}</label><label>Password<input type="password" value={values.password} onChange={e => update('password', e.target.value)} placeholder="At least 8 characters" />{errors.password && <small className="field-error">{errors.password}</small>}</label>{register && <label>Confirm password<input type="password" value={values.confirm} onChange={e => update('confirm', e.target.value)} placeholder="Repeat your password" />{errors.confirm && <small className="field-error">{errors.confirm}</small>}</label>}{register && <fieldset className="role-choice"><legend>Account type</legend><label><input type="radio" name="role" value="tourist" checked={values.role === 'tourist'} onChange={e => update('role', e.target.value)} /> Tourist</label><label><input type="radio" name="role" value="business" checked={values.role === 'business'} onChange={e => update('role', e.target.value)} /> Business</label></fieldset>}{register && <label className="terms"><input type="checkbox" checked={values.terms} onChange={e => update('terms', e.target.checked)} /> I agree to the terms and community guidelines</label>}{errors.terms && <small className="field-error">{errors.terms}</small>}{!register && <button type="button" className="forgot">Forgot password?</button>}<button className="primary-action auth-submit" type="submit" disabled={submitting}>{submitting ? 'Connecting...' : register ? 'Create account' : 'Log in'} {!submitting && <span>↗</span>}</button><p className="auth-switch">{register ? 'Already have an account?' : 'New to TravelConnect?'} <button type="button" onClick={() => go(register ? '/login' : '/register')}>{register ? 'Log in' : 'Register'}</button></p></form></main>
}

function ProfilePage({ user, image, onSave }: { user: User | null; image: string; onSave: (name: string, nextImage: string) => void }) {
  const [name, setName] = useState(user ? `${user.first_name} ${user.last_name}` : '')
  const [nextImage, setNextImage] = useState(image)
  const [saved, setSaved] = useState(false)
  const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'TC'
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setNextImage(String(reader.result))
    reader.readAsDataURL(file)
  }
  const save = (event: FormEvent) => { event.preventDefault(); onSave(name.trim(), nextImage); setSaved(true) }
  return <main className="profile-page"><div className="profile-heading"><span className="eyebrow">ACCOUNT SETTINGS</span><h1>Your profile</h1><p>Keep your identity, account details, and security status in one place.</p></div><form className="profile-layout" onSubmit={save}><section className="profile-preview"><div className="large-avatar">{nextImage ? <img src={nextImage} alt="Your profile" /> : initials}</div><label className="upload-button">Upload picture<input type="file" accept="image/*" onChange={upload} /></label><p>JPG, PNG, or GIF · stored locally in this browser</p></section><section className="profile-form"><label>Display name<input value={name} onChange={event => setName(event.target.value)} required /></label><label>Email address<input value={user?.email ?? ''} readOnly /></label><label>Account type<input value={user?.role === 'business' ? 'Business' : 'Tourist'} readOnly /></label><div className="security-status"><span className="status-dot" /><div><strong>Password protected</strong><p>Your password is hashed and secured by the TravelConnect API.</p></div></div><div className="profile-actions"><button className="primary-action" type="submit">Save profile</button>{saved && <span className="save-confirmation">Profile saved</span>}</div></section></form><section className="profile-details"><h2>Account overview</h2><div><span>Places visited</span><strong>12</strong></div><div><span>Saved ideas</span><strong>31</strong></div><div><span>Friends</span><strong>48</strong></div></section></main>
}

function InfoPage({ page }: { page: string }) {
  const copy: Record<string, [string, string]> = { about: ['About TravelConnect', 'TravelConnect helps people turn shared ideas into thoughtful routes, memorable places, and stories worth bringing home.'], safety: ['Safety', 'Meet in public places, keep your plans visible to trusted friends, and report anything that feels unsafe.'], help: ['Help center', 'Find answers about routes, profiles, Compass, account settings, and sharing your plans.'], privacy: ['Privacy', 'Your account details stay with your TravelConnect profile. We only use information needed to operate your routes and community.'] }
  const [title, description] = copy[page] ?? copy.about
  return <main className="info-page"><span className="eyebrow">TRAVELCONNECT</span><h1>{title}</h1><p>{description}</p></main>
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [dark, setDark] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [destinations, setDestinations] = useState(['Narikala Fortress', 'Fabrika Courtyard', 'Abanotubani Baths'])
  const [community, setCommunity] = useState('')
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('travelconnect-profile-image') ?? '')
  const [chatMessages, setChatMessages] = useState<Message[]>([{ id: 1, role: 'assistant', text: 'I am Compass. What kind of trip would make you happy today?' }])
  const authenticated = Boolean(localStorage.getItem('travelconnect-token'))
  const [user, setUser] = useState<User | null>(null)
  const section = (['home', 'plan', 'map', 'visited', 'friends', 'profile'] as Section[]).includes(path.slice(1) as Section) ? path.slice(1) as Section : 'home'
  const infoPage = (['about', 'safety', 'help', 'privacy'] as string[]).includes(path.slice(1)) ? path.slice(1) : null
  const go = (next: string) => { window.history.pushState({}, '', next); setPath(next) }
  useEffect(() => { const handlePop = () => setPath(window.location.pathname); window.addEventListener('popstate', handlePop); return () => window.removeEventListener('popstate', handlePop) }, [])
  useEffect(() => {
    if (!authenticated) return
    axios.get<User>('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('travelconnect-token')}` } }).then(response => setUser(response.data)).catch(() => { localStorage.removeItem('travelconnect-token'); setUser(null); go('/') })
  }, [authenticated])
  if (!authenticated && path !== '/login' && path !== '/register') return infoPage ? <InfoPage page={infoPage} /> : <Landing go={go} />
  if (!authenticated) return <AuthPage mode={path.slice(1) as AuthPage} go={go} onSuccess={() => go('/')} />
  const logout = () => { localStorage.removeItem('travelconnect-token'); go('/') }
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Loading profile...'
  const initials = user ? `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() : 'TC'
  const saveProfile = (name: string, image: string) => { const [firstName, ...lastNameParts] = name.split(/\s+/); setUser(current => current ? { ...current, first_name: firstName, last_name: lastNameParts.join(' ') || firstName } : current); setProfileImage(image); localStorage.setItem('travelconnect-profile-image', image) }
  const routeDetails = [{ time: '10:00', name: 'Narikala Fortress', cost: 0 }, { time: '13:00', name: 'Fabrika Courtyard', cost: 28 }, { time: '17:30', name: 'Abanotubani Baths', cost: 35 }]
  const routeTotal = routeDetails.reduce((total, stop) => total + stop.cost, 0)
  const send = async (event: FormEvent) => { event.preventDefault(); if (!input.trim()) return; const requestText = input; const next = [...chatMessages, { id: Date.now(), role: 'user' as const, text: requestText }]; setChatMessages(next); setInput(''); setLoading(true); try { const response = await axios.post('/api/ai/chat', { messages: next.map(({ role, text }) => ({ role, text })), context: { city: 'Tbilisi', route: routeDetails, estimated_route_total_usd: routeTotal } }); const reply = response.data.reply as string; setChatMessages(current => [...current, { id: Date.now(), role: 'assistant', text: reply }]); const knownStops = routeDetails.map(stop => stop.name).filter(name => reply.toLowerCase().includes(name.toLowerCase())); const asksForMap = /\b(show|open|view|see|take me).{0,40}\b(map|route)\b/i.test(requestText) || /\b(show|open|view|see).{0,40}\b(map|route)\b/i.test(reply); if (asksForMap) { if (knownStops.length > 1) setDestinations(knownStops); go('/map') } } catch { setChatMessages(current => [...current, { id: Date.now(), role: 'assistant', text: 'Compass is offline. Try again in a moment.' }]) } finally { setLoading(false) } }
  const home = <main className="dashboard fuller-home"><aside className="left-rail"><section className="profile-card"><div className="cover" /><div className="profile-avatar">{profileImage ? <img src={profileImage} alt={`${displayName} profile`} /> : initials}</div><h2>{displayName}</h2><p>Tbilisi, Georgia</p><div className="profile-stats"><button><strong>12</strong><span>places</span></button><button><strong>31</strong><span>saved</span></button><button><strong>48</strong><span>friends</span></button></div></section></aside><section className="home-center"><section className="hero-home"><span className="eyebrow">PLAN BETTER, TRAVEL DEEPER</span><h1>Your next great day starts here.</h1><p>Build a route around what you want to eat, see, feel and remember.</p><button onClick={() => go('/plan')}>Start planning</button><button className="secondary" onClick={() => go('/map')}>Open my route</button></section><section className="chat-panel compact-chat"><div className="chat-header"><div><span className="eyebrow">COMPASS AI</span><h2>Ask your travel companion</h2></div></div><div className="messages">{chatMessages.map(message => <div className={`message ${message.role}`} key={message.id}><div className="message-icon">{message.role === 'assistant' ? 'AI' : profileImage ? <img src={profileImage} alt={`${displayName} profile`} /> : initials}</div><div>{message.text}</div></div>)}{loading && <div className="message assistant"><div className="message-icon">AI</div><div>Thinking...</div></div>}</div><form className="composer" onSubmit={send}><input value={input} onChange={event => setInput(event.target.value)} placeholder={`Ask ${displayName === 'Loading profile...' ? 'Compass' : displayName} for an itinerary, food, hotels, or ideas`} /><button type="submit">Ask Compass</button></form></section><section className="discover-section"><span className="eyebrow">EXPLORE GEORGIA</span><h2>Good ideas for your next free day</h2><div className="destination-grid">{ideas.map(([name, tag, image]) => <article className="destination-card" key={name}><img src={image} alt={name} /><span>{tag}</span><h3>{name}</h3><button onClick={() => go('/plan')}>Build around this ↗</button></article>)}</div></section></section><aside className="right-rail"><section className="rail-card"><span className="eyebrow">NEXT UP</span>{stops.map(stop => <div className="trip-row" key={stop.name}><span className="route-time">{stop.time}</span><div><strong>{stop.name}</strong><small>{stop.note}</small></div></div>)}</section></aside></main>
  const route = <section className="route-page"><div className="route-sidebar"><span className="eyebrow">TUESDAY, 12 SEPTEMBER</span><h1>Your Tbilisi route</h1><p className="route-summary">{destinations.length} stops · 4.2 km · walking and taxi</p><label className="add-destination">Add a destination<select onChange={event => event.target.value && !destinations.includes(event.target.value) && setDestinations([...destinations, event.target.value])} defaultValue=""><option value="">Choose a place</option><option>Mtatsminda Park</option><option>National Botanical Garden</option><option>Dry Bridge Market</option></select></label><div className="itinerary-list">{destinations.map((name, index) => <article key={name}><time>{['10:00', '13:00', '17:30', '20:00'][index] || 'Any time'}</time><div><span className="timeline-dot">{index + 1}</span><h3>{name}</h3><p>{index === 0 ? 'Walk and viewpoint' : 'Added to your route'}</p><button onClick={() => setDestinations(destinations.filter(destination => destination !== name))}>Remove</button></div></article>)}</div></div><div className="route-map"><MapView showRoute routeNames={destinations} /></div></section>
  const visited = <section className="public-history"><span className="eyebrow">PUBLIC TRAVEL HISTORY</span><h1>Places Alex has visited</h1><p>Choose a route to see the places and path connected to it.</p><div className="history-layout"><div className="visited-list">{[['Tbilisi essentials', '3 places · September 12', 5], ['A slow Sunday', '2 places · August 28', 4], ['Georgia north', '4 places · July 14', 5]].map(([name, detail, stars]) => <article className="visited-place" key={name as string}><div className="visit-photo" /><div><span>COMPLETED ROUTE</span><h3>{name}</h3><p>{detail} · {'★'.repeat(stars as number)}</p><button onClick={() => go('/map')}>Open route ↗</button></div></article>)}</div><div className="mini-map"><MapView showRoute routeNames={destinations} /></div></div></section>
  const friends = <section className="friends-page"><aside className="discord-rail"><b>TC</b><button>+</button><button>G</button><button>B</button></aside><section className="friend-list"><div className="friend-search">Find a traveler</div><p>ONLINE - 3</p>{['Nino - planning Batumi', 'Luka - in Tbilisi', 'Mariam - exploring Spain'].map(friend => <button onClick={() => setCommunity(friend)} key={friend}><span className="online-avatar">{friend[0]}</span><span>{friend}</span></button>)}<p>COMMUNITIES</p>{['Georgia food lovers', 'Weekend hikers'].map(channel => <button onClick={() => setCommunity(channel)} key={channel}><span className="online-avatar">#</span><span>{channel}</span></button>)}</section><section className="friend-content"><span className="eyebrow">FRIEND ACTIVITY</span><h1>Travel together, even apart.</h1><div className="activity-card"><div className="online-avatar">N</div><div><h3>Nino is planning a Batumi weekend</h3><p>2 days · beach · local food</p><button onClick={() => setCommunity('Nino - planning Batumi')}>Open plan</button></div></div><div className="community-panel"><span className="eyebrow">{community ? 'OPEN COMMUNITY' : 'YOUR TRAVEL NETWORK'}</span><h2>{community || 'Pick a friend or channel'}</h2><div className="thread"><p><b>Nino</b> I found a tiny place near the beach.</p><p><b>You</b> Add it to the shared route?</p></div><form className="community-composer" onSubmit={event => event.preventDefault()}><input placeholder="Write a message" /><button type="submit">Send</button></form></div></section></section>
  const content = infoPage ? <InfoPage page={infoPage} /> : section === 'profile' ? <ProfilePage user={user} image={profileImage} onSave={saveProfile} /> : section === 'plan' ? <section className="full-page-panel planner-page"><Planner language={language} onTripCreated={() => go('/map')} /></section> : section === 'map' ? route : section === 'visited' ? visited : section === 'friends' ? friends : home
  return <div className={`app-shell ${dark ? 'dark' : 'light'}`}><header className="topbar"><button className="brand" onClick={() => go('/')}><span className="brand-mark">T</span><span>travelconnect</span></button><nav className="primary-nav">{([['Home', 'home'], ['Plan trip', 'plan'], ['My route', 'map'], ['Visited', 'visited'], ['Friends', 'friends']] as [string, Section][]).map(([label, value]) => <button className={section === value ? 'nav-item active' : 'nav-item'} onClick={() => go(`/${value}`)} key={value}>{label}</button>)}</nav><div className="topbar-actions"><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? '☼' : '☾'}</button><select className="language-select" value={language} onChange={event => setLanguage(event.target.value as Language)}><option value="en">English</option><option value="ka">Georgian</option><option value="ru">Russian</option><option value="es">Spanish</option></select><button className="logout-button" onClick={logout}>Log out</button><button className="avatar" onClick={() => go('/profile')} aria-label="Open profile">{profileImage ? <img src={profileImage} alt="" /> : initials}</button></div></header>{content}<footer className="site-footer"><div><b>travelconnect</b><p>Plan together. Travel deeper.</p></div><nav className="footer-links"><a href="/about">About</a><a href="/safety">Safety</a><a href="/help">Help center</a><a href="/privacy">Privacy</a></nav><small>© 2026 TravelConnect</small></footer></div>
}

export default App
