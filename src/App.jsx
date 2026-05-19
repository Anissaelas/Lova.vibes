import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, Search, Plus, BookOpen, Settings } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [view, setView] = useState('home');
  const [activeSpot, setActiveSpot] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchSpots();
    });
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
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} />}
      {view === 'profile' && <ProfileView onImport={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around shadow-xl z-50">
        <button onClick={() => setView('all')}><LayoutGrid className="text-gray-500" /></button>
        <button onClick={() => setView('home')}><Compass className="text-[#FF1493]" /></button>
        <button onClick={() => setView('profile')}><User className="text-gray-500" /></button>
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
        <div className="flex gap-4 overflow-x-auto pb-2">
          {spots.filter(s => s.status?.toLowerCase() === 'just_opened').map(s => (
            <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm">
              <div className="h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden"><img src={s.image} className="w-full h-full object-cover"/></div>
              <p className="font-bold text-sm truncate">{s.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Coming Soon ⏳</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {spots.filter(s => s.status?.toLowerCase() === 'coming_soon').map(s => (
            <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-gray-100 p-2 rounded-2xl opacity-70">
              <div className="h-32 bg-gray-300 rounded-lg mb-2 overflow-hidden"><img src={s.image} className="w-full h-full object-cover grayscale"/></div>
              <p className="font-bold text-sm truncate">{s.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AllPlacesView({ spots, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = spots.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-5">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input className="w-full pl-10 p-3 rounded-2xl border bg-white shadow-sm" placeholder="Zoek plek of stad..." onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-3 rounded-2xl shadow-sm border">
            <p className="font-bold">{s.name}</p>
            <p className="text-xs text-gray-500">{s.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailView({ spot, onBack }) {
  return (
    <div className="p-5 animate-in slide-in-from-right duration-300">
      <button onClick={onBack} className="mb-4"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h1 className="text-3xl font-black mb-1">{spot.name}</h1>
        <p className="text-gray-500 mb-6 font-bold">{spot.city}</p>
        <button className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Have you been?</button>
      </div>
    </div>
  );
}

function ProfileView({ onImport }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rows = event.target.result.split('\n');
      const headers = rows[0].split(';').map(h => h.trim().toLowerCase());
      for (let i = 1; i < rows.length; i++) {
        const vals = rows[i].split(';');
        if (vals.length < 2) continue;
        const spot = {}; headers.forEach((h, idx) => spot[h] = vals[idx]?.trim());
        const id = `${spot.name}_${spot.city}`.replace(/[\.#\$\[\]\/]/g, '');
        await setDoc(doc(db, "spots", id), { ...spot, status: spot.status || 'live' });
      }
      onImport();
      alert("Import gelukt!");
    };
    reader.readAsText(file);
  };
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Beheer Data</h2>
      <input type="file" onChange={handleFileUpload} className="w-full p-4 border rounded-xl" />
    </div>
  );
}

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFFEE0]">
      <h1 className="text-5xl font-black text-[#FF1493] mb-10">LOQA.</h1>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="w-full max-w-xs p-4 mb-3 rounded-xl border shadow-sm" />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="w-full max-w-xs p-4 mb-6 rounded-xl border shadow-sm" />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full max-w-xs bg-[#222222] text-white p-4 rounded-xl font-bold">Log in</button>
    </div>
  );
}
