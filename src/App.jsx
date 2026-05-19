import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, Search, Bookmark, Globe, Instagram, ArrowLeft } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

// Filters per type voor de Vibe Check
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
      {view === 'all' && <AllPlacesView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} onReview={() => setView('review')} />}
      {view === 'review' && <ReviewView spot={activeSpot} onBack={() => setView('detail')} onDone={() => setView('detail')} />}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 p-4 flex justify-around z-50">
        <button onClick={() => setView('all')} className={view === 'all' ? 'text-[#FF1493]' : 'text-gray-400'}><LayoutGrid /></button>
        <button onClick={() => setView('home')} className={view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'}><Compass /></button>
        <button onClick={() => setView('saved')} className={view === 'saved' ? 'text-[#FF1493]' : 'text-gray-400'}><Heart /></button>
        <button onClick={() => setView('profile')} className={view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'}><User /></button>
      </nav>
    </div>
  );
}

// HOME PAGINA
function HomeView({ spots, onSelect }) {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-black text-[#FF1493] mb-6">LOQA.</h1>
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
        {spots.map(s => <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm border border-gray-100"><img src={s.image} className="w-full h-32 object-cover rounded-lg mb-2"/><p className="font-bold text-sm truncate">{s.name}</p></div>)}
      </div>
    </div>
  );
}

// ALL PAGINA (Steden -> Plekken)
function AllPlacesView({ spots, onSelect }) {
  const [search, setSearch] = useState('');
  const cities = [...new Set(spots.map(s => s.city))];
  return (
    <div className="p-5">
      <div className="bg-white p-3 rounded-2xl flex items-center gap-2 mb-6 shadow-sm border">
        <Search className="text-gray-400" />
        <input className="w-full outline-none" placeholder="Zoek op naam..." onChange={(e) => setSearch(e.target.value)} />
      </div>
      {cities.map(city => (
        <div key={city} className="mb-6">
          <h2 className="font-black text-lg mb-3">{city}</h2>
          <div className="flex gap-4 overflow-x-auto">{spots.filter(s => s.city === city).map(s => <div key={s.id} onClick={() => onSelect(s)} className="min-w-[120px] bg-white p-2 rounded-xl shadow-sm"><p className="font-bold text-sm">{s.name}</p></div>)}</div>
        </div>
      ))}
    </div>
  );
}

// DETAIL PAGINA
function DetailView({ spot, onBack, onReview }) {
  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4 p-2 bg-white rounded-full shadow-sm"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-lg border">
        <h1 className="text-3xl font-black mb-1">{spot.name}</h1>
        <p className="text-gray-500 mb-6 font-bold flex items-center gap-1"><MapPin size={16}/>{spot.city}</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <a href={spot.websiteUrl} className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">WEB</a>
          <a href={spot.instagramUrl} className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">IG</a>
          <a href={spot.addressUrl} className="bg-gray-100 p-3 rounded-xl text-center text-[10px] font-bold">MAP</a>
        </div>
        <button onClick={onReview} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Have you been?</button>
      </div>
    </div>
  );
}

// REVIEW PAGINA
function ReviewView({ spot, onBack, onDone }) {
  const [ratings, setRatings] = useState({ food: 0, service: 0, vibe: 0 });
  const [selected, setSelected] = useState([]);
  const toggle = (t) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const submit = async () => {
    await updateDoc(doc(db, "spots", spot.id), { tags: arrayUnion(...selected), ratings });
    onDone();
  };

  return (
    <div className="p-5">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-4">Vibe Check: {spot.name}</h2>
      {['food', 'service', 'vibe'].map(cat => (
        <div key={cat} className="flex justify-between items-center bg-white p-4 rounded-2xl mb-2">
          <span className="font-bold capitalize">{cat}</span>
          <div className="flex gap-1">{[1,2,3,4,5].map(n => <Flame key={n} onClick={() => setRatings({...ratings, [cat]: n})} className={ratings[cat] >= n ? 'text-[#FF1493] fill-[#FF1493]' : 'text-gray-300'} />)}</div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 mt-4">
        {(TAGS[spot.type] || TAGS['Restaurant']).map(t => <button key={t} onClick={() => toggle(t)} className={`p-2 rounded-lg text-[10px] font-bold border ${selected.includes(t) ? 'bg-[#FF1493] text-white' : 'bg-white'}`}>{t}</button>)}
      </div>
      <button onClick={submit} className="w-full bg-[#222222] text-white mt-8 p-4 rounded-xl font-bold">Opslaan</button>
    </div>
  );
}

// AUTH SCHERM
function AuthScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFEE0] p-6">
      <h1 className="text-5xl font-black text-[#FF1493] mb-10">LOQA.</h1>
      <input className="w-full max-w-xs p-4 mb-3 rounded-xl border" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" className="w-full max-w-xs p-4 mb-6 rounded-xl border" placeholder="Wachtwoord" onChange={e => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full max-w-xs bg-[#222222] text-white p-4 rounded-xl font-bold">Inloggen</button>
    </div>
  );
}

function ProfileView({ onRefresh }) {
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <button onClick={onRefresh} className="w-full bg-white p-4 rounded-xl mb-4 shadow-sm border font-bold">Ververs data</button>
      <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold">Log uit</button>
    </div>
  );
}
