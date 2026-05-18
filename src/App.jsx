import React, { useState, useEffect } from 'react';
import { 
  Compass, LayoutGrid, Heart, User, MapPin, ChevronLeft, ArrowLeft, 
  Utensils, Camera, Flame, Globe, Plus, Search, Info, Check, Instagram, CalendarDays
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
  { id: 'spot_1', name: 'Casa Blanca', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', cuisine: 'Mediterranean Fusion', dresscode: 'Smart Casual', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000', addressUrl: 'https://maps.google.com', websiteUrl: 'https://google.com', instagramUrl: 'https://instagram.com', bookingUrl: 'https://opentable.com', rating: { food: 4.5, service: 4.0, vibe: 4.5, totalVotes: 1 }, photos: { view: [], table: [], food: [] }, tags: ['Instagrammable', 'Sunset view'] }
];

export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
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
          addressUrl: doc.data().addressUrl || 'https://maps.google.com',
          websiteUrl: doc.data().websiteUrl || 'https://google.com',
          instagramUrl: doc.data().instagramUrl || 'https://instagram.com',
          bookingUrl: doc.data().bookingUrl || 'https://opentable.com',
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
        tags: arrayUnion(...selectedTags) 
      });

      await fetchSpots();
      setCurrentView('detail');
    } catch (error) { alert(error.message); }
  };

  const handlePhotoUpload = async (spotId, category, imageUrl) => {
    try {
      const spotRef = doc(db, "spots", spotId);
      // We slaan nu een object op met de URL én de naam van de uploader!
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
      {currentView === 'all_places'
