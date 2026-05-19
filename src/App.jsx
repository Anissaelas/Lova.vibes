import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, Search, Plus, ArrowLeft, Armchair, Utensils, Camera, CheckCircle, Globe, Instagram, Bookmark } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

const TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails/Mocktails', 'Fine dining', 'Affordable luxury', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance', 'Sunset view', 'Golden hour spot', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book'],
  'Beach Club': ['Infinity pool', 'Daybed rental required', 'Sunset view', 'Adults only', 'Golden hour spot', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book', 'Party', 'Quiet', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails/Mocktails', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Hidden gem', 'DJ'],
  'Hotel': ['View from bed', 'Outdoor bathtub / Jacuzzi', 'Private pool', 'Aesthetic bathroom', 'Boutique hotel', 'Adults only', 'All-inclusive luxury', 'Rooftop pool', 'Rooftop Bar', 'Instagrammable lobby', 'Spa & Wellness', 'Day pass available', 'Workation friendly']
};

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [view, setView] = useState('home');
  const [activeSpot, setActiveSpot] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => { setUser(u); if (u) fetchSpots(); });
  }, []);

  const fetchSpots = async () => {
    const snapshot = await getDocs(collection(db, "spots"));
    setSpots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-[#FFFEE0] pb-24 font-sans">
      {view === 'home' && <HomeView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'all' && <CityListView spots={spots} onSelectCity={(c) => { setActiveSpot(c); setView('city_spots'); }} onAdd={() => setView('add')} />}
      {view === 'city_spots' && <CitySpotsView spots={spots} city={activeSpot} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} onBack={() => setView('all')} />}
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} onReview={() => setView('review')} />}
      {view === 'review' && <ReviewView spot={activeSpot} onBack={() => setView('detail')} onDone={() => { fetchSpots(); setView('detail'); }} />}
      {view === 'add' && <AddSpotView onBack={() => setView('all')} onAdded={() => { fetchSpots(); setView('all'); }} />}
      {view === 'saved' && <div className="p-10 text-center">My Lists (In opbouw)</div>}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')} className={view === 'all' ? 'text-[#FF1493]' : 'text-gray-400'}><LayoutGrid /></button>
        <button onClick={() => setView('home')} className={view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'}><Compass /></button>
        <button onClick={() => setView('saved')} className={view === 'saved' ? 'text-[#FF1493]' : 'text-gray-400'}><Heart /></button>
        <button onClick={() => setView('profile')} className={view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'}><User /></button>
      </nav>
    </div>
  );
}

// HOME: Top 10, Just Opened, Coming Soon
function HomeView({ spots, onSelect }) {
  const top10 = [...spots].sort((a,b) => ((b.rating?.food + b.rating?.vibe)/2) - ((a.rating?.food + a.rating?.vibe)/2)).slice(0,10);
  return (
    <div className="p-5">
      <h1 className="text-3xl font-black text-[#FF1493] mb-6">LOQA.</h1>
      <Section title="Top 10 Global 🌟" spots={top10} onSelect={onSelect} />
      <Section title="Just Opened 🔥" spots={spots.filter(s => s.status === 'just_opened')} onSelect={onSelect} />
      <Section title="Coming Soon ⏳" spots={spots.filter(s => s.status === 'coming_soon')} onSelect={onSelect} />
    </div>
  );
}

function Section({ title, spots, onSelect }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {spots.map(s => <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl border shadow-sm"><img src={s.image} className="w-full h-32 object-cover rounded-lg mb-2"/><p className="font-bold text-sm truncate">{s.name}</p></div>)}
      </div>
    </div>
  );
}

// ALL: Cities as Blocks
function CityListView({ spots, onSelectCity, onAdd }) {
  const cities = [...new Set(spots.map(s => s.city))];
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Ontdek steden</h2>
        <button onClick={onAdd} className="bg-[#222222] text-white p-2 rounded-xl"><Plus /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cities.map(city => (
            <div key={city} onClick={() => onSelectCity(city)} className="h-40 bg-gray-200 rounded-3xl flex items-center justify-center font-black text-white text-xl shadow-md cursor-pointer">
                {city}
            </div>
        ))}
      </div>
    </div>
  );
}

// DETAIL: Full details
function DetailView({ spot, onBack, onReview }) {
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4 bg-white p-2 rounded-full"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl border">
        <h1 className="text-3xl font-black">{spot.name}</h1>
        <p className="font-bold mb-4">{spot.city} • {spot.type}</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
            <a href={spot.websiteUrl} className="bg-gray-100 p-2 rounded-lg text-center text-[10px] font-bold">WEB</a>
            <a href={spot.instagramUrl} className="bg-gray-100 p-2 rounded-lg text-center text-[10px] font-bold">IG</a>
            <a href={spot.addressUrl} className="bg-gray-100 p-2 rounded-lg text-center text-[10px] font-bold">MAP</a>
        </div>
        <button onClick={onReview} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Have you been?</button>
      </div>
    </div>
  );
}

// REVIEW: Advanced with Photo Upload and Vibe Tags
function ReviewView({ spot, onBack, onDone }) {
  const [selected, setSelected] = useState([]);
  const [activePhotoTab, setPhotoTab] = useState('view');
  const toggle = (t) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="p-5 pb-20">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Review: {spot.name}</h2>
      
      <div className="mb-6 bg-white p-4 rounded-2xl">
        <div className="flex gap-2 mb-4">
            {['view', 'interior', 'food'].map(t => <button onClick={() => setPhotoTab(t)} className={`flex-1 p-2 rounded-lg font-bold text-xs ${activePhotoTab === t ? 'bg-[#FF1493] text-white' : 'bg-gray-100'}`}>{t}</button>)}
        </div>
        <input type="file" className="w-full text-xs mb-2" />
        {activePhotoTab === 'view' && <input className="w-full p-2 border rounded" placeholder="Tijdstip (bijv 19:30)" />}
        {activePhotoTab === 'food' && <input className="w-full p-2 border rounded" placeholder="Naam gerecht" />}
      </div>

      <div className="flex flex-wrap gap-2">
        {(TAGS[spot.type] || TAGS['Restaurant']).map(t => <button key={t} onClick={() => toggle(t)} className={`p-2 rounded-lg text-[10px] font-bold border ${selected.includes(t) ? 'bg-[#FF1493] text-white' : 'bg-white'}`}>{t}</button>)}
      </div>
      <button onClick={onDone} className="w-full bg-[#222222] text-white mt-8 p-4 rounded-xl font-bold">Opslaan</button>
    </div>
  );
}

// ADD SPOT
function AddSpotView({ onBack, onAdded }) {
  const [data, setData] = useState({ name: '', city: '', type: 'Restaurant', status: 'live' });
  const save = async () => { await addDoc(collection(db, "spots"), data); onAdded(); };
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Nieuwe plek toevoegen</h2>
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Naam" onChange={e => setData({...data, name: e.target.value})} />
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Stad" onChange={e => setData({...data, city: e.target.value})} />
      <select className="w-full p-4 mb-6 rounded-xl border" onChange={e => setData({...data, type: e.target.value})}>
        <option>Restaurant</option><option>Hotel</option><option>Beach Club</option><option>Lunch</option><option>Breakfast</option>
      </select>
      <button onClick={save} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Plek opslaan</button>
    </div>
  );
}

// PROFILE
function ProfileView({ onRefresh }) {
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Beheer</h2>
      <button onClick={onRefresh} className="w-full bg-white p-4 rounded-xl font-bold border mb-4">Ververs Firebase Data</button>
      <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold">Log uit</button>
    </div>
  );
}

// AUTH
function AuthScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFFEE0]">
      <h1 className="text-5xl font-black text-[#FF1493] mb-10">LOQA.</h1>
      <input className="w-full max-w-xs p-4 mb-3 rounded-xl border" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" className="w-full max-w-xs p-4 mb-6 rounded-xl border" placeholder="Wachtwoord" onChange={e => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full max-w-xs bg-[#222222] text-white p-4 rounded-xl font-bold">Inloggen</button>
    </div>
  );
}
