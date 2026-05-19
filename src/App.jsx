import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, Search, Plus, ArrowLeft, Flame, Globe, Instagram, Map } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, setDoc, doc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [view, setView] = useState('home');
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCity, setActiveCity] = useState(null);

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
      {view === 'all' && <CityListView spots={spots} onSelectCity={(c) => { setActiveCity(c); setView('city_spots'); }} onAdd={() => setView('add')} />}
      {view === 'city_spots' && <CitySpotsView spots={spots} city={activeCity} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} onBack={() => setView('all')} />}
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} />}
      {view === 'add' && <AddSpotView onBack={() => setView('all')} onAdded={() => { fetchSpots(); setView('all'); }} />}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')}><LayoutGrid className={view === 'all' ? 'text-[#FF1493]' : 'text-gray-400'} /></button>
        <button onClick={() => setView('home')}><Compass className={view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'} /></button>
        <button onClick={() => setView('profile')}><User className={view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'} /></button>
      </nav>
    </div>
  );
}

// 1. HOME: Secties
function HomeView({ spots, onSelect }) {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-black text-[#FF1493] mb-6">LOQA.</h1>
      <Section title="Just Opened 🔥" spots={spots.filter(s => s.status === 'just_opened')} onSelect={onSelect} />
      <Section title="Coming Soon ⏳" spots={spots.filter(s => s.status === 'coming_soon')} onSelect={onSelect} />
    </div>
  );
}

// 2. ALL: Stedenlijst
function CityListView({ spots, onSelectCity, onAdd }) {
  const cities = [...new Set(spots.map(s => s.city))];
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Ontdek steden</h2>
        <button onClick={onAdd} className="bg-[#222222] text-white p-2 rounded-xl"><Plus /></button>
      </div>
      {cities.map(city => (
        <div key={city} onClick={() => onSelectCity(city)} className="bg-white p-6 mb-3 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer">
          <span className="font-bold text-lg">{city}</span>
          <ChevronLeft className="rotate-180 text-gray-400" />
        </div>
      ))}
    </div>
  );
}

// 3. CITY SPOTS: Plekken filteren per stad
function CitySpotsView({ spots, city, onSelect, onBack }) {
  const [cat, setCat] = useState('All');
  const filtered = spots.filter(s => s.city === city && (cat === 'All' || s.type === cat));
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-4">{city}</h2>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
        {['All', 'Restaurant', 'Hotel', 'Beach Club'].map(c => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-xl text-xs font-bold ${cat === c ? 'bg-[#FF1493] text-white' : 'bg-white border'}`}>{c}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-3 rounded-2xl border"><p className="font-bold">{s.name}</p></div>)}
      </div>
    </div>
  );
}

// 4. DETAIL: Met alle links
function DetailView({ spot, onBack }) {
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4 bg-white p-2 rounded-full shadow-sm"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl border">
        <h1 className="text-3xl font-black mb-1">{spot.name}</h1>
        <p className="text-gray-500 mb-6 font-bold flex items-center gap-1"><MapPin size={16}/>{spot.city}</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {spot.websiteUrl && <a href={spot.websiteUrl} target="_blank" className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">WEB</a>}
          {spot.instagramUrl && <a href={spot.instagramUrl} target="_blank" className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">IG</a>}
          <a href={spot.addressUrl} target="_blank" className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">MAP</a>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl mb-6">
           <p className="text-xs text-gray-500 font-bold mb-1">SCORE</p>
           <p className="font-black text-xl text-[#FF1493]">Food: {spot.rating?.food || 5.0} | Vibe: {spot.rating?.vibe || 5.0}</p>
        </div>
      </div>
    </div>
  );
}

// 5. ADD: Plek toevoegen
function AddSpotView({ onBack, onAdded }) {
  const [data, setData] = useState({ name: '', city: '', type: 'Restaurant', status: 'live' });
  const save = async () => { await addDoc(collection(db, "spots"), data); onAdded(); };
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Voeg plek toe</h2>
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Naam" onChange={e => setData({...data, name: e.target.value})} />
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Stad" onChange={e => setData({...data, city: e.target.value})} />
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Website URL" onChange={e => setData({...data, websiteUrl: e.target.value})} />
      <button onClick={save} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Opslaan</button>
    </div>
  );
}
