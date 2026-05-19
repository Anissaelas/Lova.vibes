import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, Bookmark } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
// FIX 1: Added signInWithEmailAndPassword to the import
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [view, setView] = useState('home');
  const [activeSpot, setActiveSpot] = useState(null);

  useEffect(() => {
    // FIX 3: Return the unsubscribe function to clean up the listener on unmount
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchSpots();
    });
    return unsubscribe;
  }, []);

  const fetchSpots = async () => {
    try {
      const snapshot = await getDocs(collection(db, "spots"));
      setSpots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Fout bij laden data:", e); }
  };

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-[#FFFEE0] pb-24 font-sans">
      {view === 'home' && <HomeView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'all' && <AllPlacesView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} />}
      {/* FIX 2: Added missing 'saved' view branch */}
      {view === 'saved' && <SavedView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')}><LayoutGrid className={view === 'all' ? 'text-[#FF1493]' : 'text-gray-500'} /></button>
        <button onClick={() => setView('home')}><Compass className={view === 'home' ? 'text-[#FF1493]' : 'text-gray-500'} /></button>
        <button onClick={() => setView('saved')}><Heart className={view === 'saved' ? 'text-[#FF1493]' : 'text-gray-500'} /></button>
        <button onClick={() => setView('profile')}><User className={view === 'profile' ? 'text-[#FF1493]' : 'text-gray-500'} /></button>
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
          {spots.filter(s => s.status?.toLowerCase() === 'just_opened').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Coming Soon ⏳</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {spots.filter(s => s.status?.toLowerCase() === 'coming_soon').map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}
        </div>
      </section>
    </div>
  );
}

function SpotCard({ spot, onClick }) {
  return (
    <div onClick={() => onClick(spot)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
      <div className="h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden">
        <img src={spot.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt={spot.name} />
      </div>
      <p className="font-bold text-sm truncate">{spot.name || 'Onbekend'}</p>
      <p className="text-[10px] text-gray-400">{spot.city || 'Geen stad'}</p>
    </div>
  );
}

function AllPlacesView({ spots, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = spots.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-5">
      <input
        className="w-full p-4 rounded-2xl mb-4 border shadow-sm"
        placeholder="Zoek plek of stad..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(s => (
          <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
            <p className="font-bold">{s.name}</p>
            <p className="text-xs text-gray-500">{s.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// FIX 2: Added the SavedView component that was previously missing
function SavedView({ spots, onSelect }) {
  // Placeholder: saved spots would typically come from Firestore or local state.
  // For now, renders all spots tagged as saved (extend with real saved logic as needed).
  const savedSpots = spots.filter(s => s.saved === true);
  return (
    <div className="p-5">
      <h1 className="text-2xl font-black text-[#FF1493] mb-6">Saved</h1>
      {savedSpots.length === 0 ? (
        <p className="text-gray-400 text-sm">Je hebt nog geen plekken opgeslagen.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {savedSpots.map(s => (
            <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 cursor-pointer">
              <p className="font-bold">{s.name}</p>
              <p className="text-xs text-gray-500">{s.city}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailView({ spot, onBack }) {
  if (!spot) return null;
  return (
    // FIX 4: Removed 'animate-in slide-in-from-right duration-300' — these require
    // the tailwindcss-animate plugin which is not installed by default.
    // Install it (npm install tailwindcss-animate) and add it to tailwind.config.js to re-enable.
    <div className="p-5">
      <button onClick={onBack} className="mb-4 bg-white p-2 rounded-full shadow-sm"><ChevronLeft /></button>
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-black">{spot.name}</h1>
          <Bookmark className="text-[#FF1493]" />
        </div>
        <p className="text-gray-500 mb-6 font-bold flex items-center gap-1"><MapPin size={16} /> {spot.city}</p>

        <div className="flex gap-3 mb-6">
          {spot.websiteUrl && <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="flex-1 bg-gray-100 p-3 rounded-xl text-center font-bold text-sm">Website</a>}
          {spot.instagramUrl && <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="flex-1 bg-gray-100 p-3 rounded-xl text-center font-bold text-sm">Instagram</a>}
        </div>

        <button className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold mb-4">Have you been?</button>
      </div>
    </div>
  );
}

function ProfileView({ onRefresh }) {
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-6">Instellingen</h2>
      <button onClick={onRefresh} className="w-full bg-gray-200 p-4 rounded-xl font-bold mb-4">Ververs data uit Firebase</button>
      <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold">Log uit</button>
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
      {/* FIX 1: signInWithEmailAndPassword is now properly imported and usable */}
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full max-w-xs bg-[#222222] text-white p-4 rounded-xl font-bold">Inloggen</button>
    </div>
  );
}
