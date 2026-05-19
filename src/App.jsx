import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [activeView, setActiveView] = useState('home');

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n');
      const headers = rows[0].split(';').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(';');
        if (values.length < 2) continue;
        
        const spot = {};
        headers.forEach((h, idx) => spot[h] = values[idx]?.trim());
        
        // Zorg dat status wordt ingevuld
        const status = spot.status ? spot.status.toLowerCase().replace(' ', '_') : 'live';
        await setDoc(doc(db, "spots", spot.name || i.toString()), { ...spot, status });
      }
      fetchSpots();
      alert("Import voltooid!");
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FFFEE0] pb-24">
      {/* HOME FEED MET SECTIES */}
      {activeView === 'home' && (
        <div className="p-5">
          <h1 className="text-3xl font-black mb-6">LOQA.</h1>
          
          {/* JUST OPENED */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Just Opened 🔥</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {spots.filter(s => s.status?.includes('just_opened')).map(s => (
                <div key={s.id} className="min-w-[140px] bg-white p-2 rounded-xl shadow-sm">
                  <div className="h-32 bg-gray-200 rounded-lg mb-2" />
                  <p className="font-bold text-sm">{s.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMING SOON */}
          <section>
            <h2 className="text-xl font-bold mb-4">Coming Soon ⏳</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {spots.filter(s => s.status?.includes('coming_soon')).map(s => (
                <div key={s.id} className="min-w-[140px] bg-gray-100 p-2 rounded-xl opacity-70">
                  <div className="h-32 bg-gray-300 rounded-lg mb-2" />
                  <p className="font-bold text-sm">{s.name}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* PROFILE VIEW VOOR IMPORT */}
      {activeView === 'profile' && (
        <div className="p-5">
          <h2 className="text-2xl font-bold mb-4">Beheer</h2>
          <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#FF1493] file:text-white" />
        </div>
      )}

      {/* NAVIGATIE */}
      <nav className="fixed bottom-0 w-full bg-white border-t p-4 flex justify-around">
        <button onClick={() => setActiveView('home')}><Compass /></button>
        <button onClick={() => setActiveView('profile')}><User /></button>
      </nav>
    </div>
  );
}
