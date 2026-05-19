import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, Search, Bookmark, Globe, Instagram, CalendarDays, ArrowLeft, Check, Plus } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, setDoc, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Fine dining', 'Affordable luxury', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance', 'Sunset view', 'Golden hour spot', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book'],
  'Beach Club': ['Infinity pool', 'Daybed rental required', 'Sunset view', 'Adults only', 'Golden hour spot', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book', 'Party', 'Quiet', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Hidden gem', 'DJ'],
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
      {view === 'all' && <AllPlacesView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
      {view === 'detail' && <DetailView spot={activeSpot} onBack={() => setView('home')} onReview={() => setView('review')} />}
      {view === 'review' && <ReviewView spot={activeSpot} onBack={() => setView('detail')} onDone={() => setView('detail')} />}
      {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around z-50 shadow-lg">
        <button onClick={() => setView('all')}><LayoutGrid className={view === 'all' ? 'text-[#FF1493]' : 'text-gray-400'} /></button>
        <button onClick={() => setView('home')}><Compass className={view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'} /></button>
        <button onClick={() => setView('profile')}><User className={view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'} /></button>
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

function AllPlacesView({ spots, onSelect }) {
  const [search, setSearch] = useState('');
  const cities = [...new Set(spots.map(s => s.city))];
  const filtered = spots.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-5">
      <input className="w-full p-4 rounded-2xl mb-6 border shadow-sm" placeholder="Zoek op naam..." onChange={(e) => setSearch(e.target.value)} />
      {search ? (
        <div className="grid grid-cols-2 gap-4">{filtered.map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}</div>
      ) : (
        cities.map(city => (
          <div key={city} className="mb-6">
            <h2 className="font-black text-lg mb-3">{city}</h2>
            <div className="flex gap-4 overflow-x-auto">{spots.filter(s => s.city === city).map(s => <SpotCard key={s.id} spot={s} onClick={onSelect} />)}</div>
          </div>
        ))
      )}
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
        <div className="flex gap-2 mb-6">
          <a href={spot.websiteUrl} className="flex-1 bg-gray-100 p-3 rounded-xl text-center text-xs font-bold">Website</a>
          <a href={spot.instagramUrl} className="flex-1 bg-gray-100 p-3 rounded-xl text-center text-xs font-bold">Instagram</a>
          <a href={spot.addressUrl} className="flex-1 bg-gray-100 p-3 rounded-xl text-center text-xs font-bold">Locatie</a>
        </div>
        <button onClick={onReview} className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Have you been?</button>
      </div>
    </div>
  );
}

function ReviewView({ spot, onBack, onDone }) {
  const [ratings, setRatings] = useState({ food: 0, service: 0, vibe: 0 });
  const [selected, setSelected] = useState([]);
  const type = spot.type || 'Restaurant';
  const availableTags = TAGS[type] || TAGS['Restaurant'];

  const toggleTag = (t) => setSelected(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const submit = async () => {
    await updateDoc(doc(db, "spots", spot.id), { 
        tags: arrayUnion(...selected),
        rating: { food: ratings.food, service: ratings.service, vibe: ratings.vibe, totalVotes: increment(1) }
    });
    onDone();
  };

  return (
    <div className="p-5 bg-[#FFFEE0] min-h-screen">
      <button onClick={onBack} className="mb-4"><ArrowLeft /></button>
      <h2 className="text-2xl font-black mb-6">Vibe Check: {spot.name}</h2>
      
      {['food', 'service', 'vibe'].map(cat => (
        <div key={cat} className="flex justify-between items-center mb-4 bg-white p-4 rounded-2xl">
          <span className="capitalize font-bold">{cat}</span>
          <div className="flex gap-1">{[1,2,3,4,5].map(n => <Flame key={n} onClick={() => setRatings({...ratings, [cat]: n})} className={ratings[cat] >= n ? 'text-[#FF1493] fill-[#FF1493]' : 'text-gray-300'} />)}</div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2 mt-6">
        {availableTags.map(t => <button key={t} onClick={() => toggleTag(t)} className={`p-2 rounded-lg text-xs font-bold border ${selected.includes(t) ? 'bg-[#FF1493] text-white' : 'bg-white'}`}>{t}</button>)}
      </div>
      <button onClick={submit} className="w-full bg-[#222222] text-white mt-8 p-4 rounded-xl font-bold">Verzenden</button>
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
      <input type="password" className="w-full max-w-xs p-4 mb-6 rounded-xl border" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full max-w-xs bg-[#222222] text-white p-4 rounded-xl font-bold">Log in</button>
    </div>
  );
}
