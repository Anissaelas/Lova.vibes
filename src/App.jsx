import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, ChevronLeft, ArrowLeft, Utensils, Heart, Camera, Flame, Globe, Plus, Image
} from 'lucide-react';

// FIREBASE IMPORTS
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

const MOCK_SPOTS = [
  {
    id: 'spot_1',
    name: 'Casa Blanca',
    subtitle: 'Bodrum, Turkey',
    city: 'Bodrum',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
    // TOEGEVOEGDE LINKS VOOR JOUW KNOPPEN:
    addressUrl: 'https://maps.google.com/?q=Casa+Blanca+Bodrum',
    websiteUrl: 'https://www.google.com',
    rating: { food: 4.5, service: 4.0, vibe: 4.5, totalVotes: 1 },
    // HIER WORDEN DE GEÜPLOADE FOTO'S LIVE OPGESLAGEN PER CATEGORIE:
    photos: {
      view: [],
      table: [],
      food: []
    }
  }
];

export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [spots, setSpots] = useState(MOCK_SPOTS);

  const fetchSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "spots"));
      if (!querySnapshot.empty) {
        const liveData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Zorg voor veilige fallbacks als velden nog niet in Firebase staan
          return {
            id: doc.id,
            ...data,
            addressUrl: data.addressUrl || 'https://maps.google.com/?q=' + encodeURIComponent(data.name),
            websiteUrl: data.websiteUrl || 'https://www.google.com',
            photos: data.photos || { view: [], table: [], food: [] }
          };
        });
        setSpots(liveData);
      }
    } catch (e) { console.error(e); }
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
      setCurrentView('detail');
    } catch (error) { alert(error.message); }
  };

  // 🔥 MAGISCHE FUNCTIE OM EEN FOTO LIVE TE UPLOADEN EN OP TE SLAAN IN FIREBASE!
  const handlePhotoUpload = async (spotId, category, imageUrl) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      await updateDoc(spotRef, {
        [`photos.${category}`]: arrayUnion(imageUrl)
      });
      await fetchSpots();
    } catch (error) { alert("Fout bij opslaan foto: " + error.message); }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] font-sans text-gray-800 pb-24">
      {currentView === 'home' && <HomeFeed spots={spots} onSelect={(id) => { setActiveSpot(spots.find(s=>s.id===id)); setCurrentView('detail'); }} />}
      {currentView === 'detail' && (
        <SpotDetail 
          spot={spots.find(s => s.id === activeSpot?.id)} 
          onBack={() => setCurrentView('home')} 
          onRate={() => setCurrentView('have_been')} 
          onNewPhoto={(cat, url) => handlePhotoUpload(activeSpot.id, cat, url)}
        />
      )}
      {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r) => handleReviewSubmit(activeSpot.id, r)} />}
      
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 py-4 flex justify-center z-50">
        <button onClick={() => setCurrentView('home')} className="flex flex-col items-center gap-1 text-pink-500"><Compass className="w-6 h-6" /><span className="text-[10px] font-bold">Discover</span></button>
      </nav>
    </div>
  );
}

function FlameRating({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <button key={index} type="button" onClick={() => onChange(index)} className="transition-transform active:scale-125 duration-100">
          <Flame className={`w-6 h-6 ${index <= value ? 'fill-[#FF1493] text-[#FF1493] filter drop-shadow-[0_0_4px_rgba(255,20,147,0.5)]' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

function HomeFeed({ spots, onSelect }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-black text-pink-500 mb-6 tracking-tighter">LocaVibes.</h1>
      {spots.map(spot => (
        <div key={spot.id} onClick={() => onSelect(spot.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 cursor-pointer">
          <img src={spot.image} className="h-48 w-full object-cover" />
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900">{spot.name}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {spot.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 text-sm font-black text-pink-500 bg-pink-50 px-2.5 py-1 rounded-xl">
              <Flame className="w-4 h-4 fill-pink-500" /> {((spot.rating.food + spot.rating.service + spot.rating.vibe)/3).toFixed(1)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- VERNIEUWDE DETAILPAGINA MET ADRES, WEBSITE & VISUAL INTELLIGENCE ---
function SpotDetail({ spot, onBack, onRate, onNewPhoto }) {
  const [activeTab, setActiveTab] = useState('view'); // view, table, of food
  const [uploading, setUploading] = useState(false);

  if (!spot) return null;
  const overall = ((spot.rating.food + spot.rating.service + spot.rating.vibe) / 3).toFixed(1);

  // Filter de foto's op basis van het gekozen menu-tabblad
  const currentPhotos = spot.photos?.[activeTab] || [];

  // Anonieme upload-pijplijn via Imgur API (zodat gebruikers écht foto's kunnen uploaden vanaf Mac/telefoon!)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { Authorization: 'Client-ID 77f0a7bdfd9b3be' }, // Gratis publieke client id
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        onNewPhoto(activeTab, result.data.link);
      } else {
        alert("Upload mislukt, probeer een andere foto.");
      }
    } catch (err) {
      alert("Fout bij uploaden: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-200">
      {/* HEADER AFBEELDING */}
      <div className="relative h-72 w-full">
        <img src={spot.image} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-2xl font-black">{spot.name}</h1>
          <p className="text-sm opacity-80 flex items-center gap-1"><MapPin className="w-3 h-3" /> {spot.subtitle}</p>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-6">
        
        {/* JOUW NIEUWE KNOPPEN: ADDRESS & WEBSITE */}
        <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
          <a href={spot.addressUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-2 hover:bg-gray-50 rounded-xl transition-colors">
            <MapPin className="w-5 "h-5" text-blue-500 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Address</span>
          </a>
          <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-2 hover:bg-gray-50 rounded-xl transition-colors">
            <Globe className="w-5 h-5 text-gray-700 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Website</span>
          </a>
        </div>

        {/* HAVE YOU BEEN HERE BLOK */}
        <button onClick={onRate} className="w-full bg-white text-[#FF1493] border border-gray-100 font-bold py-4 rounded-2xl shadow-sm text-center flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ✔️ Have you been here?
        </button>

        {/* LOCA SCORE CARD */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b pb-3 mb-2">
            <span className="font-bold text-gray-900">Loca Score ({spot.rating.totalVotes || 0} checks)</span>
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm">🔥 {overall}</span>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Utensils className="w-4 h-4" /> Food</span><span className="font-bold">{spot.rating.food.toFixed(1)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Heart className="w-4 h-4" /> Service</span><span className="font-bold">{spot.rating.service.toFixed(1)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500 flex items-center gap-2"><Camera className="w-4 h-4" /> Vibe</span><span className="font-bold">{spot.rating.vibe.toFixed(1)}</span></div>
        </div>

        {/* VISUAL INTELLIGENCE SECTIE - Precies zoals je screenshot! */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Visual Intelligence</h2>
          
          {/* FILTER TABS */}
          <div className="flex bg-gray-100/60 p-1 rounded-xl text-xs font-bold text-gray-500">
            <button onClick={() => setActiveTab('view')} className={`flex-1 py-2.5 rounded-lg text-center transition-all ${activeTab === 'view' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>The View</button>
            <button onClick={() => setActiveTab('table')} className={`flex-1 py-2.5 rounded-lg text-center transition-all ${activeTab === 'table' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>Best Table</button>
            <button onClick={() => setActiveTab('food')} className={`flex-1 py-2.5 rounded-lg text-center transition-all ${activeTab === 'food' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>Food</button>
          </div>

          {/* DYNAMISCHE FOTO CONTAINER */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            {currentPhotos.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-400">No photos here yet. Be the first!</p>
                
                <label className={`inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-4 py-2.5 rounded-xl hover:bg-pink-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
        <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Camera className="w-4 h-4" /> Vibe</span><FlameRating value={vibe} onChange={setVibe} /></div>

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
