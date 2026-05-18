import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, 
  Utensils, Camera, Flame, Globe, Plus, Search, Info, Check, Instagram, CalendarDays, ShieldAlert
} from 'lucide-react';

import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, addDoc } from 'firebase/firestore';

// --- JOUW SPECIFIEKE TAGS PER CATEGORIE ---
const VIBE_TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Fine dining', 'Affordable luxury', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance', 'Sunset view', 'Golden hour', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book'],
  'Beach Club': ['Infinity pool', 'Daybed rental', 'Sunset view', 'Adults only', 'Golden hour', 'Aesthetic interior', 'Dresscode required', 'Card only', 'Cash only', 'Hard to book', 'Party', 'Quiet', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan', 'Gluten-free', 'Halal', 'Great cocktails', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Show', 'Hidden gem', 'DJ'],
  'Hotel': ['View from bed', 'Outdoor bathtub / Jacuzzi', 'Private pool', 'Aesthetic bathroom', 'Boutique hotel', 'Adults only', 'All-inclusive luxury', 'Rooftop pool', 'Rooftop Bar', 'Instagrammable lobby', 'Spa & Wellness', 'Day pass available', 'Workation friendly']
};

const MOCK_CITIES = [
  { id: 'c1', name: 'Bodrum', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop' },
  { id: 'c2', name: 'Ibiza', image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop' },
  { id: 'c3', name: 'Mykonos', image: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=500&auto=format&fit=crop' },
  { id: 'c4', name: 'Barcelona', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=500&auto=format&fit=crop' },
  { id: 'c5', name: 'Monaco', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop' },
  { id: 'c6', name: 'Cannes', image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=500&auto=format&fit=crop' }
];

const BACKUP_SPOTS = [
  { id: 'spot_1', name: 'Casa Blanca', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', cuisine: 'Mediterranean Fusion', dresscode: 'Smart Casual', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000', addressUrl: 'https://maps.google.com/?q=Casa+Blanca+Bodrum', websiteUrl: 'https://google.com', instagramUrl: 'https://instagram.com', bookingUrl: 'https://opentable.com', rating: { food: 4.5, service: 4.0, vibe: 4.5, totalVotes: 1 }, photos: { view: [], table: [], food: [] }, tags: ['Instagrammable', 'Sunset view'] }
];

export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [spots, setSpots] = useState(BACKUP_SPOTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);

  const [savedLists, setSavedLists] = useState([
    { id: 'l1', name: 'Girls Bodrum 🌸', spots: ['spot_1'] }
  ]);

  const fetchSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "spots"));
      if (!querySnapshot.empty) {
        const liveData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          addressUrl: doc.data().addressUrl || 'https://maps.google.com',
          websiteUrl: doc.data().websiteUrl || 'https://google.com',
          instagramUrl: doc.data().instagramUrl || 'https://instagram.com',
          bookingUrl: doc.data().bookingUrl || 'https://opentable.com',
          photos: doc.data().photos || { view: [], table: [], food: [] },
          tags: doc.data().tags || []
        }));
        setSpots(liveData);
        setIsLive(true);
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
        tags: arrayUnion(...selectedTags) 
      });

      await fetchSpots();
      setCurrentView('detail');
    } catch (error) { alert(error.message); }
  };

  const handlePhotoUpload = async (spotId, category, imageUrl) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      const photoData = { url: imageUrl, author: '@sophie_vibes' };
      await updateDoc(spotRef, {
        [`photos.${category}`]: arrayUnion(photoData)
      });
      await fetchSpots();
    } catch (error) { alert("Fout bij opslaan foto: " + error.message); }
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
      {currentView === 'all_places' && <AllPlacesView spots={spots} onSelectCity={(city) => { setActiveCityObj(city); setCurrentView('city_detail'); }} onSelectSpot={navigateToSpot} onAddClick={() => setCurrentView('add_spot')} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
      {currentView === 'city_detail' && <CityDetailView spots={spots} city={activeCityObj} onSelectSpot={navigateToSpot} onBack={() => setCurrentView('all_places')} />}
      {currentView === 'add_spot' && <AddSpotView onBack={() => setCurrentView('all_places')} onSave={handleAddSpot} />}
      {currentView === 'detail' && <SpotDetail spot={spots.find(s => s.id === activeSpot?.id)} onBack={() => setCurrentView(previousView)} onRate={() => setCurrentView('have_been')} onNewPhoto={(cat, url) => handlePhotoUpload(activeSpot.id, cat, url)} />}
      {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r, tags) => handleReviewSubmit(activeSpot.id, r, tags)} />}
      {currentView === 'saved' && <SavedView lists={savedLists} allSpots={spots} onSelectSpot={navigateToSpot} />}
      {currentView === 'profile' && <ProfileView isLive={isLive} />}

      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-400">
          <button onClick={() => setCurrentView('all_places')} className={`flex flex-col items-center gap-1 ${currentView === 'all_places' || currentView === 'city_detail' ? 'text-pink-500 font-bold' : ''}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">All Places</span></button>
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-pink-500 font-bold' : ''}`}><Compass className="w-6 h-6" /><span className="text-[10px]">Home</span></button>
          <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center gap-1 ${currentView === 'saved' ? 'text-pink-500 font-bold' : ''}`}><Heart className="w-6 h-6" /><span className="text-[10px]">My Lists</span></button>
          <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-pink-500 font-bold' : ''}`}><User className="w-6 h-6" /><span className="text-[10px]">Profile</span></button>
        </div>
      </nav>
    </div>
  );
}

// --- FLAME RATING COMPONENT ---
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
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-gray-100 cursor-pointer group">
            <img src={spot.image} className="h-48 w-full object-cover group-active:scale-105 transition-transform" />
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

// --- 2. ALL PLACES (ZOEKEN, STEDEN & TOEVOEGEN) ---
function AllPlacesView({ spots, onSelectCity, onSelectSpot, onAddClick, searchQuery, setSearchQuery }) {
  const isSearching = searchQuery.trim().length > 0;
  
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

      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search 'Bodrum Party' or 'Sunset'..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-sm"
        />
      </div>

      {isSearching ? (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 mb-2">Search Results</h2>
          {filteredSpots.map(spot => (
            <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
              <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-gray-900 leading-tight truncate">{spot.name}</h3>
                <p className="text-xs text-pink-500 mt-1 font-bold">{spot.type} • {spot.city}</p>
                {spot.tags && spot.tags.length > 0 && <p className="text-[10px] text-gray-400 mt-1 truncate">{spot.tags.join(', ')}</p>}
              </div>
            </div>
          ))}
          {filteredSpots.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">No spots found matching your vibe.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 mb-2">Browse by City</h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_CITIES.map((city) => (
              <div key={city.id} onClick={() => onSelectCity(city)} className="relative h-40 rounded-3xl overflow-hidden cursor-pointer shadow-sm group active:scale-95 transition-all">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-lg font-bold leading-none">{city.name}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. CITY DETAIL VIEW (MET FILTERS) ---
function CityDetailView({ spots, city, onSelectSpot, onBack }) {
  const [filter, setFilter] = useState('All');
  const citySpots = spots.filter(s => s.city === city?.name);
  const filteredSpots = filter === 'All' ? citySpots : citySpots.filter(s => s.type === filter);
  const types = ['All', 'Restaurant', 'Beach Club', 'Hotel'];

  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-black text-gray-900">{city?.name}</h1>
      </header>

      {/* FILTER BALK */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === t ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredSpots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
            <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">{spot.type}</p>
            </div>
            <span className="text-xs font-black text-pink-500 bg-pink-50 px-2 py-1 rounded-lg flex items-center gap-1">
              <Flame className="w-3 h-3 fill-pink-500" /> {((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1)}
            </span>
          </div>
        ))}
        {filteredSpots.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">No {filter.toLowerCase()}s found in {city?.name}.</p>}
      </div>
    </div>
  );
}

// --- 4. TOEVOEGEN VAN EEN NIEUWE PLEK ---
function AddSpotView({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('Restaurant');
  
  const handleSave = () => {
    onSave({
      name, city, type, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000', 
      addressUrl: `https://maps.google.com/?q=${name}+${city}`, websiteUrl: 'https://google.com', instagramUrl: 'https://instagram.com', bookingUrl: 'https://opentable.com',
      tags: [], rating: { food: 5, service: 5, vibe: 5, totalVotes: 1 }, photos: { view: [], table: [], food: [] }
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Add a Spot</h1>
      </header>
      <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div><label className="text-xs font-bold text-gray-500">Spot Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" placeholder="e.g. Scorpios" /></div>
        <div><label className="text-xs font-bold text-gray-500">City</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" placeholder="e.g. Mykonos" /></div>
        <div>
          <label className="text-xs font-bold text-gray-500">Type</label>
          <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500">
            <option value="Restaurant">Restaurant / Cafe</option>
            <option value="Beach Club">Beach Club</option>
            <option value="Hotel">Hotel</option>
          </select>
        </div>
        <button onClick={handleSave} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg mt-4 active:scale-95">Save to Database</button>
      </div>
    </div>
  );
}

// --- 5. DE ULTIEME DETAILPAGINA ---
function SpotDetail({ spot, onBack, onRate, onNewPhoto }) {
  const [activeTab, setActiveTab] = useState('view');
  const [uploading, setUploading] = useState(false);

  if (!spot) return null;
  const overall = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe) / 3).toFixed(1);
  const currentPhotos = spot.photos?.[activeTab] || [];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('https://api.imgur.com/3/image', { method: 'POST', headers: { Authorization: 'Client-ID 77f0a7bdfd9b3be' }, body: formData });
      const result = await response.json();
      if (result.success) { onNewPhoto(activeTab, result.data.link); } else { alert("Upload mislukt."); }
    } catch (err) { alert("Fout: " + err.message); } finally { setUploading(false); }
  };

  return (
    <div className="animate-in slide-in-from-right duration-200">
      <div className="relative h-72 w-full">
        <img src={spot.image} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        <div className="absolute bottom-4 left-5 right-5 text-white flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black drop-shadow-md leading-tight">{spot.name}</h1>
            <p className="text-sm font-medium drop-shadow-md flex items-center gap-1 opacity-90"><MapPin className="w-3.5 h-3.5"/> {spot.type} • {spot.city}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30 flex items-center gap-1.5 shadow-lg">
            <Flame className="w-4 h-4 fill-pink-500 text-pink-500" /> <span className="font-black text-lg">{overall}</span>
          </div>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-6">
        
        {/* LINK KNOPPEN (Adres, Website, Insta) */}
        <div className="grid grid-cols-3 gap-3">
          <a href={spot.addressUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
            <MapPin className="w-5 h-5 text-blue-500 mb-1.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Address</span>
          </a>
          <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
            <Globe className="w-5 h-5 text-green-500 mb-1.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Website</span>
          </a>
          <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
            <Instagram className="w-5 h-5 text-pink-500 mb-1.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Instagram</span>
          </a>
        </div>

        {/* GROTE BOOKING & REVIEW KNOPPEN */}
        <div className="grid grid-cols-2 gap-3">
          <a href={spot.bookingUrl} target="_blank" rel="noreferrer" className="bg-gray-900 text-white font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm">
            <CalendarDays className="w-4 h-4"/> Book a Table
          </a>
          <button onClick={onRate} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-pink-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm">
            <Check className="w-4 h-4"/> Have you been?
          </button>
        </div>

        {/* INFO BLOK MET CUISINE & DRESSCODE */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-pink-50 p-2 rounded-full text-pink-500"><Utensils className="w-4 h-4"/></div>
            <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cuisine</p><p className="text-xs font-bold text-gray-900 truncate">{spot.cuisine || 'International'}</p></div>
          </div>
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-full text-blue-500"><Info className="w-4 h-4"/></div>
            <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dresscode</p><p className="text-xs font-bold text-gray-900 truncate">{spot.dresscode || 'Smart Casual'}</p></div>
          </div>
        </div>

        {/* UITGELICHTE TAGS */}
        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.slice(0,6).map((tag, i) => (
              <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-gray-200">{tag}</span>
            ))}
          </div>
        )}

        {/* VISUAL INTELLIGENCE (NU MET USERNAME BIJ FOTO'S) */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Visual Intelligence</h2>
          <div className="flex bg-gray-100/60 p-1 rounded-xl text-xs font-bold text-gray-500">
            <button onClick={() => setActiveTab('view')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'view' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>The View</button>
            <button onClick={() => setActiveTab('table')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'table' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>Best Table</button>
            <button onClick={() => setActiveTab('food')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'food' ? 'bg-white shadow-sm text-pink-600 font-extrabold' : ''}`}>Food</button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
            {currentPhotos.length === 0 ? (
              <div className="space-y-4 py-4">
                <p className="text-sm font-medium text-gray-400">No photos here yet. Be the first!</p>
                <label className={`inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-4 py-2.5 rounded-xl ${uploading ? 'opacity-50' : ''}`}>
                  <Plus className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {currentPhotos.map((photoObj, idx) => {
                    const url = typeof photoObj === 'string' ? photoObj : photoObj.url;
                    const author = typeof photoObj === 'string' ? '@guest' : photoObj.author;
                    return (
                      <div key={idx} className="relative h-40 rounded-xl overflow-hidden shadow-sm border group">
                        <img src={url} className="w-full h-full object-cover" alt="User upload" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                          <span className="text-[9px] font-bold text-white tracking-wider">{author}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-4 py-2.5 rounded-xl mt-2">
                  <Plus className="w-3.5 h-3.5" /> Add Another Photo
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

// --- 6. HAVE BEEN (REVIEW) MET DE SLIMME TAGS KEUZE ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [vibe, setVibe] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);

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
          <h1 className="text-xl font-bold tracking-tight">Vibe Check</h1>
          <p className="text-xs text-pink-500 font-bold">{spot?.name}</p>
        </div>
      </header>

      {/* 1. RATINGS */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Food</span><FlameRating value={food} onChange={setFood} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Service</span><FlameRating value={service} onChange={setService} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Vibe</span><FlameRating value={vibe} onChange={setVibe} /></div>
      </div>

      {/* 2. KIES JE TAGS */}
      <div>
        <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider pl-1">What fits the vibe?</h2>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => toggleTag(tag)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => onSubmit({ food, service, vibe }, selectedTags)}
        disabled={!food || !service || !vibe}
        className={`w-full py-4 rounded-2xl font-black text-white text-center shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${food && service && vibe ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30 active:scale-95' : 'bg-gray-300'}`}
      >
        Submit Vibe Check 🔥
      </button>
    </div>
  );
}

// --- 7. SAVED VIEW / MY LISTS ---
function SavedView({ lists, allSpots, onSelectSpot }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-4">My Lists</h1>
      {lists.map(list => (
        <div key={list.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md space-y-3">
          <h2 className="font-extrabold text-lg text-pink-500">{list.name}</h2>
          <div className="space-y-2">
            {allSpots.filter(s => list.spots.includes(s.id)).map(spot => (
              <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 cursor-pointer hover:text-pink-500">
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

// --- 8. PROFILE VIEW ---
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
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-left flex flex-col gap-3">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
          <ShieldAlert className="w-5 h-5 text-pink-500" />
          <span>Status: {isLive ? <span className="text-green-600 font-bold">Connected to Live Firebase 🔥</span> : <span className="text-amber-500 font-bold">Offline / Backup Mode</span>}</span>
        </div>
      </div>
    </div>
  );
}
