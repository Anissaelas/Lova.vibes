import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, 
  Utensils, Camera, Flame, Globe, Plus, ShieldAlert, CheckCircle
} from 'lucide-react';

// FIREBASE IMPORTS
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

// --- MOCK DATA ---
const CITIES = ['Global', 'Bodrum', 'Ibiza', 'Cannes', 'Monaco', 'Marbella', 'St-Tropez', 'Amsterdam'];

const MOCK_CITIES = [
  { id: 'c1', name: 'Bodrum', count: 4, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop' },
  { id: 'c2', name: 'Ibiza', count: 1, image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop' },
  { id: 'c3', name: 'Cannes', count: 1, image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=500&auto=format&fit=crop' },
  { id: 'c4', name: 'Monaco', count: 5, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop' }
];

const BACKUP_SPOTS = [
  { id: 'spot_1', name: 'Oceanic Beach Club', subtitle: 'Ibiza, Spain', city: 'Ibiza', type: 'Beach Club', image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop', rating: { food: 4.5, service: 4.2, vibe: 4.8, totalVotes: 1 }, photos: { view: [], table: [], food: [] }, addressUrl: 'https://maps.google.com', websiteUrl: 'https://google.com' },
  { id: 'spot_2', name: 'Lumière Rooftop', subtitle: 'Cannes, France', city: 'Cannes', type: 'Restaurant', image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=500&auto=format&fit=crop', rating: { food: 4.6, service: 4.4, vibe: 4.8, totalVotes: 1 }, photos: { view: [], table: [], food: [] }, addressUrl: 'https://maps.google.com', websiteUrl: 'https://google.com' },
  { id: 'spot_3', name: 'Casa Blanca', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Lunch', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500&auto=format&fit=crop', rating: { food: 4.0, service: 4.0, vibe: 4.0, totalVotes: 1 }, photos: { view: [], table: [], food: [] }, addressUrl: 'https://maps.google.com', websiteUrl: 'https://google.com' }
];

// --- MAIN APP COMPONENT ---
export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [spots, setSpots] = useState(BACKUP_SPOTS);
  const [isLive, setIsLive] = useState(false);
  const [toast, setToast] = useState(null);

  const [savedLists, setSavedLists] = useState([
    { id: 'l1', name: 'Girls Bodrum 🌸', spots: ['spot_3'] }
  ]);

  const fetchSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "spots"));
      if (!querySnapshot.empty) {
        const liveData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            addressUrl: data.addressUrl || 'https://maps.google.com',
            websiteUrl: data.websiteUrl || 'https://google.com',
            photos: data.photos || { view: [], table: [], food: [] }
          };
        });
        setSpots(liveData);
        setIsLive(true);
      }
    } catch (e) { console.error("Firebase error:", e); }
  };

  useEffect(() => { fetchSpots(); }, []);

  const handleReviewSubmit = async (spotId, ratings) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      const currentSpot = spots.find(s => s.id === spotId);
      const votes = currentSpot.rating.totalVotes || 0;
      
      const newFood = ((currentSpot.rating.food * votes) + ratings.food) / (votes + 1);
      const newService = ((currentSpot.rating.service * votes) + ratings.service) / (votes + 1);
      const newVibe = ((currentSpot.rating.vibe * votes) + ratings.vibe) / (votes + 1);

      await updateDoc(spotRef, {
        "rating.food": parseFloat(newFood.toFixed(1)),
        "rating.service": parseFloat(newService.toFixed(1)),
        "rating.vibe": parseFloat(newVibe.toFixed(1)),
        "rating.totalVotes": increment(1)
      });

      await fetchSpots();
      setToast({ title: "Vibe Check Live! 🔥", message: "Jouw score is succesvol verwerkt." });
      setTimeout(() => setToast(null), 3000);
      setCurrentView('detail');
    } catch (error) { alert(error.message); }
  };

  const handlePhotoUpload = async (spotId, category, imageUrl) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      await updateDoc(spotRef, {
        [`photos.${category}`]: arrayUnion(imageUrl)
      });
      await fetchSpots();
      setToast({ title: "Photo Shared! 📸", message: "Je foto is toegevoegd aan Visual Intelligence." });
      setTimeout(() => setToast(null), 3000);
    } catch (error) { alert("Fout bij opslaan foto: " + error.message); }
  };

  const navigateToSpot = (spotId) => {
    const foundSpot = spots.find(s => s.id === spotId);
    if (foundSpot) {
      setPreviousView(currentView);
      setActiveSpot(foundSpot);
      setCurrentView('detail');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] font-sans text-gray-800 pb-28 relative">
      
      {toast && (
        <div className="fixed top-5 left-5 right-5 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-pink-500/30">
          <CheckCircle className="text-pink-400 w-5 h-5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs text-gray-300">{toast.message}</p>
          </div>
        </div>
      )}

      {/* VIEWS SWITCH */}
      {currentView === 'home' && <HomeFeed spots={spots} onSelectSpot={navigateToSpot} />}
      {currentView === 'all_cities' && <AllCitiesView onSelectCity={(city) => { setActiveCityObj(city); setCurrentView('city_detail'); }} />}
      {currentView === 'city_detail' && <CityDetailView spots={spots} city={activeCityObj} onSelectSpot={navigateToSpot} onBack={() => setCurrentView('all_cities')} />}
      {currentView === 'saved' && <SavedView lists={savedLists} allSpots={spots} onSelectSpot={navigateToSpot} />}
      {currentView === 'profile' && <ProfileView isLive={isLive} />}
      
      {currentView === 'detail' && (
        <SpotDetail 
          spot={spots.find(s => s.id === activeSpot?.id)} 
          onBack={() => setCurrentView(previousView)} 
          onRate={() => setCurrentView('have_been')} 
          onNewPhoto={(cat, url) => handlePhotoUpload(activeSpot.id, cat, url)}
        />
      )}
      
      {currentView === 'have_been' && (
        <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r) => handleReviewSubmit(activeSpot.id, r)} />
      )}

      {/* VERVORMDE & HERSCHIKTE NAVIGATIEBALK 👇 */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-400">
          
          {/* 1. ALL PLACES STAAT NU EERST */}
          <button onClick={() => setCurrentView('all_cities')} className={`flex flex-col items-center gap-1 ${currentView === 'all_cities' || currentView === 'city_detail' ? 'text-pink-500 font-bold' : ''}`}>
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px]">All Places</span>
          </button>
          
          {/* 2. DISCOVER HEET NU HOME EN STAAT IN HET MIDDEN */}
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-pink-500 font-bold' : ''}`}>
            <Compass className="w-6 h-6" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* 3. MY LISTS */}
          <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center gap-1 ${currentView === 'saved' ? 'text-pink-500 font-bold' : ''}`}>
            <Heart className="w-6 h-6" />
            <span className="text-[10px]">My Lists</span>
          </button>

          {/* 4. PROFILE */}
          <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-pink-500 font-bold' : ''}`}>
            <User className="w-6 h-6" />
            <span className="text-[10px]">Profile</span>
          </button>

        </div>
      </nav>
    </div>
  );
}

// --- FLAME RATING TOOL ---
function FlameRating({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <button key={index} type="button" onClick={() => onChange(index)} className="transition-transform active:scale-125 duration-100">
          <Flame className={`w-6 h-6 ${index <= value ? 'fill-[#FF1493] text-[#FF1493]' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

// --- HOME FEED (Vroeger discover) ---
function HomeFeed({ spots, onSelectSpot }) {
  const [activeTab, setActiveTab] = useState('Global');
  const filteredSpots = activeTab === 'Global' ? spots : spots.filter(s => s.city === activeTab);

  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-pink-500 tracking-tighter">LocaVibes.</h1>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {CITIES.map(c => (
          <button key={c} onClick={() => setActiveTab(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === c ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-4 pt-2">
        {filteredSpots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 cursor-pointer group active:scale-[0.98] transition-all">
            <img src={spot.image} className="h-48 w-full object-cover" />
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium"><MapPin className="w-3 h-3" /> {spot.subtitle}</p>
              </div>
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                {((spot.rating.food + spot.rating.service + spot.rating.vibe)/3).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ALL CITIES OVERZICHT ---
function AllCitiesView({ onSelectCity }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-4">All Cities</h1>
      <div className="grid grid-cols-2 gap-4">
        {MOCK_CITIES.map((city) => (
          <div key={city.id} onClick={() => onSelectCity(city)} className="relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-md group transform active:scale-95 transition-all">
            <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-lg font-bold leading-none">{city.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CITY DETAIL VIEW ---
function CityDetailView({ spots, city, onSelectSpot, onBack }) {
  const citySpots = spots.filter(s => s.city === city?.name);
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-black text-gray-900">{city?.name}</h1>
      </header>
      <div className="space-y-3">
        {citySpots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
            <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">{spot.type}</p>
            </div>
            <span className="text-xs font-black text-pink-500 bg-pink-50 px-2 py-1 rounded-lg">🔥 {((spot.rating.food + spot.rating.service + spot.rating.vibe)/3).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- SAVED VIEW ---
function SavedView({ lists, allSpots, onSelectSpot }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-4">My Lists</h1>
      {lists.map(list => (
        <div key={list.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md space-y-3">
          <h2 className="font-extrabold text-lg text-pink-500">{list.name}</h2>
          <div className="space-y-2">
            {allSpots.filter(s => list.spots.includes(s.id)).map(spot => (
              <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 cursor-pointer">
                <span className="text-sm font-semibold text-gray-700">{spot.name}</span>
                <span className="text-xs font-medium text-gray-400">{spot.city}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- PROFILE VIEW ---
function ProfileView({ isLive }) {
  return (
    <div className="p-5 max-w-md mx-auto text-center pt-16 space-y-6 animate-in fade-in duration-200">
      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg">
        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" alt="Profile" className="w-full h-full object-cover" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sophie L.</h1>
        <p className="text-xs text-pink-500 font-semibold mt-0.5">@sophie_vibes</p>
      </div>
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-left">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
          <ShieldAlert className="w-5 h-5 text-pink-500" />
          <span>Status: {isLive ? <span className="text-green-600 font-bold">Connected to Live Firebase 🔥</span> : <span className="text-amber-500 font-bold">Backup Mode</span>}</span>
        </div>
      </div>
    </div>
  );
}

// --- SPOT DETAIL SCHERM ---
function SpotDetail({ spot, onBack, onRate, onNewPhoto }) {
  const [activeTab, setActiveTab] = useState('view');
  const [uploading, setUploading] = useState(false);

  if (!spot) return null;
  const overall = ((spot.rating.food + spot.rating.service + spot.rating.vibe) / 3).toFixed(1);
  const currentPhotos = spot.photos?.[activeTab] || [];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { Authorization: 'Client-ID 77f0a7bdfd9b3be' },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        onNewPhoto(activeTab, result.data.link);
      } else { alert("Upload mislukt."); }
    } catch (err) { alert("Fout: " + err.message); } finally { setUploading(false); }
  };

  return (
    <div className="animate-in slide-in-from-right duration-200">
      <div className="relative h-72 w-full">
        <img src={spot.image} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-2xl font-black">{spot.name}</h1>
          <p className="text-sm opacity-80 flex items-center gap-1"><MapPin className="w-3 h-3" /> {spot.subtitle}</p>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-6">
        
        {/* ADDRESS & WEBSITE */}
        <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
          <a href={spot.addressUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-2 hover:bg-gray-50 rounded-xl">
            <MapPin className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Address</span>
          </a>
          <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-2 hover:bg-gray-50 rounded-xl">
            <Globe className="w-5 h-5 text-gray-700 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Website</span>
          </a>
        </div>

        <button onClick={onRate} className="w-full bg-white text-[#FF1493] border border-gray-100 font-bold py-4 rounded-2xl shadow-sm text-center flex items-center justify-center gap-2">
          ✔️ Have you been here?
        </button>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b pb-3 mb-2">
            <span className="font-bold text-gray-900">Loca Score ({spot.rating.totalVotes || 0} checks)</span>
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-3 py-1 rounded-xl flex items-center gap-1">🔥 {overall}</span>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Utensils className="w-4 h-4" /> Food</span><span className="font-bold">{spot.rating.food.toFixed(1)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Heart className="w-4 h-4" /> Service</span><span className="font-bold">{spot.rating.service.toFixed(1)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Camera className="w-4 h-4" /> Vibe</span><span className="font-bold">{spot.rating.vibe.toFixed(1)}</span></div>
        </div>

        {/* VISUAL INTELLIGENCE */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Visual Intelligence</h2>
          <div className="flex bg-gray-100/60 p-1 rounded-xl text-xs font-bold text-gray-500">
            <button onClick={() => setActiveTab('view')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'view' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>The View</button>
            <button onClick={() => setActiveTab('table')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'table' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>Best Table</button>
            <button onClick={() => setActiveTab('food')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'food' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>Food</button>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            {currentPhotos.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-400">No photos here yet. Be the first!</p>
                <label className={`inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-4 py-2.5 rounded-xl ${uploading ? 'opacity-50' : ''}`}>
                  <Plus className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {currentPhotos.map((url, idx) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden shadow-sm border">
                      <img src={url} className="w-full h-full object-cover" alt="User upload" />
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-3 py-2 rounded-xl mt-2">
                  <Plus className="w-3.5 h-3.5" /> Add Another
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- VIBE CHECK SCHERM ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [vibe, setVibe] = useState(0);
  const average = food && service && vibe ? ((food + service + vibe) / 3).toFixed(1) : "0.0";

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom duration-200">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Rate The Vibe</h1>
      </header>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-6">
        <h2 className="font-bold text-gray-800 text-lg">Rate The Vibe</h2>
        <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Utensils className="w-4 h-4" /> Food</span><FlameRating value={food} onChange={setFood} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Heart className="w-4 h-4" /> Service</span><FlameRating value={service} onChange={setService} /></div>
        <div className="flex justify-between items-center"><span className="text-gray-600 font-semibold text-sm flex items-center gap-2"><Camera className="w-4 h-4" /> Vibe</span><FlameRating value={vibe} onChange={setVibe} /></div>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-500">Your Average</span>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Flame key={i} className={`w-5 h-5 ${i <= Math.round(average) ? 'fill-[#FF1493] text-[#FF1493]' : 'text-gray-200'}`} />
            ))}
          </div>
        </div>

        <button 
          onClick={() => food && service && vibe && onSubmit({ food, service, vibe })}
          disabled={!food || !service || !vibe}
          className={`w-full py-4 rounded-2xl font-black text-white text-center shadow-lg transition-all flex items-center justify-center gap-2 ${food && service && vibe ? 'bg-[#FF1493] shadow-pink-500/20 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Submit Vibe Check 🔥
        </button>
      </div>
    </div>
  );
}
