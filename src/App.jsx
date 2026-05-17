import React, { useState, useEffect } from 'react';
import { 
  Map, List, Heart, Search, Filter, MapPin, ExternalLink, 
   Globe, Camera, Utensils, Armchair, ChevronLeft, 
  ThumbsUp, CheckCircle, Bell, Star, Compass, LayoutGrid, 
  ChevronRight, ArrowLeft, Gem, User, Settings, ShieldAlert,
  Check, Plus, Folder, Flame // Flame import toegevoegd voor de vlammetjes! 🔥
} from 'lucide-react';

// FIREBASE IMPORTS
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

// --- MOCK DATA ---
const CITIES = ['Global', 'Bodrum', 'Ibiza', 'Cannes', 'Monaco', 'Marbella', 'St-Tropez', 'Amsterdam'];

const MOCK_CITIES = [
  { id: 'c1', name: 'Bodrum', count: 67, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop' },
  { id: 'c2', name: 'Ibiza', count: 0, image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop' }
];

const MOCK_SPOTS = [
  {
    id: 'spot_1',
    name: 'Oceanic Beach Club',
    subtitle: 'Ibiza, Spain',
    city: 'Ibiza',
    type: 'Beach Club',
    price: '€€€€',
    image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=1000&auto=format&fit=crop',
    // Let op: we gebruiken nu een uitgebreider rating object! 🔥
    rating: { food: 4.5, service: 4.2, vibe: 4.8, totalVotes: 1240 },
    galleries: { view: [], table: [], food: [] }
  }
];

// --- MAIN APP COMPONENT ---
export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [spots, setSpots] = useState(MOCK_SPOTS);
  const [isLive, setIsLive] = useState(false);

  // Haal live data op uit Firebase
  const fetchSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "spots"));
      if (!querySnapshot.empty) {
        const liveData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpots(liveData);
        setIsLive(true);
      }
    } catch (error) {
      console.error("Fout bij ophalen Firebase data:", error);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  // 🔥 Functie om een review live naar Firebase te sturen!
  const handleReviewSubmit = async (spotId, newRatings) => {
    try {
      setToast({ title: "Sending to Cloud...", message: "Jouw vibe check wordt verwerkt..." });
      
      const spotRef = doc(db, "spots", spotId);
      const currentSpot = spots.find(s => s.id === spotId);
      const currentVotes = currentSpot.rating.totalVotes || 0;
      
      // Bereken de nieuwe cumulatieve scores wiskundig
      const newFoodScore = ((currentSpot.rating.food * currentVotes) + newRatings.food) / (currentVotes + 1);
      const newServiceScore = ((currentSpot.rating.service * currentVotes) + newRatings.service) / (currentVotes + 1);
      const newVibeScore = ((currentSpot.rating.vibe * currentVotes) + newRatings.vibe) / (currentVotes + 1);

      // Stuur de nieuwe scores live naar Firebase!
      await updateDoc(spotRef, {
        "rating.food": parseFloat(newFoodScore.toFixed(1)),
        "rating.service": parseFloat(newServiceScore.toFixed(1)),
        "rating.vibe": parseFloat(newVibeScore.toFixed(1)),
        "rating.totalVotes": increment(1)
      });

      // Haal direct de nieuwste data op
      await fetchSpots();

      setToast({ title: "Vibe Saved! 🔥", message: "Jouw beoordeling is verwerkt in de live score." });
      setTimeout(() => setToast(null), 4000);
      setCurrentView('detail');
    } catch (error) {
      alert("Fout bij opslaan van je review: " + error.message);
      setToast(null);
    }
  };

  const navigateToSpot = (spotId) => {
    const foundSpot = spots.find(s => s.id === spotId);
    if (foundSpot) {
      setActiveSpot(foundSpot);
      setCurrentView('detail');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] font-sans text-gray-800 selection:bg-pink-300 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 left-5 right-5 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-50 animate-fade-in flex items-center gap-3 border border-pink-500/30">
          <Flame className="text-pink-400 w-6 h-6 shrink-0 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs text-gray-300">{toast.message}</p>
          </div>
        </div>
      )}

      {currentView === 'home' && <HomeFeed spots={spots} onSelectSpot={navigateToSpot} />}
      {currentView === 'detail' && <SpotDetail spot={spots.find(s => s.id === activeSpot?.id)} onBack={() => setCurrentView('home')} onHaveBeenClick={() => setCurrentView('have_been')} />}
      
      {currentView === 'have_been' && (
        <HaveBeenView 
          spot={activeSpot} 
          onBack={() => setCurrentView('detail')} 
          onSubmit={(newRatings) => handleReviewSubmit(activeSpot.id, newRatings)} 
        />
      )}

      {/* Simple Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/50 pb-safe pt-3 px-6 pb-4 z-40 flex justify-center">
        <button onClick={() => setCurrentView('home')} className="flex flex-col items-center gap-1 text-gray-900">
          <Compass className="w-6 h-6" />
          <span className="text-[10px] font-medium">Discover</span>
        </button>
      </nav>
    </div>
  );
}

// --- 🔥 VERNIEUWDE HAVE BEEN VIEW COMPONENT MET DE 3 SLIDERS EN VLAMMETJES ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [food, setFood] = useState(4.0);
  const [service, setService] = useState(4.0);
  const [vibe, setVibe] = useState(4.0);

  // Bereken live het gemiddelde van je eigen stem
  const personalAverage = ((food + service + vibe) / 3).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32 animate-in slide-in-from-bottom-8 duration-300">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 bg-white rounded-full shadow-sm active:scale-95 transition-transform"><ArrowLeft className="w-5 h-5 text-gray-900" /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Rate The Vibe</h1>
          <p className="text-xs text-gray-500 font-medium">{spot?.name} - {spot?.city}</p>
        </div>
      </header>

      <div className="px-5 mt-6 max-w-md mx-auto space-y-6">
        {/* HET BEOORDELINGSBLOK - Precies zoals je schets! */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-white space-y-6 relative overflow-hidden">
          
          {/* FOOD SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 flex items-center gap-2.5"><Utensils className="w-4 h-4 text-pink-500" /> Food</span>
              <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                {food.toFixed(1)}
              </div>
            </div>
            <input 
              type="range" min="1.0" max="5.0" step="0.1" value={food} 
              onChange={(e) => setFood(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pink-500 transition-all" 
            />
          </div>

          {/* SERVICE SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 flex items-center gap-2.5"><Heart className="w-4 h-4 text-pink-500" /> Service</span>
              <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                {service.toFixed(1)}
              </div>
            </div>
            <input 
              type="range" min="1.0" max="5.0" step="0.1" value={service} 
              onChange={(e) => setService(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pink-500 transition-all" 
            />
          </div>

          {/* VIBE SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 flex items-center gap-2.5"><Camera className="w-4 h-4 text-pink-500" /> Vibe</span>
              <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                {vibe.toFixed(1)}
              </div>
            </div>
            <input 
              type="range" min="1.0" max="5.0" step="0.1" value={vibe} 
              onChange={(e) => setVibe(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pink-500 transition-all" 
            />
          </div>

          {/* EIGEN GEMIDDELDE */}
          <div className="border-t border-gray-100 pt-5 mt-6 flex justify-between items-center bg-gray-50 -mx-6 px-6 pb-2">
            <span className="text-sm font-semibold text-gray-500">Jouw Gemiddelde:</span>
            <span className="text-3xl font-black text-pink-500 flex items-baseline gap-1 animate-pulse">
              {personalAverage} <span className="text-xs font-bold text-pink-400">/ 5.0</span>
            </span>
          </div>

          {/* DE VERZENDKNOP (Submit Vibe Check) */}
          <button 
            onClick={() => onSubmit({ food, service, vibe })} 
            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/20 active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2"
          >
            Submit Vibe Check <Flame className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 🔥 VERNIEUWDE DETAILEERD OVERZICHT VAN DE RATING ---
function SpotDetail({ spot, onBack, onHaveBeenClick }) {
  if (!spot) return null;
  // Bereken het totale gemiddelde score
  const overall = ((spot.rating.food + spot.rating.service + spot.rating.vibe) / 3).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FFF9E3] pb-32 animate-in slide-in-from-right-8 duration-300">
      <div className="relative h-80 w-full">
        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover rounded-b-[3rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-[3rem]"></div>
        <button onClick={onBack} className="absolute top-12 left-5 p-3 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform"><ChevronLeft className="w-6 h-6" /></button>
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-3xl font-black tracking-tight">{spot.name}</h1>
          <p className="text-white/80 font-medium flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {spot.subtitle}</p>
        </div>
      </div>

      <div className="px-5 mt-6 max-w-md mx-auto space-y-4">
        {/* HET LIVE SCOREBOARD CARD */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-white">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
            <div>
              <h3 className="font-black text-xl text-gray-900">Loca Score</h3>
              <p className="text-xs text-gray-400">Gebaseerd op {spot.rating.totalVotes || 0} vibe checks</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded-2xl font-black text-2xl shadow-lg flex items-center gap-2">
              <Flame className="w-6 h-6 animate-pulse" /> {overall}
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-500 flex items-center gap-2.5"><Utensils className="w-4 h-4 text-pink-400" /> Food & Drinks</span>
              <span className="text-gray-900">{spot.rating.food.toFixed(1)} / 5.0</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-500 flex items-center gap-2.5"><Heart className="w-4 h-4 text-pink-400" /> Service & Hospitality</span>
              <span className="text-gray-900">{spot.rating.service.toFixed(1)} / 5.0</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-gray-500 flex items-center gap-2.5"><Camera className="w-4 h-4 text-pink-400" /> Aesthetic & Vibe</span>
              <span className="text-gray-900">{spot.rating.vibe.toFixed(1)} / 5.0</span>
            </div>
          </div>
        </div>

        <button onClick={onHaveBeenClick} className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2.5">
          <Flame className="w-5 h-5 text-pink-400" /> Have you been here?
        </button>
      </div>
    </div>
  );
}

// --- HOME FEED COMPONENT ---
function HomeFeed({ spots, onSelectSpot }) {
  return (
    <div className="pb-24">
      <header className="pt-12 px-5 pb-4 bg-gradient-to-b from-[#FFD1DC]/90 to-transparent flex justify-between items-center">
        <h1 className="text-2xl font-black text-pink-500 tracking-tighter">LocaVibes.</h1>
      </header>
      <main className="px-5 space-y-4 max-w-lg mx-auto">
        {spots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-white cursor-pointer group active:scale-95 transition-all">
            <div className="h-48 w-full overflow-hidden"><img src={spot.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight">{spot.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium"><MapPin className="w-3 h-3" /> {spot.subtitle}</p>
              </div>
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-3 py-1.5 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-md">
                <Flame className="w-3.5 h-3.5 animate-pulse" />
                {((spot.rating.food + spot.rating.service + spot.rating.vibe)/3).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
