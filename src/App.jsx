import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, 
  Utensils, Camera, Flame, Globe, Plus, Search, Info, Check, Instagram, CalendarDays, 
  ShieldAlert, Share2, Edit3, Settings, LogOut, Grid, Calendar, Image as ImageIcon, Lock, Mail, Upload, SlidersHorizontal, Bookmark, Map
} from 'lucide-react';

import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const VIBE_TAGS = {
  'Restaurant': ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails', 'Fine dining', 'Affordable luxury', 'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance', 'Sunset view', 'Golden hour spot', 'Aesthetic interior', 'Dress code required', 'Card only', 'Cash only', 'Hard to book'],
  'Cafe': ['Quiet', 'Workation friendly', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan friendly', 'Gluten-free', 'Instagrammable', 'Aesthetic interior', 'Specialty coffee', 'Hidden gem'],
  'Lunch': ['Business', 'Quiet', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Aesthetic interior', 'Healthy options', 'Hidden gem'],
  'Breakfast': ['Early bird', 'Solo-friendly', 'Group-friendly', 'Vega/Vegan friendly', 'Gluten-free', 'Healthy options', 'Aesthetic interior', 'Specialty coffee', 'Bottomless brunch'],
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

export default function LocaVibesApp() {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [currentView, setCurrentView] = useState('home'); 
  const [viewMode, setViewMode] = useState('list'); // 'list' of 'map'
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [spots, setSpots] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  // Quick Save Modal State
  const [quickSaveSpotId, setQuickSaveSpotId] = useState(null);

  const [savedLists, setSavedLists] = useState([
    { id: 'default_favorites', name: 'My favorites', coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=500', spots: [], notes: 'My all-time favourite curated spots.', dates: 'Always' }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
      if (currentUser) fetchSpots();
    });
    return unsubscribe;
  }, []);

  const fetchSpots = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "spots"));
      if (!querySnapshot.empty) {
        const liveData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          photos: doc.data().photos || { view: [], table: [], food: [] } // Zorg dat de foto-structuur altijd bestaat
        }));
        setSpots(liveData);
        setIsLive(true);
      } else {
        setSpots([]);
        setIsLive(true);
      }
    } catch (e) { console.error("Firebase error:", e); }
  };

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
      id: `list_${Date.now()}`, name: listName, coverImage: coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500',
      spots: [], notes: '', dates: tripDates || 'Dates not set'
    };
    setSavedLists([...savedLists, newList]);
    setCurrentView('saved');
  };

  const handleAddSpotToList = (spotId, listId) => {
    setSavedLists(prev => prev.map(list => {
      if (list.id === listId) {
        if (!list.spots.includes(spotId)) {
          return { ...list, spots: [...list.spots, spotId] };
        }
      }
      return list;
    }));
    setQuickSaveSpotId(null);
  };

  const handlePhotoUpload = async (spotId, category, imageUrl) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      const photoData = { url: imageUrl, author: user?.email?.split('@')[0] || '@guest' };
      await updateDoc(spotRef, {
        [`photos.${category}`]: arrayUnion(photoData)
      });
      await fetchSpots(); // Herlaad de data zodat je foto direct zichtbaar is!
    } catch (error) { alert("Fout bij opslaan foto: " + error.message); }
  };

  const navigateToSpot = (spotId) => {
    const foundSpot = spots.find(s => s.id === spotId);
    if (foundSpot) { setPreviousView(currentView); setActiveSpot(foundSpot); setCurrentView('detail'); }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#FFFEE0] flex items-center justify-center font-black text-2xl text-gray-900 tracking-tighter animate-pulse">LOQA.</div>;
  }

  if (!user) return <AuthView />;

  return (
    <div className="min-h-screen bg-[#FFFEE0] font-sans text-gray-800 pb-28 relative">
      
      {/* FLOATING MAP TOGGLE BUTTON */}
      {(currentView === 'home' || currentView === 'all_places' || currentView === 'city_detail') && (
        <button 
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#222222] border border-[#333333] text-white font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Map className="w-4 h-4 text-[#FF1493]" />
          {viewMode === 'list' ? 'View on Map' : 'View List'}
        </button>
      )}

      {/* QUICK SAVE PIN MODAL */}
      {quickSaveSpotId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-[#222222] border-t border-[#333333] w-full max-w-md rounded-t-3xl p-6 space-y-4 text-white pb-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-lg tracking-tight">Pin to List</h3>
              <button onClick={() => setQuickSaveSpotId(null)} className="text-gray-400 font-bold text-sm bg-[#333333] px-3 py-1 rounded-full">Cancel</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedLists.map(l => (
                <button key={l.id} onClick={() => handleAddSpotToList(quickSaveSpotId, l.id)} className="w-full text-left bg-[#333333] hover:bg-[#444444] p-4 rounded-xl font-bold text-sm transition-colors flex justify-between items-center group">
                  <span className="flex items-center gap-3">
                    <img src={l.coverImage} className="w-8 h-8 rounded-md object-cover" />
                    {l.name}
                  </span>
                  <Plus className="w-5 h-5 text-[#FF1493] group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEWS BASED ON LIST OR MAP MODE */}
      {viewMode === 'map' ? (
        <MapView spots={spots} onSelectSpot={(id) => { setViewMode('list'); navigateToSpot(id); }} onBack={() => setViewMode('list')} />
      ) : (
        <>
          {currentView === 'home' && <HomeFeed spots={spots} onSelectSpot={navigateToSpot} onQuickSave={setQuickSaveSpotId} />}
          {currentView === 'all_places' && <AllPlacesView spots={spots} onSelectCity={(city) => { setActiveCityObj(city); setCurrentView('city_detail'); }} onSelectSpot={navigateToSpot} onAddClick={() => setCurrentView('add_spot')} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onQuickSave={setQuickSaveSpotId} />}
          {currentView === 'city_detail' && <CityDetailView spots={spots} city={activeCityObj} onSelectSpot={navigateToSpot} onBack={() => setCurrentView('all_places')} onQuickSave={setQuickSaveSpotId} />}
          {currentView === 'add_spot' && <AddSpotView onBack={() => setCurrentView('all_places')} onSave={handleAddSpot} />}
          
          {currentView === 'detail' && (
            <SpotDetail 
              spot={spots.find(s => s.id === activeSpot?.id)} 
              onBack={() => setCurrentView(previousView)} 
              onRate={() => setCurrentView('have_been')} 
              onQuickSave={setQuickSaveSpotId}
              onNewPhoto={(cat, url) => handlePhotoUpload(activeSpot.id, cat, url)}
            />
          )}
          
          {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r, tags) => handleReviewSubmit(activeSpot.id, r, tags)} />}
          
          {currentView === 'saved' && <SavedView lists={savedLists} onOpenList={(id) => { setActiveListId(id); setCurrentView('list_detail'); }} onCreateClick={() => setCurrentView('create_list')} />}
          {currentView === 'create_list' && <CreateListView onBack={() => setCurrentView('saved')} onSave={handleCreateList} />}
          {currentView === 'list_detail' && <ListDetailView list={savedLists.find(l => l.id === activeListId)} allSpots={spots} onBack={() => setCurrentView('saved')} onSelectSpot={navigateToSpot} onUpdateNotes={(id, n) => setSavedLists(prev => prev.map(l => l.id === id ? { ...l, notes: n } : l))} onUpdateDates={(id, d) => setSavedLists(prev => prev.map(l => l.id === id ? { ...l, dates: d } : l))} />}
          
          {currentView === 'profile' && <ProfileView isLive={isLive} listsCount={savedLists.length} userEmail={user.email} onBulkImport={fetchSpots} />}
        </>
      )}

      {/* CHROME / DARK NAV BAR */}
      <nav className="fixed bottom-0 w-full bg-[#222222] border-t border-[#333333] pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-500">
          <button onClick={() => { setViewMode('list'); setCurrentView('all_places'); }} className={`flex flex-col items-center gap-1 ${currentView === 'all_places' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : 'hover:text-gray-300'}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">All Places</span></button>
          <button onClick={() => { setViewMode('list'); setCurrentView('home'); }} className={`flex flex-col items-center gap-1 ${currentView === 'home' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : 'hover:text-gray-300'}`}><Compass className="w-6 h-6" /><span className="text-[10px]">Home</span></button>
          <button onClick={() => { setViewMode('list'); setCurrentView('saved'); }} className={`flex flex-col items-center gap-1 ${currentView === 'saved' || currentView === 'list_detail' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : 'hover:text-gray-300'}`}><Heart className="w-6 h-6" /><span className="text-[10px]">My Lists</span></button>
          <button onClick={() => { setViewMode('list'); setCurrentView('profile'); }} className={`flex flex-col items-center gap-1 ${currentView === 'profile' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : 'hover:text-gray-300'}`}><User className="w-6 h-6" /><span className="text-[10px]">Profile</span></button>
        </div>
      </nav>
    </div>
  );
}

function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#FFFEE0] flex flex-col justify-center px-6 pb-20 animate-in fade-in duration-500">
      <div className="max-w-sm w-full mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">LOQA.</h1>
          <p className="text-gray-500 font-medium text-sm">Curated aesthetics around the globe.</p>
        </div>

        <form onSubmit={handleAuth} className="bg-[#222222] p-6 rounded-3xl border border-[#333333] shadow-xl space-y-5 text-white">
          <h2 className="text-xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          {error && <div className="bg-red-900/50 text-red-400 p-3 rounded-xl text-xs font-bold border border-red-500/30">{error}</div>}
          <div className="space-y-3">
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
              <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#333333] border border-[#444444] rounded-2xl py-3.5 pl-12 pr-4 shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF1493] font-medium text-sm" required />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-[#333333] border border-[#444444] rounded-2xl py-3.5 pl-12 pr-4 shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF1493] font-medium text-sm" required minLength="6" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#FF1493] text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm font-bold text-gray-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </p>
      </div>
    </div>
  );
}

function FlameRating({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <button key={index} type="button" onClick={() => onChange(index)} className="transition-transform active:scale-125 duration-100">
          <Flame className={`w-6 h-6 ${index <= value ? 'fill-[#FF1493] text-[#FF1493]' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

// --- 1. HOME FEED ---
function HomeFeed({ spots, onSelectSpot, onQuickSave }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const top10 = [...spots].sort((a, b) => {
    const scoreA = ((a.rating?.food || 0) + (a.rating?.service || 0) + (a.rating?.vibe || 0)) / 3;
    const scoreB = ((b.rating?.food || 0) + (b.rating?.service || 0) + (b.rating?.vibe || 0)) / 3;
    return scoreB - scoreA;
  }).slice(0, 10);

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = `${spot.name} ${spot.city} ${spot.type} ${spot.tags?.join(' ')}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Near Me') return matchesSearch && spot.city === 'Bodrum'; // Voorbeeld logic
    if (activeFilter !== 'All') return matchesSearch && spot.tags?.includes(activeFilter);
    return matchesSearch;
  });

  return (
    <div className="pb-8 animate-in fade-in duration-200">
      <div className="flex justify-between items-center px-5 pt-10 mb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">LOQA.</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 bg-white rounded-full border shadow-sm ${activeFilter !== 'All' ? 'border-[#FF1493] text-[#FF1493]' : 'text-gray-600'}`}><SlidersHorizontal className="w-5 h-5" /></button>
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2.5 bg-white rounded-full border shadow-sm"><Search className="w-5 h-5 text-gray-600" /></button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="px-5 mb-4 flex gap-2 overflow-x-auto no-scrollbar animate-in slide-in-from-top-2">
          {['All', 'Near Me', 'Instagrammable', 'Worth the hype'].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeFilter === f ? 'bg-[#FF1493] text-white border-[#FF1493]' : 'bg-white text-gray-600 border-gray-100'}`}>{f}</button>
          ))}
        </div>
      )}

      {isSearchOpen && (
        <div className="px-5 mb-6 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            <input type="text" placeholder="Search spots, cities or vibes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-medium text-sm" autoFocus />
          </div>
        </div>
      )}

      {(searchQuery.trim().length > 0 || activeFilter !== 'All') ? (
        <div className="px-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-500 mb-2">Filtered Results</h2>
          {filteredSpots.map(spot => (
            <div key={spot.id} className="relative bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
              <img src={spot.image} onClick={() => onSelectSpot(spot.id)} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 overflow-hidden" onClick={() => onSelectSpot(spot.id)}>
                <h3 className="font-bold text-gray-900 leading-tight truncate">{spot.name}</h3>
                <p className="text-xs text-gray-500 mt-1 font-bold">{spot.type} • {spot.city}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onQuickSave(spot.id); }} className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-600 hover:text-[#FF1493]"><Bookmark className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <div className="pl-5 mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Global Top 10</h2>
          {spots.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center mr-5 shadow-sm">
              <p className="font-bold text-gray-500">It's quiet here...</p>
              <p className="text-xs text-gray-400 mt-2">Go to 'Profile' to import your Excel data or add manually under 'All Places'!</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pr-5 pb-4 snap-x snap-mandatory">
              {top10.map((spot, index) => {
                const score = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1);
                return (
                  <div key={spot.id} className="snap-start relative min-w-[260px] h-[320px] bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/40 cursor-pointer group shrink-0 transition-transform">
                    <img src={spot.image} onClick={() => onSelectSpot(spot.id)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" onClick={() => onSelectSpot(spot.id)}></div>
                    
                    {/* DIRECT SAVE CORNER BUTTON */}
                    <button onClick={(e) => { e.stopPropagation(); onQuickSave(spot.id); }} className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md text-gray-800 rounded-full shadow-lg active:scale-125 transition-transform hover:text-[#FF1493]">
                      <Bookmark className="w-4 h-4 fill-current text-inherit" />
                    </button>
                    
                    <div className="absolute top-4 left-4 bg-[#222222] border border-[#333333] text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg text-lg">#{index + 1}</div>
                    <div className="absolute bottom-5 left-5 right-5 text-white" onClick={() => onSelectSpot(spot.id)}>
                      <h3 className="font-black text-2xl leading-tight mb-1">{spot.name}</h3>
                      <p className="text-xs font-bold opacity-80 flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" /> {spot.city}</p>
                      <div className="inline-flex bg-[#FF1493] px-3 py-1.5 rounded-xl items-center gap-1.5 shadow-md">
                        <Flame className="w-4 h-4 fill-white text-white" />
                        <span className="text-sm font-black">{score}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- 2. ALL PLACES ---
function AllPlacesView({ spots, onSelectCity, onSelectSpot, onAddClick, searchQuery, setSearchQuery, onQuickSave }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isSearching = searchQuery.trim().length > 0;
  const filteredSpots = spots.filter(spot => `${spot.name} ${spot.city} ${spot.type}`.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Places</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2.5 bg-white rounded-full border shadow-sm active:scale-95"><Search className="w-5 h-5 text-gray-600" /></button>
          <button onClick={onAddClick} className="bg-[#222222] border border-[#333333] text-white p-2.5 rounded-full font-bold shadow-sm active:scale-95"><Plus className="w-5 h-5" /></button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="relative mb-6 animate-in slide-in-from-top-2">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
          <input type="text" placeholder="Search destinations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF1493] font-medium text-sm" autoFocus />
        </div>
      )}

      {isSearching ? (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 mb-2">Search Results</h2>
          {filteredSpots.map(spot => (
            <div key={spot.id} className="relative bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
              <img src={spot.image} onClick={() => onSelectSpot(spot.id)} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 overflow-hidden" onClick={() => onSelectSpot(spot.id)}>
                <h3 className="font-bold text-gray-900 leading-tight truncate">{spot.name}</h3>
                <p className="text-xs text-gray-500 mt-1 font-bold">{spot.type} • {spot.city}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onQuickSave(spot.id); }} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full text-gray-600 hover:text-[#FF1493]"><Bookmark className="w-4 h-4" /></button>
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
function CityDetailView({ spots, city, onSelectSpot, onBack, onQuickSave }) {
  const [filter, setFilter] = useState('All');
  const citySpots = spots.filter(s => s.city === city?.name);
  const filteredSpots = filter === 'All' ? citySpots : citySpots.filter(s => s.type === filter);
  const types = ['All', 'Restaurant', 'Cafe', 'Beach Club', 'Hotel'];

  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in slide-in-from-right duration-200">
      <header className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 bg-white rounded-full border shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-black text-gray-900">{city?.name}</h1>
      </header>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {types.map(t => <button key={t} onClick={() => setFilter(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === t ? 'bg-[#FF1493] text-white border-[#FF1493]' : 'bg-white text-gray-500 border border-gray-100'}`}>{t}</button>)}
      </div>
      <div className="space-y-3">
        {filteredSpots.map(spot => (
          <div key={spot.id} className="relative bg-white rounded-2xl p-2.5 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer">
            <img src={spot.image} onClick={() => onSelectSpot(spot.id)} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1" onClick={() => onSelectSpot(spot.id)}>
              <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">{spot.type}</p>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1"><Flame className="w-3 h-3 fill-gray-900" /> {((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1)}</span>
              <button onClick={(e) => { e.stopPropagation(); onQuickSave(spot.id); }} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-[#FF1493]"><Bookmark className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddSpotView({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('Restaurant');
  const [cuisine, setCuisine] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const availableTags = VIBE_TAGS[type] || VIBE_TAGS['Restaurant'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag)); 
    else setSelectedTags([...selectedTags, tag]);
  };
  
  const handleSave = () => {
    onSave({ 
      name, city, type, cuisine, 
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000', 
      addressUrl: `https://maps.google.com/?q=$$${name}+${city}`, 
      websiteUrl: '', instagramUrl: '', bookingUrl: '', 
      tags: selectedTags, rating: { food: 5, service: 5, vibe: 5, totalVotes: 1 },
      photos: { view: [], table: [], food: [] }
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-right duration-200 pb-32">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Add a Spot</h1>
      </header>

      <div className="space-y-5 bg-white p-6 rounded-3xl border shadow-sm">
        <div><label className="text-xs font-bold text-gray-500">Spot Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" /></div>
        <div><label className="text-xs font-bold text-gray-500">City</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" /></div>
        <div>
          <label className="text-xs font-bold text-gray-500">Type</label>
          <select value={type} onChange={e=>{setType(e.target.value); setSelectedTags([]);}} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900">
            <option>Restaurant</option><option>Cafe</option><option>Lunch</option><option>Breakfast</option><option>Beach Club</option><option>Hotel</option>
          </select>
        </div>

        {['Restaurant', 'Cafe', 'Lunch', 'Breakfast'].includes(type) && (
          <div><label className="text-xs font-bold text-gray-500">Cuisine</label><input type="text" value={cuisine} onChange={e=>setCuisine(e.target.value)} placeholder="e.g. Italian" className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" /></div>
        )}

        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2">Vibe Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-[#FF1493] text-white border-[#FF1493]' : 'bg-white text-gray-600 border-gray-200'}`}>{tag}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="w-full bg-[#222222] text-white font-bold py-4 rounded-2xl shadow-lg mt-4">Save to LOQA</button>
      </div>
    </div>
  );
}

// --- 5. SPOT DETAIL (NU MET DIRECT SAVE CORNER & VISUAL INTELLIGENCE TABS) ---
function SpotDetail({ spot, onBack, onRate, onQuickSave, onNewPhoto }) {
  const [activePhotoTab, setActivePhotoTab] = useState('view');
  
  if (!spot) return null;
  const overall = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe) / 3).toFixed(1);
  const currentPhotos = spot.photos?.[activePhotoTab] || [];

  const handleLocalPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file); // Directe lokale weergave zonder API!
    onNewPhoto(activePhotoTab, localUrl);
  };

  return (
    <div className="animate-in slide-in-from-right duration-200 pb-20">
      <div className="relative h-72 w-full">
        <img src={spot.image} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        
        {/* DIRECT SAVE CORNER BUTTON */}
        <button onClick={() => onQuickSave(spot.id)} className="absolute top-12 right-5 p-2.5 bg-white/90 backdrop-blur-md text-gray-800 rounded-full shadow-lg active:scale-125 transition-transform hover:text-[#FF1493]">
          <Bookmark className="w-5 h-5 fill-current text-inherit" />
        </button>

        <div className="absolute bottom-4 left-5 right-5 text-white flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black drop-shadow-md leading-tight">{spot.name}</h1>
            <p className="text-sm font-medium drop-shadow-md flex items-center gap-1 opacity-90"><MapPin className="w-3.5 h-3.5"/> {spot.type} • {spot.city}</p>
          </div>
          <div className="bg-[#FF1493] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
            <Flame className="w-4 h-4 fill-white text-white" /> <span className="font-black text-lg">{overall}</span>
          </div>
        </div>
      </div>

      <div className="p-5 max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <a href={spot.addressUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><MapPin className="w-5 h-5 text-gray-700 mb-1.5" /><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Address</span></a>
          <a href={spot.websiteUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><Globe className="w-5 h-5 text-gray-700 mb-1.5" /><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Website</span></a>
          <a href={spot.instagramUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center py-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50"><Instagram className="w-5 h-5 text-gray-700 mb-1.5" /><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Instagram</span></a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a href={spot.bookingUrl} target="_blank" rel="noreferrer" className="bg-[#FF1493] text-white font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm">Book</a>
          <button onClick={onRate} className="bg-[#222222] border border-[#333333] text-white font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm">Have you been?</button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"><div className="bg-gray-50 p-2 rounded-full text-gray-700"><Utensils className="w-4 h-4"/></div><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cuisine</p><p className="text-xs font-bold text-gray-900 truncate">{spot.cuisine || 'International'}</p></div></div>
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"><div className="bg-gray-50 p-2 rounded-full text-gray-700"><Info className="w-4 h-4"/></div><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dress Code</p><p className="text-xs font-bold text-gray-900 truncate">{spot.dresscode || 'Smart Casual'}</p></div></div>
        </div>

        {spot.tags && spot.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spot.tags.map((tag, i) => (
              <span key={i} className="bg-white text-gray-600 px-3 py-1.5 rounded-full text-[10px] font-bold border border-gray-200">{tag}</span>
            ))}
          </div>
        )}

        {/* VISUAL INTELLIGENCE - DE FOTO TABS ZIJN TERUG! */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Visual Intelligence</h2>
          <div className="flex bg-white p-1 rounded-xl text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
            <button onClick={() => setActivePhotoTab('view')} className={`flex-1 py-2.5 rounded-lg text-center transition-all ${activePhotoTab === 'view' ? 'bg-[#222222] text-white shadow-sm' : ''}`}>The View</button>
            <button onClick={() => setActivePhotoTab('table')} className={`flex-1 py-2.5 rounded-lg text-center transition-all ${activePhotoTab === 'table' ? 'bg-[#222222] text-white shadow-sm' : ''}`}>Interior/Table</button>
            <button onClick={() => setActivePhotoTab('food')} className={`flex-1 py-2.5 rounded-lg text-center transition-all ${activePhotoTab === 'food' ? 'bg-[#222222] text-white shadow-sm' : ''}`}>Food</button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
            {currentPhotos.length === 0 ? (
              <div className="space-y-4 py-4">
                <p className="text-sm font-medium text-gray-400">No photos here yet. Be the first!</p>
                <label className="inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-4 py-2.5 rounded-xl hover:bg-pink-100 transition-colors">
                  <Plus className="w-4 h-4" /> Upload Photo
                  <input type="file" accept="image/*" onChange={handleLocalPhotoUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {currentPhotos.map((photoObj, idx) => (
                    <div key={idx} className="relative h-40 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img src={photoObj.url} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                        <span className="text-[9px] font-bold text-white tracking-wider">{photoObj.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-black text-[#FF1493] cursor-pointer bg-pink-50 px-4 py-2.5 rounded-xl hover:bg-pink-100 transition-colors mt-2">
                  <Plus className="w-3.5 h-3.5" /> Add Another
                  <input type="file" accept="image/*" onChange={handleLocalPhotoUpload} className="hidden" />
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
        <div><h1 className="text-xl font-bold tracking-tight">Vibe Check</h1><p className="text-xs text-gray-500 font-bold">{spot?.name}</p></div>
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
            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3.5 py-2 rounded-xl text-[11px] font-bold border transition-colors ${selectedTags.includes(tag) ? 'bg-[#FF1493] text-white border-[#FF1493] shadow-md' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}>{tag}</button>
          ))}
        </div>
      </div>

      <button onClick={() => onSubmit({ food, service, vibe }, selectedTags)} disabled={!food || !service || !vibe} className={`w-full py-4 rounded-2xl font-black text-white text-center shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${food && service && vibe ? 'bg-[#222222] active:scale-95' : 'bg-gray-300'}`}>Submit Vibe Check</button>
    </div>
  );
}

// --- 7. DE VERBETERDE MAP VIEW (BETERE DISTRIBUTIE) ---
function MapView({ spots, onSelectSpot, onBack }) {
  // Strakkere wiskunde om de speldjes netjes te spreiden
  const positions = [
    { top: '30%', left: '40%' }, { top: '50%', left: '60%' }, { top: '70%', left: '30%' },
    { top: '40%', left: '70%' }, { top: '60%', left: '20%' }, { top: '20%', left: '50%' },
    { top: '80%', left: '50%' }, { top: '45%', left: '80%' }, { top: '75%', left: '70%' },
    { top: '25%', left: '25%' },
  ];

  return (
    <div className="w-full h-screen bg-[#222222] relative animate-in fade-in duration-300 overflow-hidden">
      
      {/* MAP GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-15 flex flex-wrap pointer-events-none">
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} className="w-16 h-16 border border-[#444444] text-[8px] p-1 text-gray-600 font-mono">
            LOQA-{i * 4}
          </div>
        ))}
      </div>

      {/* HEADER BAR IN MAP */}
      <div className="absolute top-12 left-4 right-4 z-20 flex gap-3">
        <button onClick={onBack} className="p-3 bg-[#333333] rounded-full text-white shadow-xl"><ArrowLeft className="w-5 h-5" /></button>
        <div className="bg-[#222222]/90 border border-[#333333] backdrop-blur p-3 rounded-2xl shadow-xl flex-1 flex items-center gap-3">
          <MapPin className="text-[#FF1493] w-5 h-5 shrink-0" />
          <div className="flex-1 text-left">
            <h2 className="text-white text-sm font-black tracking-tight uppercase">Radar Active</h2>
            <p className="text-[10px] text-gray-400 font-medium">Displaying {spots.length} viral hot zones</p>
          </div>
        </div>
      </div>

      {/* PLACING PINS MET BETERE SPREIDING */}
      {spots.map((spot, index) => {
        const pos = positions[index % positions.length];
        return (
          <button 
            key={spot.id}
            onClick={() => onSelectSpot(spot.id)}
            style={{ top: pos.top, left: pos.left }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group animate-in zoom-in duration-300 delay-100"
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-[#FF1493] text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xl border border-[#FFFEE0]/20 transform group-hover:scale-110 transition-transform whitespace-nowrap">
                {spot.name}
              </div>
              <div className="w-3 h-3 bg-[#FF1493] border-2 border-white rounded-full shadow-md mt-1 animate-ping absolute -bottom-1"></div>
              <div className="w-3 h-3 bg-[#FF1493] border-2 border-white rounded-full shadow-md mt-1"></div>
            </div>
          </button>
        );
      })}

      {spots.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-400">
          <MapPin className="w-8 h-8 text-gray-600 mb-2 animate-bounce" />
          <p className="font-bold text-sm">No map coordinates active.</p>
          <p className="text-[11px] opacity-60 mt-1">Add destinations with locations to see them on radar.</p>
        </div>
      )}
    </div>
  );
}

function SavedView({ lists, onCreateClick, onOpenList }) {
  return (
    <div className="p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Lists</h1>
        <button onClick={onCreateClick} className="bg-white border border-gray-200 text-gray-900 p-2.5 rounded-full font-bold shadow-sm active:scale-95"><Plus className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {lists.map(list => (
          <div key={list.id} onClick={() => onOpenList(list.id)} className="relative h-48 rounded-3xl overflow-hidden cursor-pointer shadow-sm group active:scale-95 transition-all">
            <img src={list.coverImage} className="w-full h-full object-cover" alt={list.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h2 className="text-sm font-bold leading-tight">{list.name}</h2>
              <p className="text-[10px] font-medium text-gray-300 mt-1">{list.spots.length} spots</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateListView({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [tripDates, setTripDates] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom duration-200 pb-32">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">New List</h1>
      </header>
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2">Cover Photo</label>
          <div className="relative h-32 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
            {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" /> : <div className="text-center text-gray-400"><ImageIcon className="w-6 h-6 mx-auto mb-2 opacity-50" /><span className="text-xs font-bold">Tap to upload</span></div>}
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
        <div><label className="text-xs font-bold text-gray-500">List Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" /></div>
        <div><label className="text-xs font-bold text-gray-500">Trip Dates</label><input type="text" value={tripDates} onChange={e=>setTripDates(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" /></div>
        <button onClick={() => name && onSave(name, imagePreview, tripDates)} className="w-full bg-[#222222] text-white font-bold py-4 rounded-2xl shadow-lg mt-4">Create List</button>
      </div>
    </div>
  );
}

function ListDetailView({ list, allSpots, onBack, onSelectSpot, onUpdateNotes, onUpdateDates }) {
  if (!list) return null;
  const listSpots = allSpots.filter(s => list.spots.includes(s.id));
  const [notes, setNotes] = useState(list.notes || '');
  const [dates, setDates] = useState(list.dates || '');

  const shareList = () => {
    const text = `Check out my LOQA list: ${list.name}! Trip Dates: ${dates}.`;
    window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="animate-in slide-in-from-right duration-200 pb-20">
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
        <button onClick={shareList} className="w-full bg-white border border-gray-200 text-gray-900 font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95"><Share2 className="w-5 h-5"/> Share List</button>
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-[#FF1493]"/> Trip Dates</h2>
          <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} onBlur={() => onUpdateDates(list.id, dates)} className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-700 font-bold focus:outline-gray-900 shadow-sm" placeholder="Set trip dates..." />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2"><Edit3 className="w-4 h-4 text-[#FF1493]"/> Trip Notes</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => onUpdateNotes(list.id, notes)} className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-700 min-h-[120px] focus:outline-gray-900 shadow-sm" placeholder="Type notes, budgets or booking references here..." />
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

function ProfileView({ isLive, listsCount, userEmail, onBulkImport }) {
  const [importStatus, setImportStatus] = useState('');
  const handleLogout = () => signOut(auth);

  const handleCSVUpload = async (
