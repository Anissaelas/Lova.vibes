import React, { useState, useEffect } from 'react';
import { Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, Utensils, Camera, Flame, Globe, Plus, Search, Info, Check, Instagram, CalendarDays, ShieldAlert, Share2, Edit3, Settings, LogOut, Grid, Calendar, Image as ImageIcon, Lock, Mail, Upload, SlidersHorizontal, Bookmark, Map } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion, setDoc } from 'firebase/firestore';
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
  { id: 'c5', name: 'Monte Carlo, Monaco', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop' },
  { id: 'c6', name: 'Cannes', image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=500&auto=format&fit=crop' },
  { id: 'c7', name: 'Madrid', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=500&auto=format&fit=crop' },
  { id: 'c8', name: 'Capri', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=500&auto=format&fit=crop' },
  { id: 'c9', name: 'Amsterdam', image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=500&auto=format&fit=crop' },
  { id: 'c10', name: 'Saint-Tropez', image: 'https://images.unsplash.com/photo-1576405381156-f04bf4a0ddce?q=80&w=500&auto=format&fit=crop' },
  { id: 'c11', name: 'Amalfi', image: 'https://images.unsplash.com/photo-1633511100588-29497e28f322?q=80&w=500&auto=format&fit=crop' }
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
      const liveData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpots(liveData);
      setIsLive(true);
    } catch (e) { console.error("Firebase error:", e); }
  };

  const navigateToSpot = (spotId) => {
    const foundSpot = spots.find(s => s.id === spotId);
    if (foundSpot) { setPreviousView(currentView); setActiveSpot(foundSpot); setCurrentView('detail'); }
  };

  const handleAddSpotToList = (spotId, listId) => {
    setSavedLists(prev => prev.map(list => list.id === listId && !list.spots.includes(spotId) ? { ...list, spots: [...list.spots, spotId] } : list));
    setQuickSaveSpotId(null);
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#FFFEE0] flex flex-col items-center justify-center font-black animate-pulse"><div className="w-16 h-16 bg-[#FF1493] rounded-[18px] rotate-45 flex items-center justify-center shadow-lg mb-6"><span className="text-white font-black text-4xl -rotate-45">L</span></div><span className="text-3xl text-[#FF1493] tracking-tighter">LOQA.</span></div>;
  if (!user) return <AuthView />;

  return (
    <div className="min-h-screen bg-[#FFFEE0] font-sans text-gray-800 pb-28 relative">
       {/* UI Views renderen (Home, Details, etc) */}
       {viewMode === 'map' ? <MapView spots={spots} onSelectSpot={(id) => { setViewMode('list'); navigateToSpot(id); }} /> : (
        <>
          {currentView === 'home' && <HomeFeed spots={spots} onSelectSpot={navigateToSpot} onQuickSave={setQuickSaveSpotId} />}
          {/* ... andere views ... */}
        </>
      )}
      <nav className="fixed bottom-0 w-full bg-[#222222] border-t border-[#333333] pb-safe pt-3 px-6 pb-4 z-40"><div className="flex justify-between items-center max-w-md mx-auto text-gray-500"><button onClick={() => { setViewMode('list'); setCurrentView('all_places'); }} className={`flex flex-col items-center ${currentView === 'all_places' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><LayoutGrid className="w-6 h-6" /><span className="text-[10px]">All</span></button><button onClick={() => { setViewMode('list'); setCurrentView('home'); }} className={`flex flex-col items-center ${currentView === 'home' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><Compass className="w-6 h-6" /><span className="text-[10px]">Home</span></button><button onClick={() => { setViewMode('list'); setCurrentView('saved'); }} className={`flex flex-col items-center ${currentView === 'saved' || currentView === 'list_detail' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><Heart className="w-6 h-6" /><span className="text-[10px]">Lists</span></button><button onClick={() => { setViewMode('list'); setCurrentView('profile'); }} className={`flex flex-col items-center ${currentView === 'profile' && viewMode === 'list' ? 'text-[#FF1493] font-bold' : ''}`}><User className="w-6 h-6" /><span className="text-[10px]">Profile</span></button></div></nav>
    </div>
  );
}
