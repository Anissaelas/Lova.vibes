import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, 
  Utensils, Camera, Flame, Globe, Plus, Search, Info, Check, Instagram, CalendarDays, 
  ShieldAlert, Share2, Edit3, Settings, LogOut, Grid, Calendar
} from 'lucide-react';

import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, addDoc } from 'firebase/firestore';

// --- CURATED VIBE TAGS PER CATEGORY (UK ENGLISH) ---
const VIBE_TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Fine dining', 'Affordable luxury', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance', 'Sunset view', 'Golden hour spot', 'Aesthetic interior', 'Dress code required', 'Card only', 'Cash only', 'Hard to book'],
  'Beach Club': ['Infinity pool', 'Daybed rental required', 'Sunset view', 'Adults only', 'Golden hour spot', 'Aesthetic interior', 'Dress code required', 'Card only', 'Cash only', 'Hard to book', 'Party', 'Quiet', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Live show', 'Hidden gem', 'Resident DJ'],
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
  { id: 'spot_1', name: 'Casa Blanca', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', cuisine: 'Mediterranean Fusion', dresscode: 'Smart Casual', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000', addressUrl: 'https://maps.google.com/?q=Casa+Blanca+Bodrum', websiteUrl: 'https://google.com', instagramUrl: 'https://instagram.com', bookingUrl: 'https://opentable.com', rating: { food: 4.5, service: 4.0, vibe: 4.5, totalVotes: 1 }, tags: ['Instagrammable', 'Sunset view'] },
  { id: 'spot_2', name: 'Lumière', subtitle: 'Cannes, France', city: 'Cannes', type: 'Restaurant', cuisine: 'French Fine Dining', dresscode: 'Elegant', image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=1000', addressUrl: 'https://maps.google.com/?q=Casa+Blanca+Bodrum', websiteUrl: 'https://google.com', instagramUrl: 'https://instagram.com', bookingUrl: 'https://opentable.com', rating: { food: 4.8, service: 4.6, vibe: 4.9, totalVotes: 1 }, tags: ['Luxury', 'Fine dining'] }
];

export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [spots, setSpots] = useState(BACKUP_SPOTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);

  // --- STATE FOR MY LISTS (WITH TRIP DATES & NOTES) ---
  const [savedLists, setSavedLists] = useState([
    { id: 'l1', name: 'Girls Bodrum Trip 🌸', coverImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500', spots: ['spot_1'], notes: 'Book Casa Blanca for the first night. Sunset view is insane!', dates: '12 June - 19 June 2026' }
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

  const handleAddSpot = async (newSpotData) => {
    try {
      await addDoc(collection(db, "spots"), newSpotData);
      await fetchSpots();
      setCurrentView('all_places');
    } catch (error) { alert(error.message); }
  };

  const handleCreateList = (listName, coverImage, tripDates) => {
    const newList = {
      id: `list_${Date.now()}`,
      name: listName,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500',
      spots: [],
      notes: '',
      dates: tripDates || 'Dates not set'
    };
    setSavedLists([...savedLists, newList]);
    setCurrentView('saved');
  };

  const handleUpdateNotes = (listId, newNotes) => {
    setSavedLists(prev => prev.map(l => l.id === listId ? { ...l, notes: newNotes } : l));
  };

  const handleUpdateDates = (listId, newDates) => {
    setSavedLists(prev => prev.map(l => l.id === listId ? { ...l, dates: newDates } : l));
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
      {currentView === 'detail' && <SpotDetail spot={spots.find(s => s.id === activeSpot?.id)} onBack={() => setCurrentView(previousView)} onRate={() => setCurrentView('have_been')} />}
      {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r, tags) => handleReviewSubmit(activeSpot.id, r, tags)} />}
      
      {/* MY LISTS VIEWS */}
      {currentView === 'saved' && <SavedView lists={savedLists} allSpots={spots} onSelectSpot={navigateToSpot} onCreateClick={() => setCurrentView('create_list')} onOpenList={(id) => { setActiveListId(id); setCurrentView('list_detail'); }} />}
      {currentView === 'create_list' && <CreateListView onBack={() => setCurrentView('saved')} onSave={handleCreateList} />}
      {currentView === 'list_detail' && <ListDetailView list={savedLists.find(l => l.id === activeListId)} allSpots={spots} onBack={() => setCurrentView('saved')} onSelectSpot={navigateToSpot} onUpdateNotes={handleUpdateNotes} onUpdateDates={handleUpdateDates} />}
      
      {currentView === 'profile' && <ProfileView isLive={isLive} listsCount={savedLists.length} />}

      {/* REORDERED NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-400">
          <button onClick={() => setCurrentView('all_places')} className={`flex flex-col items-center gap-1 ${currentView === 'all_places' || currentView === 'city_detail' ? 'text-pink-500 font-bold' : ''}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">All Places</span></button>
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-pink-500 font-bold' : ''}`}><Compass className="w-6 h-6" /><span className="text-[10px]">Home</span></button>
          <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center gap-1 ${currentView === 'saved' || currentView === 'list_detail' ? 'text-pink-500 font-bold' : ''}`}><Heart className="w-6 h-6" /><span className="text-[10px]">My Lists</span></button>
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
  const top10 = [...spots]
    .filter(s => s.type === 'Restaurant')
    .sort((a, b) => {
      const scoreA = ((a.rating?.food || 0) + (a.rating?.service || 0) + (a.rating?.vibe || 0)) / 3;
      const scoreB = ((b.rating?.food || 0) + (b.rating?.service || 0) + (b.rating?.vibe || 0)) / 3;
      return scoreB - scoreA;
    }).slice(0, 10);

  const JUST_OPENED = [
    { id: 'jo1', name: 'Gigi Rigolatto', city: 'Dubai', type: 'Restaurant', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500' },
    { id: 'jo2', name: 'Zuma Beachhouse', city: 'Ibiza', type: 'Beach Club', image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500' }
  ];

  const SOON_TO_OPEN = [
    { id: 'sto1', name: 'Scorpios', city: 'Bodrum', expected: 'June 2026', image: 'https://images.unsplash.com/photo-1515238152791-8225bf064fe5?q=80&w=500' }
  ];

  return (
    <div className="pb-8 animate-in fade-in duration-200">
      <div className="px-5 pt-10 mb-6">
        <h1 className="text-3xl font-black text-pink-500 tracking-tighter">LocaVibes.</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">Curated aesthetics around the globe.</p>
      </div>

      <div className="pl-5 mb-10">
        <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight flex items-center gap-2">Global Top 10 🏆</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pr-5 pb-4 snap-x snap-mandatory">
          {top10.map((spot, index) => {
            const score = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1);
            return (
              <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="snap-start relative min-w-[260px] h-[320px] bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 cursor-pointer group shrink-0 active:scale-95 transition-transform">
                <img src={spot.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg text-lg">#{index + 1}</div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="font-black text-2xl leading-tight mb-1">{spot.name}</h3>
                  <p className="text-xs font-bold opacity-80 flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" /> {spot.city}</p>
                  <div className="inline-flex bg-gradient-to-r from-pink-500 to-rose-500 backdrop-blur px-3 py-1.5 rounded-xl items-center gap-1.5 shadow-md">
                    <Flame className="w-4 h-4 fill-white text-white" />
                    <span className="text-sm font-black">{score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 mb-10">
        <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Just Opened ✨</h2>
        <div className="space-y-4">
          {JUST_OPENED.map(spot => (
            <div key={spot.id} className="bg-white rounded-2xl p-3 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
              <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
                <p className="text-xs text-pink-500 font-bold mt-0.5">{spot.type}</p>
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {spot.city}</p>
              </div>
              <div className="bg-pink-50 text-pink-500 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider">New</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5">
        <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Soon To Open 🚧</h2>
        <div className="space-y-4">
          {SOON_TO_OPEN.map(spot => (
            <div key={spot.id} className="bg-gray-50 rounded-2xl p-3 flex items-center gap-4 border border-gray-100 cursor-pointer opacity-80">
              <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0 grayscale-[40%]" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mt-1"><MapPin className="w-3 h-3"/> {spot.city}</p>
              </div>
              <div className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-[10px] font-bold text-center w-24">Expected:<br/>{spot.expected}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 2. ALL PLACES ---
function AllPlacesView({ spots, onSelectCity, onSelectSpot, onAddClick, searchQuery, setSearchQuery }) {
  const isSearching = searchQuery.trim().length > 0;
  const filteredSpots = spots.filter(spot => `${spot.name} ${spot.city} ${spot.type} ${spot.tags?.join(' ')}`.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Places</h1>
        <button onClick={onAddClick} className="bg-pink-50 text-pink-500 p-2.5 rounded-full font-bold shadow-sm active:scale-95"><Plus className="w-5 h-5" /></button>
      </div>
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
        <input type="text" placeholder="Search 'Bodrum Party' or 'Sunset'..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium text-sm" />
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
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 mb-2">Browse by City</h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_CITIES.map((city) => (
              <div key={city.id} onClick={() => onSelectCity(city)} className="relative h-40 rounded-3xl overflow-hidden cursor-pointer shadow-sm group active:scale-95 transition-all">
                <img src={city.image} alt={city.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80"></div>
                <div className="absolute bottom-4 left-4 text-white"><h2 className="text-lg font-bold leading-none">{city.name}</h2></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. CITY DETAIL VIEW ---
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
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {types.map(t => <button key={t} onClick={() => setFilter(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === t ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}>{t}</button>)}
      </div>
      <div className="space-y-3">
        {filteredSpots.map(spot => (
          <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
            <img src={spot.image} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">{spot.type}</p>
            </div>
            <span className="text-xs font-black text-pink-500 bg-pink-50 px-2 py-1 rounded-lg flex items-center gap-1"><Flame className="w-3 h-3 fill-pink-500" /> {((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 4. ADD A NEW SPOT ---
function AddSpotView({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('Restaurant');
  
  const handleSave = () => {
    onSave({ name, city, type, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000', addressUrl: `https://maps.google.com/?q=${name}+${city}`, websiteUrl: 'https://google.com', instagramUrl: 'https://instagram.com', bookingUrl: 'https://opentable.com', tags: [], rating: { food: 5, service: 5, vibe: 5, totalVotes: 1 } });
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Add a Spot</h1>
      </header>
      <div className="space-y-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div><label className="text-xs font-bold text-gray-500">Spot Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" /></div>
        <div><label className="text-xs font-bold text-gray-500">City</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" /></div>
        <div><label className="text-xs font-bold text-gray-500">Type</label><select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500"><option>Restaurant</option><option>Beach Club</option><option>Hotel</option></select></div>
        <button onClick={handleSave} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg mt-4">Save to Database</button>
      </div>
    </div>
  );
}

// --- 5. SPOT DETAIL SCREEN ---
function SpotDetail({ spot, onBack, onRate }) {
  if (!spot) return null;
  const overall = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe) / 3).toFixed(1);

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
        <div className="grid grid-cols-3 gap-3">
          <a href={spot.addressUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><MapPin className="w-5 h-5 text-blue-500 mb-1.5" /><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Address</span></a>
          <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><Globe className="w-5 h-5 text-green-500 mb-1.5" /><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Website</span></a>
          <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><Instagram className="w-5 h-5 text-pink-500 mb-1.5" /><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Instagram</span></a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a href={spot.bookingUrl} target="_blank" rel="noreferrer" className="bg-gray-900 text-white font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm"><CalendarDays className="w-4 h-4"/> Book a Table</a>
          <button onClick={onRate} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-pink-500/30 flex items-center justify-center gap-2 text-sm"><Check className="w-4 h-4"/> Have you been?</button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"><div className="bg-pink-50 p-2 rounded-full text-pink-500"><Utensils className="w-4 h-4"/></div><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cuisine</p><p className="text-xs font-bold text-gray-900 truncate">{spot.cuisine || 'International'}</p></div></div>
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"><div className="bg-blue-50 p-2 rounded-full text-blue-500"><Info className="w-4 h-4"/></div><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dress Code</p><p className="text-xs font-bold text-gray-900 truncate">{spot.dresscode || 'Smart Casual'}</p></div></div>
        </div>

        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.slice(0,6).map((tag, i) => (
              <span key={i} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-gray-200">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 6. HAVE BEEN (REVIEW) ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [food, setFood] = useState(0); const [service, setService] = useState(0); const [vibe, setVibe] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const availableTags = VIBE_TAGS[spot?.type] || VIBE_TAGS['Restaurant'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag)); 
    else setSelectedTags([...selectedTags, tag]);
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom duration-200 pb-32">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="text-xl font-bold tracking-tight">Vibe Check</h1><p className="text-xs text-pink-500 font-bold">{spot?.name}</p></div>
      </header>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Food</span><FlameRating value={food} onChange={setFood} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Service</span><FlameRating value={service} onChange={setService} /></div>
        <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-700">Vibe</span><FlameRating value={vibe} onChange={setVibe} /></div>
      </div>

      <div>
        <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider pl-1">What fits the vibe?</h2>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}>{tag}</button>
          ))}
        </div>
      </div>

      <button onClick={() => onSubmit({ food, service, vibe }, selectedTags)} disabled={!food || !service || !vibe} className={`w-full py-4 rounded-2xl font-black text-white text-center shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${food && service && vibe ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30' : 'bg-gray-300'}`}>Submit Vibe Check 🔥</button>
    </div>
  );
}

// --- 7. SAVED VIEW / MY LISTS ---
function SavedView({ lists, onCreateClick, onOpenList }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Lists</h1>
        <button onClick={onCreateClick} className="bg-pink-50 text-pink-500 p-2.5 rounded-full font-bold shadow-sm active:scale-95"><Plus className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {lists.map(list => (
          <div key={list.id} onClick={() => onOpenList(list.id)} className="relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-sm group active:scale-95 transition-all">
            <img src={list.coverImage} className="w-full h-full object-cover" alt={list.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-sm font-bold leading-tight">{list.name}</h2>
              <p className="text-[10px] font-medium text-pink-300 mt-1">{list.spots.length} spots</p>
            </div>
          </div>
        ))}
        {lists.length === 0 && <p className="text-gray-400 text-sm mt-4 col-span-2 text-center">No lists created yet. Tap the + to start!</p>}
      </div>
    </div>
  );
}

// --- 8. CREATE LIST VIEW (WITH TRIP DATES INPUT) ---
function CreateListView({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tripDates, setTripDates] = useState('');

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom duration-200">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">New List</h1>
      </header>
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500">List Name</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" placeholder="e.g. Ibiza Opening Week 🌸" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Trip Dates</label>
          <input type="text" value={tripDates} onChange={e=>setTripDates(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" placeholder="e.g. 12 July - 19 July 2026" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Cover Image URL</label>
          <input type="text" value={coverImage} onChange={e=>setCoverImage(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-pink-500" placeholder="https://images.unsplash.com/..." />
        </div>
        <button onClick={() => name && onSave(name, coverImage, tripDates)} className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg mt-4">Create List</button>
      </div>
    </div>
  );
}

// --- 9. LIST DETAIL VIEW (DATES & NOTES WORK LIVE) ---
function ListDetailView({ list, allSpots, onBack, onSelectSpot, onUpdateNotes, onUpdateDates }) {
  if (!list) return null;
  const listSpots = allSpots.filter(s => list.spots.includes(s.id));
  const [notes, setNotes] = useState(list.notes || '');
  const [dates, setDates] = useState(list.dates || '');

  const shareList = () => {
    const text = `Check out my LocaVibes list: ${list.name}! Trip Dates: ${dates}. Spots: ${listSpots.map(s => s.name).join(', ')}`;
    window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="animate-in slide-in-from-right duration-200">
      <div className="relative h-64 w-full">
        <img src={list.coverImage} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-black/30"></div>
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-white/20 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-black drop-shadow-md">{list.name}</h1>
          <p className="text-sm font-medium">{listSpots.length} saved spots</p>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-6">
        <button onClick={shareList} className="w-full bg-[#25D366] text-white font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95">
          <Share2 className="w-5 h-5"/> Share via WhatsApp
        </button>

        {/* TRIP DATES SECTION */}
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-pink-500"/> Trip Dates</h2>
          <input 
            type="text"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            onBlur={() => onUpdateDates(list.id, dates)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-700 font-bold focus:outline-pink-500 shadow-sm"
            placeholder="Set trip dates..."
          />
        </div>

        {/* NOTES SECTION */}
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2"><Edit3 className="w-4 h-4 text-pink-500"/> Trip Notes</h2>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdateNotes(list.id, notes)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-700 min-h-[120px] focus:outline-pink-500 shadow-sm"
            placeholder="Type notes, budgets or booking references here..."
          />
        </div>

        <div>
          <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-wider">Saved Hotspots</h2>
          <div className="space-y-3">
            {listSpots.map(spot => (
              <div key={spot.id} onClick={() => onSelectSpot(spot.id)} className="bg-white rounded-2xl p-2 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
                <img src={spot.image} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm">{spot.name}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">{spot.city}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180 mr-2" />
              </div>
            ))}
            {listSpots.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No hotspots saved in this list yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 10. PROFILE VIEW ---
function ProfileView({ isLive, listsCount }) {
  return (
    <div className="p-5 max-w-md mx-auto pt-16 space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-pink-400 to-rose-400"></div>
        <div className="relative mt-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg bg-white">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" className="w-full h-full object-cover" alt="" />
          </div>
          <h1 className="text-xl font-black text-gray-900 mt-3">Sophie L.</h1>
          <p className="text-xs text-pink-500 font-bold">@sophie_vibes</p>
          <p className="text-sm text-gray-500 font-medium mt-2">Chasing aesthetic sunsets & best tables around the globe. 🌍🥂</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <span className="block text-2xl font-black text-gray-900">12</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vibe Checks</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-black text-gray-900">{listsCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Saved Lists</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider pl-1">Settings & App</h2>
        
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50">
          <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Settings className="w-5 h-5"/></div>
          <div className="flex-1"><h3 className="font-bold text-sm text-gray-900">Account Settings</h3><p className="text-[10px] text-gray-400">Change name or profile photo</p></div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50">
          <div className="bg-blue-50 p-2 rounded-full text-blue-500"><Grid className="w-5 h-5"/></div>
          <div className="flex-1"><h3 className="font-bold text-sm text-gray-900">Connect Instagram</h3><p className="text-[10px] text-gray-400">Import your saved places</p></div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`p-2 rounded-full ${isLive ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}><ShieldAlert className="w-5 h-5"/></div>
          <div className="flex-1">
            <h3 className="font-bold text-sm text-gray-900">Database Connection</h3>
            <p className="text-[10px] text-gray-400">{isLive ? 'Connected to live Firebase kluis' : 'Offline backup mode'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-red-50 text-red-500 mt-6">
          <div className="p-2"><LogOut className="w-5 h-5"/></div>
          <div className="flex-1"><h3 className="font-bold text-sm">Log Out</h3></div>
        </div>
      </div>
    </div>
  );
}
