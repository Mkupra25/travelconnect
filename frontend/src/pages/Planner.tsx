import { FormEvent, useState } from 'react'
import axios from 'axios'

type Language = 'en' | 'ka' | 'ru' | 'es'
type Props = { language: Language; onTripCreated?: () => void }
const questions = [
  ['What would you rather do?', ['Explore at my pace', 'See the highlights']],
  ['When do you like to go out?', ['Early morning', 'Morning to evening', 'Late afternoon & night']],
  ['Who should this day feel like?', ['Meet locals', 'A quiet day for myself']],
  ['What kind of accommodation feels right?', ['Boutique hotel', 'Apartment with a kitchen', 'Social hostel']],
  ['How should we get around?', ['Walk as much as possible', 'Use taxis for comfort', 'Public transport and trains']],
  ['What is your food mood?', ['Local classics', 'Vegetarian and healthy', 'Fine dining and cocktails']],
  ['How much activity sounds good?', ['Slow and easy', 'A balanced mix', 'Full days with a challenge']],
  ['What should the trip feel like?', ['Romantic and scenic', 'Family-friendly', 'Social and spontaneous']],
  ['How much structure do you want?', ['A clear plan', 'A few anchors and free time', 'Decide as we go']],
  ['What is one thing to avoid?', ['Crowds', 'Long transfers', 'Late nights']],
] as const
const costs: Record<string, number> = { Food: 35, History: 18, Nature: 22, Art: 28, Nightlife: 42, Wellness: 38 }
const labels = { en: { title: 'Build a trip around you', lead: 'Tell Compass what you enjoy and it will shape a realistic day.', country: 'Country', city: 'City', interests: 'Choose your interests', budget: 'Daily budget (USD)', make: 'Create my route', picks: 'Your first-day picks', compass: 'Compass is listening' }, ka: { title: 'შექმენი შენზე მორგებული მოგზაურობა', lead: 'მოგვიყევი ინტერესების შესახებ და Compass შექმნის რეალისტურ მარშრუტს.', country: 'ქვეყანა', city: 'ქალაქი', interests: 'აირჩიე ინტერესები', budget: 'დღიური ბიუჯეტი (USD)', make: 'მარშრუტის შექმნა', picks: 'შენი პირველი დღის არჩევანი', compass: 'Compass გისმენს' }, ru: { title: 'Создайте поездку для себя', lead: 'Расскажите Compass о своих интересах — он составит реалистичный маршрут.', country: 'Страна', city: 'Город', interests: 'Выберите интересы', budget: 'Дневной бюджет (USD)', make: 'Создать маршрут', picks: 'Идеи на первый день', compass: 'Compass слушает' }, es: { title: 'Crea un viaje a tu medida', lead: 'Cuéntale a Compass qué te gusta y preparará un día realista.', country: 'País', city: 'Ciudad', interests: 'Elige tus intereses', budget: 'Presupuesto diario (USD)', make: 'Crear mi ruta', picks: 'Ideas para tu primer día', compass: 'Compass escucha' } } as const

export default function Planner({ language, onTripCreated }: Props) {
  const t = labels[language]
  const [interests, setInterests] = useState<string[]>(['Food'])
  const [budget, setBudget] = useState(80)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [created, setCreated] = useState(false)
  const [added, setAdded] = useState(false)
  const [aiComment, setAiComment] = useState('Choose a pace and Compass will comment on the customer\'s trip as it takes shape.')
  const [aiLoading, setAiLoading] = useState(false)
  const estimated = interests.reduce((total, interest) => total + costs[interest], 0) + 12
  const askCompass = async (context: string) => {
    setAiComment(context)
    setAiLoading(true)
    try {
      const response = await axios.post('/api/ai/chat', { messages: [{ role: 'user', text: `I am a travel agent collecting customer preferences. Give one concise, practical recommendation based on: ${context}` }] })
      setAiComment(response.data.reply)
    } catch {
      setAiComment(context)
    } finally {
      setAiLoading(false)
    }
  }
  const toggle = (interest: string) => {
    const next = interests.includes(interest) ? interests.filter(value => value !== interest) : [...interests, interest]
    setInterests(next)
    askCompass(`Interests: ${next.join(', ') || 'none'}. Daily budget: $${budget}.`)
  }
  const choose = (questionIndex: number, answer: string) => {
    const next = { ...answers, [questionIndex]: answer }
    setAnswers(next)
    askCompass(`Interests: ${interests.join(', ')}. Daily budget: $${budget}. Customer answer: ${questions[questionIndex][0]} = ${answer}.`)
  }
  const submit = (event: FormEvent) => { event.preventDefault(); setCreated(true); onTripCreated?.() }
  const budgetAdvice = budget < estimated ? `At $${budget}/day, Compass would swap one paid stop for a free viewpoint.` : `Your $${budget}/day budget leaves room for a relaxed meal and one memorable extra.`
  return <div className="planner-content detailed-planner"><div className="planner-main"><span className="eyebrow">COMPASS TRIP BUILDER</span><h2>{t.title}</h2><p className="planner-lead">{t.lead}</p><div className="planner-progress"><span className="current">Your trip, your rhythm</span><span>{Object.keys(answers).length + 1} of {questions.length + 2} answered</span></div><form onSubmit={submit}><div className="destination-row"><label>{t.country}<input defaultValue="Georgia" required /></label><label>{t.city}<input defaultValue="Tbilisi" required /></label><label>{t.budget}<input type="number" value={budget} onChange={event => setBudget(Number(event.target.value))} onBlur={() => askCompass(`Interests: ${interests.join(', ')}. Daily budget changed to $${budget}.`)} min="0" required /></label></div><fieldset><legend>{t.interests}</legend><div className="choice-row">{Object.keys(costs).map(interest => <button type="button" className={interests.includes(interest) ? 'selected' : ''} onClick={() => toggle(interest)} key={interest}>{interest}</button>)}</div></fieldset>{questions.map(([question, options], questionIndex) => <fieldset className="question-card" key={question}><legend>Question {questionIndex + 1}</legend><h3>{question}</h3><div className="choice-row">{options.map(option => <button type="button" className={answers[questionIndex] === option ? 'selected' : ''} onClick={() => choose(questionIndex, option)} key={option}>{option}</button>)}</div></fieldset>)}{budget < estimated && <div className="budget-warning"><strong>${budget}/day is tight for this combination.</strong><p>These interests in Tbilisi are estimated at about ${estimated}/day.</p><div><button type="button" onClick={() => setInterests(current => current.filter(interest => interest !== 'Nightlife' && interest !== 'Wellness'))}>Choose lower-cost activities</button><button type="button" onClick={() => setBudget(estimated)}>Adjust budget to ${estimated}</button></div></div>}<button className="build-route" type="submit">{t.make} ↗</button></form>{created && <section className="place-suggestions"><span className="eyebrow">{t.picks}</span><div className="planner-result"><strong>Narikala Fortress → Fabrika Courtyard → Abanotubani Baths</strong><span>Balanced walking route · adjusted for your interests</span><button type="button" onClick={() => setAdded(true)}>{added ? '✓ Route added' : 'Add this route'}</button></div></section>}</div><aside className="compass-recommendation"><div className="compass-orb">✦</div><span className="eyebrow">{t.compass}</span><h3>{aiLoading ? 'Compass is refining this...' : 'Your route is taking shape.'}</h3><p>{aiComment}</p><div className="recommendation-line"><span>Budget read</span><strong>{budgetAdvice}</strong></div><div className="recommendation-line"><span>Next thought</span><strong>{answers[0] ? `A ${answers[0].toLowerCase()} day pairs well with ${answers[1] ? answers[1].toLowerCase() : 'a flexible afternoon'}.` : 'Choose the pace that feels most like you.'}</strong></div><div className="recommendation-stop"><span>Compass pick</span><strong>{budget < estimated ? 'Dry Bridge Market' : 'Fabrika Courtyard'}</strong><small>{budget < estimated ? 'A lively, lower-cost stop' : 'Local food and easy conversation'}</small></div></aside></div>
}
