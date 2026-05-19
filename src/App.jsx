import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [activeSpot, setActiveSpot] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchSpots();
    });
    return unsubscribe;
  }, []);

  const fetchSpots = async () => {
    const snapshot = await getDocs(collection(db, "spots"));
    setSpots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  if (!user) return <div className="p-10 text-center">Log in via de Auth module.</div>;

  return (
    <div className="min-h-screen bg-[#FFFEE0] pb-24 font-sans">
      {currentView === 'home' && (
        <div className="p-5">
          <h1 className="text-3xl font-black text-[#FF1493] mb-8">LOQA.</h1>
          
          {/* JUST OPENED */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Just Opened 🔥</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {spots.filter(s => s.status === 'just_opened').map(s => (
                <div key={s.id} onClick={() => { setActiveSpot(s); setCurrentView('detail'); }} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm">
                  <div className="h-32 bg-gray-200 rounded-lg mb-2 overflow-hidden"><img src={s.image} className="w-full h-full object-cover"/></div>
                  <p className="font-bold text-sm truncate">{s.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMING SOON */}
          <section>
            <h2 className="text-xl font-bold mb-4">Coming Soon ⏳</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {spots.filter(s => s.status === 'coming_soon').map(s => (
                <div key={s.id} onClick={() => { setActiveSpot(s); setCurrentView('detail'); }} className="min-w-[140px] bg-gray-100 p-2 rounded-2xl opacity-70">
                  <div className="h-32 bg-gray-300 rounded-lg mb-2 overflow-hidden"><img src={s.image} className="w-full h-full object-cover grayscale"/></div>
                  <p className="font-bold text-sm truncate">{s.name}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {currentView === 'detail' && (
        <div className="p-5">
          <button onClick={() => setCurrentView('home')} className="mb-4"><ChevronLeft /></button>
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h1 className="text-3xl font-black">{activeSpot?.name}</h1>
            <p className="text-gray-500 mb-6">{activeSpot?.city}</p>
            <button className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Have you been?</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around shadow-lg">
        <button onClick={() => setCurrentView('all')}><LayoutGrid /></button>
        <button onClick={() => setCurrentView('home')}><Compass /></button>
        <button onClick={() => setCurrentView('saved')}><Heart /></button>
        <button onClick={() => setCurrentView('profile')}><User /></button>
      </nav>
    </div>
  );
}
