import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, Search, Plus, ArrowLeft, Armchair, Utensils, Camera, CheckCircle, Globe, Instagram, ExternalLink } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, increment } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

const TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Romantic', 'Vegan', 'Gluten-free', 'Halal', 'Cocktails', 'Fine dining', 'Aesthetic'],
  'Beach Club': ['Infinity pool', 'Daybed req.', 'Sunset view', 'Adults only', 'Party', 'Quiet', 'DJ', 'Instagrammable'],
  'Hotel': ['View from bed', 'Private pool', 'Rooftop pool', 'Spa', 'Boutique', 'Workation', 'Aesthetic']
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
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} onReview={() => setView('review')} />}
      {view === 'review' && <ReviewView spot={activeSpot} onBack={() => setView('detail')} onDone={() => { fetchSpots(); setView('detail'); }} />}
      {view === 'add' && <AddSpotView onBack={() => setView('all')} onAdded={() => { fetchSpots(); setView('all'); }} />}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')} className={view === 'all' ? 'text-[#FF1493]' : 'text-gray-400'}><LayoutGrid /></button>
        <button onClick={() => setView('home')} className={view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'}><Compass /></button>
        <button onClick={() => setView('profile')} className={view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'}><User /></button>
      </nav>
    </div>
  );
}

function HomeView({ spots, onSelect }) {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-black text-[#FF1493] mb-6">LOQA.</h1>
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Just Opened 🔥</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">{spots.filter(s => s.status === 'just_opened').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}</div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Coming Soon ⏳</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">{spots.filter(s => s.status === 'coming_soon').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}</div>
      </section>
    </div>
  );
}

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
        </div>
      ))}
    </div>
  );
}

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
        {filtered.map(s => <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-3 rounded-2xl border shadow-sm"><p className="font-bold">{s.name}</p><p className="text-[10px] text-gray-400">{s.type}</p></div>)}
      </div>
    </div>
  );
}

function DetailView({ spot, onBack, onReview }) {
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4 bg-white p-2 rounded-full shadow-sm"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl border">
        <h1 className="text-3xl font-black">{spot.name}</h1>
        <p className="text-gray-500 font-bold mb-4">{spot.city} • {spot.cuisine}</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <a href={spot.websiteUrl} className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">WEB</a>
          <a href={spot.instagramUrl} className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">IG</a>
          <a href={spot.addressUrl} className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">MAP</a>
        </div>
        <button onClick={onReview} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold mb-4">Have you been?</button>
      </div>
    </div>
  );
}

function ReviewView({ spot, onBack, onDone }) {
  const [ratings, setRatings] = useState({ food: 0, service: 0, vibe: 0 });
  const [selected, setSelected] = useState([]);
  const toggle = (t) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const submit = async () => {
    await updateDoc(doc(db, "spots", spot.id), { tags: arrayUnion(...selected), rating: ratings });
    onDone();
  };

  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Vibe Check: {spot.name}</h2>
      {['food', 'service', 'vibe'].map(cat => (
        <div key={cat} className="flex justify-between items-center bg-white p-4 rounded-2xl mb-2">
          <span className="font-bold capitalize">{cat}</span>
          <div className="flex gap-1">{[1,2,3,4,5].map(n => <Flame key={n} onClick={() => setRatings({...ratings, [cat]: n})} className={ratings[cat] >= n ? 'text-[#FF1493] fill-[#FF1493]' : 'text-gray-300'} />)}</div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 mt-6">
        {(TAGS[spot.type] || TAGS['Restaurant']).map(t => <button key={t} onClick={() => toggle(t)} className={`p-2 rounded-lg text-[10px] font-bold border ${selected.includes(t) ? 'bg-[#FF1493] text-white' : 'bg-white'}`}>{t}</button>)}
      </div>
      <button onClick={submit} className="w-full bg-[#222222] text-white mt-8 p-4 rounded-xl font-bold">Verzenden</button>
    </div>
  );
}

function AddSpotView({ onBack, onAdded }) {
  const [data, setData] = useState({ name: '', city: '', type: 'Restaurant', status: 'live' });
  const save = async () => { await addDoc(collection(db, "spots"), data); onAdded(); };
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Voeg plek toe</h2>
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Naam" onChange={e => setData({...data, name: e.target.value})} />
      <input className="w-full p-4 mb-3 rounded-xl border" placeholder="Stad" onChange={e => setData({...data, city: e.target.value})} />
      <button onClick={save} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Opslaan</button>
    </div>
  );
}

function SpotCard({ spot, onClick }) {
  return (
    <div onClick={() => onClick(spot)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
      <div className="h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden"><img src={spot.image} className="w-full h-full object-cover"/></div>
      <p className="font-bold text-sm truncate">{spot.name}</p>
    </div>
  );
}

function ProfileView({ onRefresh }) {
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <button onClick={onRefresh} className="w-full bg-white p-4 rounded-xl font-bold border mb-4">Ververs data</button>
      <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold">Log uit</button>
    </div>
  );
}

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
