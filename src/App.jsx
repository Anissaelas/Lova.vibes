import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, Utensils, Camera, Flame, Globe, Plus, Search, Info, Check, Instagram, CalendarDays, ShieldAlert, Share2, Edit3, Settings, LogOut, Grid, Calendar, Image as ImageIcon, Lock, Mail, Upload, SlidersHorizontal, Bookmark, Map } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('list'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [spots, setSpots] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);
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
        const liveData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      if (list.id === listId && !list.spots.includes(spotId)) {
        return { ...list, spots: [...list.spots, spotId] };
      }
      return list;
    }));
    setQuickSaveSpotId(null);
  };

  // FOTO UPLOAD VERSIE MET BESCHRIJVING
  const handlePhotoUpload = async (spotId, category, base64Url, description) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      const photoData = { 
        url: base64Url, 
        author: user?.email?.split('@')[0] || '@guest',
        description: description || '' 
      };
      await updateDoc(spotRef, {
        [`photos.${category}`]: arrayUnion(photoData)
      });
      await fetchSpots();
    } catch (error) { alert("Error saving photo: " + error.message); }
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
      
      {/* MAP TOGGLE BUTTON */}
      {(currentView === 'home' || currentView === 'all_places' || currentView === 'city_detail') && (
        <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#222222] border border-[#333333] text-white font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-transform">
          <Map className="w-4 h-4 text-[#FF1493]" />
          {viewMode === 'list' ? 'View on Map' : 'View List'}
        </button>
      )}

      {/* QUICK SAVE PIN MODAL */}
      {quickSaveSpotId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-[#222222] border-t border-[#333333] w-full max-w-md rounded-t-3xl p-6 space-y-4 text-white max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="font-black text-lg tracking-tight">Pin to Moodboard</h3>
              <button onClick={() => setQuickSaveSpotId(null)} className="text-gray-400 font-bold text-sm">Cancel</button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 no-scrollbar">
              {savedLists.map(l => (
                <button key={l.id} onClick={() => handleAddSpotToList(quickSaveSpotId, l.id)} className="w-full text-left bg-[#333333] hover:bg-[#444444] p-4 rounded-xl font-bold text-sm transition-colors flex justify-between items-center">
                  <span>{l.name}</span>
                  {l.spots.includes(quickSaveSpotId) ? <Check className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4 text-[#FF1493]" />}
                </button>
              ))}
            </div>
            <button onClick={() => { setQuickSaveSpotId(null); setCurrentView('create_list'); }} className="w-full py-4 rounded-xl font-bold text-sm bg-[#FF1493] text-white shrink-0 mt-2 active:scale-95 transition-transform">
              + Create New List
            </button>
          </div>
        </div>
      )}

      {/* RENDER VIEWS */}
      {viewMode === 'map' ? (
        <MapView spots={spots} onSelectSpot={(id) => { setViewMode('list'); navigateToSpot(id); }} />
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
              onNewPhoto={handlePhotoUpload}
            />
          )}
          
          {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onSubmit={(r, tags) => handleReviewSubmit(activeSpot.id, r, tags)} />}
          {currentView === 'saved' && <SavedView lists={savedLists} onOpenList={(id) => { setActiveListId(id); setCurrentView('list_detail'); }} onCreateClick={() => setCurrentView('create_list')} />}
          {currentView === 'create_list' && <CreateListView onBack={() => setCurrentView('saved')} onSave={handleCreateList} />}
          {currentView === 'list_detail' && <ListDetailView list={savedLists.find(l => l.id === activeListId)} allSpots={spots} onBack={() => setCurrentView('saved')} onSelectSpot={navigateToSpot} onUpdateNotes={(id, n) => setSavedLists(prev => prev.map(l => l.id === id ? { ...l, notes: n } : l))} onUpdateDates={(id, d) => setSavedLists(prev => prev.map(l => l.id === id ? { ...l, dates: d } : l))} />}
          {currentView === 'profile' && <ProfileView isLive={isLive} listsCount={savedLists.length} userEmail={user.email} onBulkImport={fetchSpots} />}
        </>
      )}

      {/* NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full bg-[#222222] border-t border-[#333333] pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-500">
          <button onClick={() => { setViewMode('list'); setCurrentView('all_places'); }} className={`flex flex-col items-center gap-1 ${currentView === 'all_places' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">All Places</span></button>
          <button onClick={() => { setViewMode('list'); setCurrentView('home'); }} className={`flex flex-col items-center gap-1 ${currentView === 'home' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><Compass className="w-6 h-6" /><span className="text-[10px]">Home</span></button>
          <button onClick={() => { setViewMode('list'); setCurrentView('saved'); }} className={`flex flex-col items-center gap-1 ${currentView === 'saved' || currentView === 'list_detail' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><Heart className="w-6 h-6" /><span className="text-[10px]">My Lists</span></button>
          <button onClick={() => { setViewMode('list'); setCurrentView('profile'); }} className={`flex flex-col items-center gap-1 ${currentView === 'profile' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><User className="w-6 h-6" /><span className="text-[10px]">Profile</span></button>
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
    if (activeFilter === 'Near Me') return matchesSearch && spot.city === 'Bodrum';
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
              <button onClick={() => onQuickSave(spot.id)} className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-600 hover:text-[#FF1493]"><Bookmark className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <>
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
                      
                      <button onClick={() => onQuickSave(spot.id)} className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md text-gray-800 rounded-full shadow-lg active:scale-125 transition-transform hover:text-[#FF1493]"><Bookmark className="w-4 h-4 fill-current text-inherit" /></button>
                      
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
        </>
      )}
    </div>
  );
}

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
              <button onClick={() => onQuickSave(spot.id)} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full text-gray-600 hover:text-[#FF1493]"><Bookmark className="w-4 h-4" /></button>
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1"><Flame className="w-3 h-3 fill-gray-900" /> {((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1)}</span>
              <button onClick={() => onQuickSave(spot.id)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-[#FF1493]"><Bookmark className="w-4 h-4" /></button>
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
      tags: selectedTags, rating: { food: 5, service: 5, vibe: 5, totalVotes: 1 } 
    });
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 animate-in slide-in-from-right duration-200 pb-32">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Add a Spot</h1>
      </header>

      <div className="space-y-5 bg-white p-6 rounded-3xl border shadow-sm">
        <div><label className="text-xs font-bold text-gray-500">Spot Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" required /></div>
        <div><label className="text-xs font-bold text-gray-500">City</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} className="w-full bg-gray-50 p-3 rounded-xl mt-1 focus:outline-gray-900" required /></div>
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

        <button onClick={handleSave} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg mt-4">Save to LOQA</button>
      </div>
    </div>
  );
}

function SpotDetail({ spot, onBack, onRate, onQuickSave, onNewPhoto }) {
  const [activeTab, setActiveTab] = useState('view');
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingDesc, setPendingDesc] = useState('');

  if (!spot) return null;
  const overall = ((spot.rating?.food + spot.rating?.service + spot.rating?.vibe) / 3).toFixed(1);
  const currentPhotos = spot.photos?.[activeTab] || [];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => setPendingImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitPhoto = () => {
    if(pendingImage) {
      onNewPhoto(spot.id, activeTab, pendingImage, pendingDesc);
      setPendingImage(null);
      setPendingDesc('');
    }
  };

  return (
    <div className="animate-in slide-in-from-right duration-200 pb-20">
      <div className="relative h-72 w-full">
        <img src={spot.image} className="w-full h-full object-cover" />
        <button onClick={onBack} className="absolute top-12 left-5 p-2 bg-black/30 backdrop-blur-md rounded-full text-white"><ChevronLeft /></button>
        <button onClick={() => onQuickSave(spot.id)} className="absolute top-12 right-5 z-20 p-2.5 bg-white/90 backdrop-blur-md text-gray-800 rounded-full shadow-lg active:scale-125 transition-transform hover:text-[#FF1493]">
          <Bookmark className="w-4 h-4 fill-current text-inherit" />
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
          <a href={spot.bookingUrl} target="_blank" rel="noreferrer" className="bg-[#FF1493] text-white font-bold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm"><CalendarDays className="w-4 h-4"/> Book</a>
          <button onClick={onRate} className="bg-[#222222] border border-[#333333] text-white font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm">Have you been?</button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"><div className="bg-gray-50 p-2 rounded-full text-gray-700"><Utensils className="w-4 h-4"/></div><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cuisine</p><p className="text-xs font-bold text-gray-900 truncate">{spot.cuisine || 'International'}</p></div></div>
          <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3"><div className="bg-gray-50 p-2 rounded-full text-gray-700"><Info className="w-4 h-4"/></div><div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Dress Code</p><p className="text-xs font-bold text-gray-900 truncate">{spot.dresscode || 'Smart Casual'}</p></div></div>
        </div>

        {/* VISUAL INTELLIGENCE: PHOTO GALLERY */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Visual Intelligence</h2>
          <div className="flex bg-gray-100/60 p-1 rounded-xl text-xs font-bold text-gray-500">
            <button onClick={() => setActiveTab('view')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'view' ? 'bg-white shadow-sm text-[#FF1493] font-extrabold' : ''}`}>The View</button>
            <button onClick={() => setActiveTab('table')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'table' ? 'bg-white shadow-sm text-[#FF1493] font-extrabold' : ''}`}>The Interior</button>
            <button onClick={() => setActiveTab('food')} className={`flex-1 py-2.5 rounded-lg text-center ${activeTab === 'food' ? 'bg-white shadow-sm text-[#FF1493] font-extrabold' : ''}`}>The Food</button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {pendingImage ? (
              <div className="space-y-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <img src={pendingImage} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                <input type="text" value={pendingDesc} onChange={e => setPendingDesc(e.target.value)} placeholder="Add a description..." className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF1493]" autoFocus />
                <div className="flex gap-2">
                  <button onClick={() => setPendingImage(null)} className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-500 bg-gray-200">Cancel</button>
                  <button onClick={submitPhoto} className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-[#FF1493]">Post Photo</button>
                </div>
              </div>
            ) : (
              <label className="w-full mb-6 py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-400" /> Share your {activeTab}
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            )}

            {currentPhotos.length === 0 ? (
              <div className="text-center py-6"><p className="text-sm font-medium text-gray-400">No photos here yet. Be the first to post!</p></div>
            ) : (
              <div className="space-y-4">
                {currentPhotos.map((photoObj, idx) => {
                  const url = typeof photoObj === 'string' ? photoObj : photoObj.url;
                  const author = typeof photoObj === 'string' ? '@guest' : photoObj.author;
                  const desc = photoObj.description;
                  return (
                    <div key={idx} className="relative rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                      <img src={url} className="w-full h-48 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent p-3 text-left">
                        <span className="text-[10px] font-black text-[#FF1493] tracking-wider block mb-0.5">{author}</span>
                        {desc && <span className="text-xs font-medium text-white">{desc}</span>}
                      </div>
                    </div>
                  );
                })}
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

function MapView({ spots, onSelectSpot }) {
  return (
    <div className="w-full h-screen bg-[#222222] relative animate-in fade-in duration-300">
      <div className="absolute inset-0 opacity-15 flex flex-wrap pointer-events-none">
        {Array.from({ length: 120 }).map((_, i) => <div key={i} className="w-16 h-16 border border-[#444444] text-[8px] p-1 text-gray-600 font-mono">LN-{i * 4}</div>)}
      </div>
      <div className="absolute top-8 left-4 right-4 z-20 bg-[#222222]/90 border border-[#333333] backdrop-blur p-4 rounded-2xl shadow-xl flex items-center gap-3">
        <MapPin className="text-[#FF1493] w-5 h-5 shrink-0" />
        <div className="flex-1 text-left">
          <h2 className="text-white text-sm font-black tracking-tight uppercase">Radar Active</h2>
          <p className="text-[10px] text-gray-400 font-medium">Displaying {spots.length} viral hot zones</p>
        </div>
      </div>
      {spots.map((spot, index) => {
        const pseudoTop = 30 + ((index * 73) % 45);
        const pseudoLeft = 15 + ((index * 127) % 70);
        return (
          <button key={spot.id} onClick={() => onSelectSpot(spot.id)} style={{ top: `${pseudoTop}%`, left: `${pseudoLeft}%` }} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group animate-in zoom-in duration-300">
            <div className="relative flex flex-col items-center">
              <div className="bg-[#FF1493] text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xl border border-[#FFFEE0]/20 transform group-hover:scale-110 transition-transform">{spot.name}</div>
              <div className="w-2.5 h-2.5 bg-[#FF1493] border-2 border-white rounded-full shadow-md mt-1 animate-ping absolute -bottom-1"></div>
              <div className="w-2.5 h-2.5 bg-[#FF1493] border-2 border-white rounded-full shadow-md mt-1"></div>
            </div>
          </button>
        );
      })}
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
          <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-900"/> Trip Dates</h2>
          <input type="text" value={dates} onChange={(e) => setDates(e.target.value)} onBlur={() => onUpdateDates(list.id, dates)} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-700 font-bold focus:outline-gray-900 shadow-sm" placeholder="Set trip dates..." />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2"><Edit3 className="w-4 h-4 text-gray-900"/> Trip Notes</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ isLive, listsCount, userEmail, onBulkImport }) {
  const [importStatus, setImportStatus] = useState('');

  // DE SLIMME CSV PARSER DIE NU BEIDE BESTANDSTYPES HERKENT!
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportStatus('Reading file...');
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        
        // Magie 1: Checkt of het bestand puntkomma's (NL) of komma's (INT) gebruikt
        const delimiter = text.includes(';') ? ';' : ',';
        
        // Magie 2: Maakt alle kolom-titels kleine letters (WebsiteUrl wordt websiteurl)
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/["\r]/g, '').toLowerCase());
        
        let successCount = 0;
        setImportStatus(`Importing spots...`);

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Split de regels met het juiste scheidingsteken
          const values = lines[i].split(new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`)).map(v => v.trim().replace(/^"|"$/g, '').replace(/\r/g, ''));
          const rowData = {};
          
          headers.forEach((h, index) => rowData[h] = values[index] || '');
          
          if (!rowData.name || !rowData.city) continue;

          await addDoc(collection(db, "spots"), {
            name: rowData.name, 
            city: rowData.city, 
            type: rowData.type || 'Restaurant', 
            cuisine: rowData.cuisine || '', 
            dresscode: rowData.dresscode || '',
            image: rowData.image || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000',
            addressUrl: rowData.addressurl || `https://maps.google.com/?q=$$$${encodeURIComponent(rowData.name)}+${encodeURIComponent(rowData.city)}`,
            websiteUrl: rowData.websiteurl || '', 
            instagramUrl: rowData.instagramurl || '', 
            bookingUrl: rowData.bookingurl || '', 
            tags: [], 
            rating: { food: 5, service: 5, vibe: 5, totalVotes: 1 }
          });
          successCount++;
        }
        setImportStatus(`Successfully imported ${successCount} spots!`);
        onBulkImport(); 
      } catch (err) { setImportStatus(`Error: ${err.message}`); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-5 max-w-md mx-auto pt-16 space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-[#222222]"></div>
        <div className="relative mt-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center text-gray-300">
            <User className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-black text-gray-900 mt-3">{userEmail?.split('@')[0]}</h1>
          <p className="text-xs text-gray-500 font-bold">{userEmail}</p>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider pl-1">Admin Tools</h2>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Upload className="w-5 h-5"/></div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-gray-900">Import Spots from CSV</h3>
              <p className="text-[10px] text-gray-400">Upload your Excel template (.csv)</p>
            </div>
          </div>
          <label className="w-full bg-[#222222] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center cursor-pointer active:scale-98 transition-transform">
            Select .CSV File
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>
          {importStatus && <p className="text-[11px] font-bold text-center text-[#FF1493] animate-pulse">{importStatus}</p>}
        </div>

        <h2 className="text-sm font-black text-gray-900 mb-2 uppercase tracking-wider pl-1 mt-6">Settings & App</h2>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`p-2 rounded-full ${isLive ? 'bg-gray-100 text-gray-900' : 'bg-red-50 text-red-500'}`}><ShieldAlert className="w-5 h-5"/></div>
          <div className="flex-1"><h3 className="font-bold text-sm text-gray-900">Database Connection</h3><p className="text-[10px] text-gray-400">{isLive ? 'Connected to Firebase' : 'Offline'}</p></div>
        </div>
        <div onClick={() => signOut(auth)} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-red-50 text-red-500 mt-6">
          <div className="p-2"><LogOut className="w-5 h-5"/></div>
          <div className="flex-1"><h3 className="font-bold text-sm">Log Out</h3></div>
        </div>
      </div>
    </div>
  );
}
