import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, Search, Plus, Bookmark, Globe, Instagram, CalendarDays } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

  if (!user) return <div className="p-10 text-center">Log in via Firebase.</div>;

  return (
    <div className="min-h-screen bg-[#FFFEE0] pb-24 font-sans">
      {view === 'home' && <HomeView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'all' && <AllPlacesView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} />}
      {view === 'saved' && <div className="p-5">My Lists (Coming soon)</div>}
      {view === 'profile' && <div className="p-5"><button onClick={() => signOut(auth)} className="bg-red-500 text-white p-4 rounded-xl">Log uit</button></div>}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')}><LayoutGrid className="text-gray-500" /></button>
        <button onClick={() => setView('home')}><Compass className="text-[#FF1493]" /></button>
        <button onClick={() => setView('saved')}><Heart className="text-gray-500" /></button>
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
        <div className="flex gap-4 overflow-x-auto pb-2">{spots.filter(s => s.status?.toLowerCase() === 'just_opened').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}</div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Coming Soon ⏳</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">{spots.filter(s => s.status?.toLowerCase() === 'coming_soon').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}</div>
      </section>
    </div>
  );
}

function SpotCard({ spot, onClick }) {
  return (
    <div onClick={() => onClick(spot)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
      <div className="h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden"><img src={spot.image} className="w-full h-full object-cover"/></div>
      <p className="font-bold text-sm truncate">{spot.name}</p>
      <p className="text-[10px] text-gray-400">{spot.city}</p>
    </div>
  );
}

function AllPlacesView({ spots, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = spots.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-5">
      <input className="w-full p-4 rounded-2xl mb-4 border shadow-sm" placeholder="Zoek plek of stad..." onChange={(e) => setSearch(e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
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
      <button onClick={onBack} className="mb-4 bg-white p-2 rounded-full shadow-sm"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-start">
            <h1 className="text-3xl font-black">{spot.name}</h1>
            <Bookmark className="text-[#FF1493]" />
        </div>
        <p className="text-gray-500 mb-6 font-bold flex items-center gap-1"><MapPin size={16} /> {spot.city}</p>
        
        <div className="flex gap-3 mb-6">
            <a href={spot.websiteUrl} target="_blank" className="flex-1 bg-gray-100 p-3 rounded-xl text-center font-bold text-sm">Website</a>
            <a href={spot.instagramUrl} target="_blank" className="flex-1 bg-gray-100 p-3 rounded-xl text-center font-bold text-sm">Instagram</a>
        </div>
        
        <button className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold mb-4">Have you been?</button>
      </div>
    </div>
  );
}
