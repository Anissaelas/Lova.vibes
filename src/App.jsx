import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, ChevronLeft, Plus, ArrowLeft } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
      {view === 'saved' && <MyListsView />}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')} className={view === 'all' ? 'text-black' : 'text-gray-400'}><LayoutGrid /></button>
        <button onClick={() => setView('home')} className={view === 'home' ? 'text-black' : 'text-gray-400'}><Compass /></button>
        <button onClick={() => setView('saved')} className={view === 'saved' ? 'text-black' : 'text-gray-400'}><Heart /></button>
        <button onClick={() => setView('profile')} className={view === 'profile' ? 'text-black' : 'text-gray-400'}><User /></button>
      </nav>
    </div>
  );
}

function SpotCard({ spot, onClick }) {
  return (
    <div onClick={() => onClick(spot)} className="min-w-[140px] bg-white p-2 rounded-2xl border shadow-sm cursor-pointer">
      <div className="h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden">
        {spot.image && <img src={spot.image} className="w-full h-full object-cover" alt={spot.name} />}
      </div>
      <p className="font-bold text-sm truncate">{spot.name}</p>
      <p className="text-[10px] text-gray-500">{spot.type}</p>
    </div>
  );
}

function HomeView({ spots, onSelect }) {
  const top10 = [...spots].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0,10);
  return (
    <div className="p-5">
      <h1 className="text-3xl font-black text-black mb-6">LOQA</h1>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Top 10 Global</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
            {top10.map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Just Opened</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
            {spots.filter(s => s.status === 'just_opened').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}
        </div>
      </div>
    </div>
  );
}

function CityListView({ spots, onSelectCity, onAdd }) {
  const cities = [...new Set(spots.map(s => s.city))];
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black">Ontdek steden</h2>
        <button onClick={onAdd} className="bg-black text-white p-2 rounded-xl"><Plus /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cities.map(city => (
            <div key={city} onClick={() => onSelectCity(city)} className="h-40 bg-gray-200 rounded-3xl flex items-center justify-center font-bold text-black text-xl cursor-pointer">
                {city}
            </div>
        ))}
      </div>
    </div>
  );
}

function CitySpotsView({ spots, city, onSelect, onBack }) {
  const filtered = spots.filter(s => s.city === city);
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-4">{city}</h2>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}
      </div>
    </div>
  );
}

function DetailView({ spot, onBack }) {
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4 bg-white p-2 rounded-full"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="h-64 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
            {spot.image && <img src={spot.image} className="w-full h-full object-cover" alt={spot.name} />}
        </div>
        <h1 className="text-3xl font-black">{spot.name}</h1>
        <p className="font-bold mb-4">{spot.city} • {spot.type}</p>
        <p className="text-sm font-bold mt-4">Toegepaste filters:</p>
        <div className="flex flex-wrap gap-2 mt-2">
            {(spot.tags || []).map(t => <span key={t} className="bg-gray-100 px-2 py-1 rounded text-xs">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function MyListsView() {
    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Mijn Lijsten</h2>
                <button className="bg-black text-white p-2 rounded-xl"><Plus /></button>
            </div>
        </div>
    );
}

function AddSpotView({ onBack, onAdded }) {
  const [data, setData] = useState({ name: '', city: '', type: 'Restaurant', tags: [] });
  
  const toggleTag = (tag) => {
      setData(prev => ({
          ...prev, 
          tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      }));
  };

  const save = async () => { await addDoc(collection(db, "spots"), data); onAdded(); };
  
  return (
    <div className="p-5 pb-20">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Voeg plek toe</h2>
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Naam" onChange={e => setData({...data, name: e.target.value})} />
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Stad" onChange={e => setData({...data, city: e.target.value})} />
      <select className="w-full p-4 mb-6 rounded-xl border" onChange={e => setData({...data, type: e.target.value, tags: []})}>
        <option value="Restaurant">Restaurant</option>
        <option value="Hotel">Hotel</option>
        <option value="Beach Club">Beach Club</option>
      </select>
      
      <p className="font-bold mb-2">Filters</p>
      <div className="flex flex-wrap gap-2 mb-6">
          {(TAGS[data.type] || []).map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`p-2 rounded-lg text-[10px] font-bold border ${data.tags.includes(t) ? 'bg-black text-white' : 'bg-white'}`}>
                  {t}
              </button>
          ))}
      </div>
      
      <button onClick={save} className="w-full bg-black text-white p-4 rounded-xl font-bold">Plek opslaan</button>
    </div>
  );
}

function ProfileView({ onRefresh }) {
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Beheer</h2>
      <button onClick={onRefresh} className="w-full bg-white p-4 rounded-xl font-bold border mb-4">Ververs data</button>
      <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold">Log uit</button>
    </div>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFFEE0]">
      <h1 className="text-5xl font-black text-black mb-10">LOQA</h1>
      <input className="w-full max-w-xs p-4 mb-3 rounded-xl border" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" className="w-full max-w-xs p-4 mb-6 rounded-xl border" placeholder="Wachtwoord" onChange={e => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full max-w-xs bg-black text-white p-4 rounded-xl font-bold">Inloggen</button>
    </div>
  );
}
