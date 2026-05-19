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
              <button onClick={() => setQuickSaveSpotId(null)} className
