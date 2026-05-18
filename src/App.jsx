import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, 
  Utensils, Camera, Flame, Globe, Plus, Search, Info, Check
} from 'lucide-react';

import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, addDoc } from 'firebase/firestore';

// --- JOUW SPECIFIEKE TAGS PER CATEGORIE ---
const VIBE_TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Fine dining', 'Affordable luxury', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance', 'Sunset view', 'Golden hour', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book'],
  'Beach Club': ['Infinity pool', 'Daybed rental', 'Sunset view', 'Adults only', 'Golden hour', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book', 'Party', 'Quiet', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan', 'Gluten-free', 'Halal', 'Great cocktails', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Show', 'Hidden gem', 'DJ'],
  'Hotel': ['View from bed', 'Outdoor bathtub / Jacuzzi', 'Private pool', 'Aesthetic bathroom', 'Boutique hotel', 'Adults only', 'All-inclusive luxury', 'Rooftop pool', 'Rooftop Bar', 'Instagrammable lobby', 'Spa & Wellness', 'Day pass available', 'Workation friendly']
};

const BACKUP_SPOTS = [
  { id: 'spot_1', name: 'Casa Blanca', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', cuisine: 'Mediterranean Fusion', dresscode: 'Smart Casual', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000', addressUrl: 'http://maps.google.com', websiteUrl: 'https://google.com', rating: { food: 4.5, service: 4.0, vibe: 4.5, totalVotes: 1 }, photos: { view: [], table: [], food: [] }, tags: ['Instagrammable', 'Sunset view'] }
];

export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [spots, setSpots] = useState(BACKUP_SPOTS);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "spots"));
      if (!querySnapshot.empty) {
        const liveData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          photos: doc.data().photos || { view: [], table: [], food: [] },
          tags: doc.data().tags || []
        }));
        setSpots(liveData);
      }
    } catch (e) { console.error("Firebase error:", e); }
  };

  useEffect(() => { fetchSpots(); }, []);

  const handleReviewSubmit = async (spotId, ratings, selectedTags) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      const currentSpot = spots.find(s => s.id === spotId);
      const votes = currentSpot.rating?.totalVotes || 0;
      
      const newFood = ((currentSpot.rating.food * votes) + ratings.food) / (votes + 1);
      const newService = ((currentSpot.rating.service * votes) + ratings.service) / (votes + 1);
      const newVibe = ((currentSpot.rating.vibe * votes) + ratings.vibe) / (votes + 1);

      await updateDoc(spotRef, {
        "rating.food": parseFloat(newFood.toFixed(1)),
        "rating.service": parseFloat(newService.toFixed(1)),
        "rating.vibe": parseFloat(newVibe.toFixed(1)),
        "rating.totalVotes": increment(1),
        // Voeg de nieuwe tags toe aan de lijst van de locatie
        tags: arrayUnion(...selectedTags) 
      });

      await fetchSpots();
      setCurrentView('detail');
    } catch (error) { alert(error.message); }
  };

  const handleAddSpot = async (newSpotData) => {
    try {
      await addDoc(collection(db, "spots"), newSpotData);
      await fetchSpots();
      setCurrentView('all_places');
    } catch (error) { alert(error.message); }
  };

  const navigateToSpot = (spotId) => {
    const foundSpot = spots.find(s => s.id === spotId);
    if (foundSpot) { setPreviousView(currentView); setActiveSpot(foundSpot); setCurrentView('detail'); }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] font-sans text-gray-800 pb-28 relative">
      
      {currentView === 'home' && <HomeFeed spots={spots} onSelectSpot={navigateToSpot} />}
      {currentView === 'all_places' && <AllPlacesView spots={spots} onSelectSpot={navigateToSpot} onAddClick={() => setCurrentView('add_spot')} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {currentView === 'add_spot' && <AddSpotView onBack={() => setCurrentView('all_places')} onSave={handleAddSpot} />}
      {currentView === 'detail' && <SpotDetail spot={spots.find(s => s.id === activeSpot?.id)} onBack={() => setCurrentView(previousView)} onRate={() => setCurrentView('have_been')} />}
      {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r, tags) => handleReviewSubmit(activeSpot.id, r, tags)} />}

      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-400">
          <button onClick={() => setCurrentView('all_places')} className={`flex flex-col items-center gap-1 ${currentView === 'all_places' ? 'text-pink-500 font-bold' : ''}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">All Places</span></button>
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-pink-500 font-bold' : ''}`}><Compass className="w-6 h-6" /><span className="text-[10px]">Home</span></button>
          <button className="flex flex-col items-center gap-1"><Heart className="w-6 h-6" /><span className="text-[10px]">My Lists</span></button>
          <button className="flex flex-col items-center gap-1"><User className="w-6 h-6" /><span className="text-[10px]">Profile</span></button>
        </div>
      </nav>
    </div>
  );
}

// --- FLAME RATING ---
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

// --- 1. HOME FEED ---
function HomeFeed({ spots, onSelectSpot }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-pink-500 tracking-tighter mb-4">LocaVibes.</h1>
      <div className="space-y-4">
        {spots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 cursor-pointer">
            <img src={spot.image} className="h-48 w-full object-cover" />
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-medium"><MapPin className="w-3 h-3" /> {spot.city}</p>
              </div>
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-white" /> {((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 2. ALL PLACES MET ZOEKFUNCTIE & TOEVOEGEN ---
function AllPlacesView({ spots, onSelectSpot, onAddClick, searchQuery, setSearchQuery }) {
  // Zoekmachine logica (zoekt in naam, stad, type én tags!)
  const filteredSpots = spots.filter(spot => {
    const term = searchQuery.toLowerCase();
    const searchString = `${spot.name} ${spot.city} ${spot.type} ${spot.tags?.join(' ')}`.toLowerCase();
    return searchString.includes(term);
  });

  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Places</h1>
        <button onClick={onAddClick} className="bg-pink-50 text-pink-500 p-2.5 rounded-full font-bold shadow-sm active:scale-95"><Plus className="w-5 h-5" /></button>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search 'Bodrum Party' or 'Sunset'..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
        />
      </div>

      <div className="space-y-3 mt-4">
        {filteredSpots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
            <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
              <p className="text-xs text-pink-500 mt-1 font-bold">{spot.type} • {spot.city}</p>
              {spot.tags && spot.tags.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-1 truncate">{spot.tags.slice(0, 3).join(', ')}...</p>
              )}
            </div>
          </div>
        ))}
        {filteredSpots.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">No spots found matching your vibe.</p>}
      </div>
    </div>
  );
}

// --- 3. TOEVOEGEN VAN EEN NIEUWE PLEK ---
function AddSpotView({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('Restaurant');
  
  const handleSave = () => {
    onSave({
      name, city, type, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000', // Standaard foto voor nu
      addressUrl: `https://maps.google.com/?q=${name}+${city}`, websiteUrl: '', tags: [],
      rating: { food: 5, service: 5, vibe: 5, totalVotes: 1 }, photos: { view: [], table: [], food: [] }
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Add a Spot</h1>
      </header>
      <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div><label className="text-xs font-bold text-gray-500">Spot Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1" placeholder="e.g. Scorpios" /></div>
        <div><label className="text-xs font-bold text-gray-500">City</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1" placeholder="e.g. Mykonos" /></div>
        <div>
          <label className="text-xs font-bold text-gray-500">Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1">
            <option value="Restaurant">Restaurant / Cafe</option>
            <option value="Beach Club">Beach Club</option>
            <option value="Hotel">Hotel</option>
          </select>
        </div>
        <button onClick={handleSave} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg mt-4">Save to Database</button>
      </div>
    </div>
  );
}

// --- 4. DETAIL SCHERM (NU MET CUISINE & DRESSCODE) ---
function SpotDetail({ spot, onBack, onRate }) {
  if (!spot) return null;
  const overall = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe) / 3).toFixed(1);

  return (
    <div className="animate-in slide-in-from-right duration-200">
      <div className="relative h-72 w-full">
        <img src={spot.image} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        <div className="absolute bottom-4 left-5 text-white">
          <h1 className="text-3xl font-black drop-shadow-md">{spot.name}</h1>
          <p className="text-sm font-medium drop-shadow-md">{spot.type} • {spot.city}</p>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-5">
        
        {/* INFO BLOK MET CUISINE & DRESSCODE */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-pink-50 p-2 rounded-full text-pink-500"><Utensils className="w-4 h-4"/></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">Cuisine</p><p className="text-xs font-bold text-gray-900">{spot.cuisine || 'International'}</p></div>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-full text-blue-500"><Info className="w-4 h-4"/></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase">Dresscode</p><p className="text-xs font-bold text-gray-900">{spot.dresscode || 'Casual'}</p></div>
          </div>
        </div>

        <button onClick={onRate} className="w-full bg-[#FF1493] text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-500/30 text-center flex items-center justify-center gap-2 active:scale-95">
          <Check className="w-5 h-5"/> Have you been here?
        </button>

        {/* UITGELICHTE TAGS */}
        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.slice(0,6).map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-gray-200">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 5. HAVE BEEN (REVIEW) MET DE NIEUWE TAG KEUZES ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [vibe, setVibe] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);

  // Bepaal welke tags we laten zien op basis van het type spot!
  const availableTags = VIBE_TAGS[spot?.type] || VIBE_TAGS['Restaurant'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) { setSelectedTags(selectedTags.filter(t => t !== tag)); } 
    else { setSelectedTags([...selectedTags, tag]); }
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom duration-200 pb-32">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-xl font-bold">Vibe Check</h1>
          <p className="text-xs text-pink-500 font-bold">{spot?.name}</p>
        </div>
      </header>

      {/* 1. RATINGS */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm space-y-5">
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Food</span><FlameRating value={food} onChange={setFood} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Service</span><FlameRating value={service} onChange={setService} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Vibe</span><FlameRating value={vibe} onChange={setVibe} /></div>
      </div>

      {/* 2. KIES JE TAGS (Afhankelijk van Restaurant/Beachclub/Hotel) */}
      <div>
        <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">What fits the vibe?</h2>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => toggleTag(tag)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => onSubmit({ food, service, vibe }, selectedTags)}
        disabled={!food || !service || !vibe}
        className={`w-full py-4 rounded-2xl font-black text-white text-center shadow-lg transition-all flex items-center justify-center gap-2 ${food && service && vibe ? 'bg-[#FF1493] shadow-pink-500/30' : 'bg-gray-300'}`}
      >
        Submit Vibe Check 🔥
      </button>
    </div>
  );
}
