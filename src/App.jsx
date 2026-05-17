import React, { useState, useEffect } from 'react';
import { 
  Map, List, Heart, Search, Filter, MapPin, ExternalLink, 
   Globe, Camera, Utensils, Armchair, ChevronLeft, 
  ThumbsUp, CheckCircle, Bell, Star, Compass, LayoutGrid, 
  ChevronRight, ArrowLeft, Gem, User, Settings, ShieldAlert,
  Check, Plus, Folder
} from 'lucide-react';

// FIREBASE IMPORTS TOEGEVOEGD! 🔥
import { db } from './firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

// --- MOCK DATA ---
const CITIES = ['Global', 'Bodrum', 'Ibiza', 'Cannes', 'Monaco', 'Marbella', 'St-Tropez', 'Amsterdam'];

const MOCK_CITIES = [
  { id: 'c1', name: 'Bodrum', count: 67, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop' },
  { id: 'c2', name: 'Ibiza', count: 0, image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop' },
  { id: 'c3', name: 'Mykonos', count: 0, image: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=500&auto=format&fit=crop' },
  { id: 'c4', name: 'Monaco', count: 47, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop' }
];

const MOCK_SPOTS = [
  {
    id: 'spot_1',
    name: 'Oceanic Beach Club',
    subtitle: 'Ibiza, Spain',
    city: 'Ibiza',
    type: 'Beach Club',
    isEditorsChoice: true,
    price: '€€€€',
    tags: ['Boho-chic', 'Girls\' Night', 'Best view'],
    image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=1000&auto=format&fit=crop',
    rating: { food: 4.3, service: 4.5, vibe: 4.9, totalVotes: 1240 },
    galleries: {
      view: [
        { id: 1, url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=500&auto=format&fit=crop', upvotes: 342, author: 'SarahM', time: 'Sunset (19:30)' },
        { id: 2, url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop', upvotes: 128, author: 'Elena_V', time: 'Afternoon' }
      ],
      table: [
        { id: 3, url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=500&auto=format&fit=crop', upvotes: 450, author: 'LuxeTraveler', tip: 'Ask for Cabana 4 for the best sunset angle.' }
      ],
      food: [
        { id: 4, url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500&auto=format&fit=crop', upvotes: 512, author: 'FoodieG', tip: 'Signature Truffle Pasta' }
      ]
    }
  },
  {
    id: 'spot_2',
    name: 'Lumière Rooftop',
    subtitle: 'Cannes, France',
    city: 'Cannes',
    type: 'Restaurant',
    isEditorsChoice: false,
    price: '€€€',
    tags: ['Industrial', 'Date Night', 'Celebrity hotspot'],
    image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=1000&auto=format&fit=crop',
    rating: { food: 4.6, service: 4.4, vibe: 4.8, totalVotes: 890 },
    galleries: { view: [], table: [], food: [] }
  },
  {
    id: 'spot_3',
    name: 'Casa Blanca',
    subtitle: 'Bodrum, Turkey',
    city: 'Bodrum',
    type: 'Lunch',
    isEditorsChoice: false,
    price: '€€',
    tags: ['Pink/Floral', 'Working from a Cafe', 'Crazy presentation'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
    rating: { food: 4.5, service: 4.6, vibe: 4.4, totalVotes: 450 },
    galleries: { view: [], table: [], food: [] }
  },
  { id: 'b1', name: 'Zuma', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&auto=format&fit=crop', rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'b2', name: 'Mudavim', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200&auto=format&fit=crop', rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'b3', name: 'Bagatelle', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=200&auto=format&fit=crop', rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'b4', name: 'Wu', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200&auto=format&fit=crop', rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  {
    id: 'm1',
    name: 'Amazonico',
    subtitle: 'Monte-Carlo, Monaco',
    city: 'Monaco',
    type: 'Restaurant',
    isEditorsChoice: false,
    price: '€€€€',
    tags: ['Latin American fusion', 'Trendy'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop',
    rating: { food: 4.6, service: 4.5, vibe: 4.9, totalVotes: 850 },
    galleries: { view: [], table: [], food: [] }
  },
  {
    id: 'm2',
    name: 'Cipriani',
    subtitle: 'Monte-Carlo, Monaco',
    city: 'Monaco',
    type: 'Restaurant',
    isEditorsChoice: false,
    price: '€€€€',
    tags: ['Italian', 'Smart Elegant'],
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=500&auto=format&fit=crop',
    rating: { food: 4.5, service: 4.7, vibe: 4.3, totalVotes: 620 },
    galleries: { view: [], table: [], food: [] }
  },
  {
    id: 'm3',
    name: 'Hotel de Paris Monte-Carlo',
    subtitle: 'Pl. du Casino, Monaco',
    city: 'Monaco',
    type: 'Hotel',
    isEditorsChoice: true,
    price: '€€€€',
    tags: ['5-star hotel', 'Luxury'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop',
    rating: { food: 4.8, service: 4.9, vibe: 5.0, totalVotes: 2100 },
    galleries: { view: [], table: [], food: [] }
  },
  {
    id: 'm4',
    name: 'Niwaki',
    subtitle: 'Monte-Carlo, Monaco',
    city: 'Monaco',
    type: 'Restaurant',
    isEditorsChoice: false,
    price: '€€€',
    tags: ['Japanese', 'Sushi'],
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop',
    rating: { food: 4.7, service: 4.6, vibe: 4.5, totalVotes: 500 },
    galleries: { view: [], table: [], food: [] }
  },
  {
    id: 'm5',
    name: 'Monte-Carlo Beach',
    subtitle: 'Roquebrune-Cap-Martin',
    city: 'Monaco',
    type: 'Hotel',
    isEditorsChoice: false,
    price: '€€€€',
    tags: ['5-star hotel', 'Beachfront'],
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=500&auto=format&fit=crop',
    rating: { food: 4.4, service: 4.6, vibe: 4.8, totalVotes: 980 },
    galleries: { view: [], table: [], food: [] }
  }
];

const MOCK_COMING_SOON = [
  {
    id: 'cs_1',
    name: 'Gaia Bodrum',
    subtitle: 'Bodrum, Turkey',
    image: 'https://images.unsplash.com/photo-1515238152791-8225bf064fe5?q=80&w=1000&auto=format&fit=crop',
    opening: 'Summer 2026'
  },
  {
    id: 'cs_2',
    name: 'Gaia St. Tropez',
    subtitle: 'St. Tropez, France',
    image: 'https://images.unsplash.com/photo-1533682805518-48d1f5a8cb6b?q=80&w=1000&auto=format&fit=crop',
    opening: 'Summer 2026'
  }
];

// --- MAIN APP COMPONENT ---
export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState('home'); 
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [toast, setToast] = useState(null);
  
  // LIVE DATABASE STATE! 🔥
  const [spots, setSpots] = useState(MOCK_SPOTS); // Start met mock data als backup
  const [isLive, setIsLive] = useState(false);

  // Ophalen van data uit Firebase
  useEffect(() => {
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
    fetchSpots();
  }, []);

  const [savedLists, setSavedLists] = useState([
    { id: 'l1', name: 'Girls Bodrum 🌸', spots: ['b1', 'b2', 'spot_3'] },
    { id: 'l2', name: 'Cannes with Hubby 🥂', spots: ['spot_2'] },
    { id: 'l3', name: 'Ibiza 2026 🌴', spots: ['spot_1'] }
  ]);
  const [saveModalSpot, setSaveModalSpot] = useState(null);

  const allSavedSpotIds = Array.from(new Set(savedLists.flatMap(l => l.spots)));

  const handleToggleSpotInList = (listId, spotId) => {
    setSavedLists(prev => prev.map(list => {
      if (list.id === listId) {
        const hasSpot = list.spots.includes(spotId);
        return { ...list, spots: hasSpot ? list.spots.filter(id => id !== spotId) : [...list.spots, spotId] };
      }
      return list;
    }));
  };

  const handleCreateList = (name, spotId) => {
    const newList = { id: 'list_' + Date.now(), name, spots: [spotId] };
    setSavedLists(prev => [...prev, newList]);
  };

  const navigateToSpot = (spot) => {
    setPreviousView(currentView);
    setActiveSpot(spot);
    setCurrentView('detail');
  };

  const navigateToCityDetail = (city) => {
    setActiveCityObj(city);
    setCurrentView('city_detail');
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] font-sans text-gray-800 selection:bg-pink-300">
      
      {/* Views met vernieuwde 'spots' prop */}
      {currentView === 'home' && <HomeFeed spots={spots} onSelectSpot={navigateToSpot} allSavedSpotIds={allSavedSpotIds} onSaveClick={setSaveModalSpot} />}
      {currentView === 'all_cities' && <AllCitiesView onSelectCity={navigateToCityDetail} />}
      {currentView === 'city_detail' && <CityDetailView spots={spots} city={activeCityObj} onSelectSpot={navigateToSpot} onBack={() => setCurrentView('all_cities')} allSavedSpotIds={allSavedSpotIds} onSaveClick={setSaveModalSpot} />}
      {currentView === 'detail' && <SpotDetail spot={activeSpot} onBack={() => setCurrentView(previousView)} onHaveBeenClick={() => setCurrentView('have_been')} isSaved={allSavedSpotIds.includes(activeSpot?.id)} onSaveClick={() => setSaveModalSpot(activeSpot)} />}
      {currentView === 'admin' && <AdminDashboard onBack={() => setCurrentView('profile')} isLive={isLive} />}
      {currentView === 'saved' && <SavedView lists={savedLists} allSpots={spots} onSelectSpot={navigateToSpot} allSavedSpotIds={allSavedSpotIds} onSaveClick={setSaveModalSpot} />}
      {currentView === 'profile' && <ProfileView onAdminClick={() => setCurrentView('admin')} />}
      {currentView === 'have_been' && (
        <HaveBeenView 
          spot={activeSpot} 
          onBack={() => setCurrentView('detail')} 
          onSubmit={() => {
            setCurrentView('detail');
            setToast({ title: "Feedback saved!", message: "Thank you for sharing your experience." });
            setTimeout(() => setToast(null), 4000);
          }} 
        />
      )}

      {/* Save Modal Overlay */}
      <SaveModal 
        spot={saveModalSpot} 
        lists={savedLists} 
        onClose={() => setSaveModalSpot(null)} 
        onToggleInList={handleToggleSpotInList} 
        onCreateList={handleCreateList} 
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/50 pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-400">
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-gray-900' : ''}`}>
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          <button onClick={() => setCurrentView('all_cities')} className={`flex flex-col items-center gap-1 ${(currentView === 'all_cities' || currentView === 'city_detail') ? 'text-gray-900' : 'hover:text-gray-600 transition-colors'}`}>
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-medium">All</span>
          </button>
          <button onClick={() => setCurrentView('saved')} className={`flex flex-col items-center gap-1 ${currentView === 'saved' ? 'text-pink-500' : 'hover:text-pink-400 transition-colors'} relative`}>
            <Heart className={`w-6 h-6 ${currentView === 'saved' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">Saved</span>
            {allSavedSpotIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] flex items-center justify-center font-bold rounded-full border-2 border-white">
                {allSavedSpotIds.length}
              </span>
            )}
          </button>
          <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center gap-1 ${currentView === 'profile' || currentView === 'admin' ? 'text-gray-900' : ''}`}>
            <div className={`w-6 h-6 rounded-full overflow-hidden ${currentView === 'profile' || currentView === 'admin' ? 'ring-2 ring-pink-500' : 'border-2 border-white'}`}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// --- HOME FEED COMPONENT ---
function HomeFeed({ spots, onSelectSpot, allSavedSpotIds, onSaveClick }) {
  const [activeCity, setActiveCity] = useState('Global');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="pb-24">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-gradient-to-b from-[#FFD1DC]/90 via-[#FFD1DC]/80 to-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black tracking-tighter text-pink-500">
            LocaVibes.
          </h1>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 bg-white/50 rounded-full backdrop-blur-md border border-white shadow-sm hover:bg-white/80 transition-all">
            <Filter className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCity === city 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'bg-white/50 text-gray-600 border border-white hover:bg-white/80'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 space-y-6">
        <div className="flex bg-white/40 p-1 rounded-full border border-white/60 backdrop-blur-md w-max mx-auto shadow-sm">
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>
            <List className="w-4 h-4" /> List
          </button>
          <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>
            <MapPin className="w-4 h-4" /> Map
          </button>
        </div>

        {viewMode === 'map' ? (
          <div className="w-full h-[50vh] bg-blue-100 rounded-3xl border border-white shadow-inner flex items-center justify-center overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Map mock" />
            <div className="absolute bg-white px-4 py-2 rounded-full shadow-lg font-bold text-pink-600 animate-bounce">📍 Oceanic Beach Club</div>
          </div>
        ) : (
          <>
            {spots.filter(s => s.isEditorsChoice).map(spot => (
              <SpotCard 
                key={spot.id} 
                spot={spot} 
                onClick={() => onSelectSpot(spot)} 
                isSponsored 
                isSaved={allSavedSpotIds.includes(spot.id)}
                onSaveClick={() => onSaveClick(spot)}
              />
            ))}

            <div className="pt-2">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                The Top 10 <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">Worldwide</span>
              </h2>
              <div className="space-y-4">
                {spots.filter(s => !s.isEditorsChoice).map((spot, index) => (
                  <SpotCard 
                    key={spot.id} 
                    spot={spot} 
                    rank={index + 2} 
                    onClick={() => onSelectSpot(spot)} 
                    isSaved={allSavedSpotIds.includes(spot.id)}
                    onSaveClick={() => onSaveClick(spot)}
                  />
                ))}
              </div>
            </div>
            
            <div className="pt-8 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Coming Soon</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar">
                {MOCK_COMING_SOON.map(spot => (
                  <div key={spot.id} className="min-w-[240px] bg-white/60 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-lg opacity-90 grayscale-[20%] snap-center">
                    <div className="h-32 w-full relative">
                      <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900">
                          {spot.opening}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-gray-900">{spot.name}</h4>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {spot.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// --- SAVED VIEW COMPONENT ---
function SavedView({ lists, allSpots, onSelectSpot, onSaveClick, allSavedSpotIds }) {
  const [activeListId, setActiveListId] = useState(null);

  if (activeListId) {
    const list = lists.find(l => l.id === activeListId);
    const spotsInList = allSpots.filter(s => list.spots.includes(s.id));

    return (
      <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in slide-in-from-right-4">
        <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => setActiveListId(null)} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
          </div>
          <span className="text-sm text-gray-500 font-medium">{spotsInList.length} spots in this list</span>
        </header>

        <div className="px-5 mt-2 space-y-4">
          {spotsInList.map(spot => (
            <SpotCard 
              key={spot.id} 
              spot={spot} 
              onClick={() => onSelectSpot(spot)} 
              isSaved={allSavedSpotIds.includes(spot.id)}
              onSaveClick={() => onSaveClick(spot)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in fade-in">
      <header className="pt-12 px-5 pb-6 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md flex justify-between items-end">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Saved</h1>
        <span className="text-sm text-gray-500 font-medium pb-1">{lists.length} lists</span>
      </header>

      <div className="px-5 grid grid-cols-2 gap-4">
        {lists.map(list => {
          const firstSpot = allSpots.find(s => s.id === list.spots[0]);
          const coverImage = firstSpot ? firstSpot.image : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop';
          return (
            <div 
              key={list.id} 
              onClick={() => setActiveListId(list.id)} 
              className="relative h-56 rounded-3xl overflow-hidden cursor-pointer shadow-sm group transform transition-transform active:scale-95"
            >
               <img src={coverImage} alt={list.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
               <div className="absolute bottom-4 left-4 right-4 text-white">
                 <h2 className="text-sm font-bold leading-tight mb-1 truncate">{list.name}</h2>
                 <p className="text-xs text-white/80">{list.spots.length} spots</p>
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

// --- PROFILE VIEW COMPONENT ---
function ProfileView({ onAdminClick }) {
  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32 animate-in fade-in">
      <header className="pt-16 px-5 pb-8 bg-white/60 backdrop-blur-md rounded-b-[3rem] shadow-sm text-center">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-lg">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sophie L.</h1>
        <p className="text-sm text-pink-500 font-medium">@sophie_vibes</p>
      </header>
      <div className="px-5 mt-8 space-y-3">
        <button onClick={onAdminClick} className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-2xl shadow-sm hover:bg-gray-800 transition-all mt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-xl"><ShieldAlert className="w-5 h-5" /></div>
            <span className="font-semibold text-white">Admin Dashboard</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// --- SPOT CARD COMPONENT ---
function SpotCard({ spot, isSponsored, rank, onClick, isSaved, onSaveClick }) {
  const overall = ((spot.rating.food + spot.rating.service + spot.rating.vibe) / 3).toFixed(1);

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white/60 backdrop-blur-xl border-2 cursor-pointer transition-transform active:scale-95 ${
        isSponsored ? 'border-yellow-300 shadow-[0_10px_40px_rgba(253,224,71,0.3)]' : 'border-white shadow-lg'
      } rounded-[2rem] overflow-hidden`}
    >
      <div className="h-56 w-full overflow-hidden">
        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {rank && <span className="text-pink-400 mr-2">#{rank}</span>}
              {spot.name}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {spot.subtitle}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-pink-100 shadow-sm flex items-center">
            <DiamondDisplay score={parseFloat(overall)} size="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SPOT DETAIL COMPONENT ---
function SpotDetail({ spot, onBack, onHaveBeenClick, isSaved, onSaveClick }) {
  const [activeTab, setActiveTab] = useState('view');
  
  if (!spot) return null;

  return (
    <div className="min-h-screen bg-[#FFF9E3] pb-32 animate-in slide-in-from-right-8 duration-300">
      <div className="relative h-80 w-full">
        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover rounded-b-[3rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-[3rem]"></div>
        
        <button onClick={onBack} className="absolute top-12 left-5 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-3xl font-black tracking-tight">{spot.name}</h1>
          <p className="text-white/80 font-medium flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {spot.subtitle}
          </p>
        </div>
      </div>
      <div className="px-5 mt-6">
          <button onClick={onHaveBeenClick} className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl mb-4 shadow-lg hover:bg-gray-800 transition-colors">
            Rate The Vibe
          </button>
      </div>
    </div>
  );
}

// --- HAVE BEEN COMPONENT ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [selectedVibes, setSelectedVibes] = useState([]);
  
  const currentOptions = ['Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date'];

  const toggleVibe = (vibe) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  if (!spot) return null;

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32 animate-in slide-in-from-bottom-8 duration-300">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Your Experience</h1>
      </header>

      <div className="px-5 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-white">
          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {currentOptions.map(vibe => (
                <button key={vibe} onClick={() => toggleVibe(vibe)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${selectedVibes.includes(vibe) ? 'bg-pink-500 text-white' : 'bg-gray-50'}`}>
                  {vibe}
                </button>
            ))}
          </div>
          <button onClick={onSubmit} className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg">Save my Vibes</button>
        </div>
      </div>
    </div>
  );
}

// --- SAVE TO LIST MODAL COMPONENT ---
function SaveModal({ spot, lists, onClose, onToggleInList, onCreateList }) {
  if (!spot) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-safe" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Save to list</h3>
        <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Done</button>
      </div>
    </div>
  )
}

// --- UI HELPERS ---
function DiamondDisplay({ score, size = "w-3 h-3" }) {
  const full = Math.floor(score);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((idx) => (
        <Gem key={idx} className={`${size} ${idx <= full ? 'fill-pink-500 text-pink-500' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

// --- ADMIN DASHBOARD COMPONENT (MET FIREBASE UPLOAD KNOP!) ---
function AdminDashboard({ onBack, isLive }) {
  // 🔥 Deze magische functie pakt jouw oude neppe data, en gooit het direct in de live database!
  const handleUploadToFirebase = async () => {
    try {
      const batch = writeBatch(db);
      MOCK_SPOTS.forEach(spot => {
        const spotRef = doc(db, "spots", spot.id);
        batch.set(spotRef, spot);
      });
      await batch.commit();
      alert("WOOHOO! 🎉 Jouw start-locaties staan nu veilig in je Firebase database!");
      window.location.reload(); // Herlaad de app om de live data te laten zien
    } catch (error) {
      alert("Oeps, er ging iets mis: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 animate-in fade-in">
      <header className="bg-gray-900 text-white p-5 pt-12 sticky top-0 z-10 flex items-center gap-4 shadow-lg">
        <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><ChevronLeft className="w-5 h-5"/></button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </header>
      
      <div className="p-5">
        {/* FIREBASE MAGIC UPLOAD KNOP */}
        <div className="bg-gradient-to-r from-pink-500 to-orange-400 rounded-3xl p-6 text-white mb-6 shadow-xl">
          <h2 className="text-xl font-black mb-2 tracking-tight">Database Setup 🔥</h2>
          {isLive ? (
            <div className="bg-white/20 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <p className="text-sm font-bold">App is verbonden met live Firebase data!</p>
            </div>
          ) : (
            <>
              <p className="text-sm mb-5 font-medium opacity-90">Je Firebase kluis is nog leeg. Klik hieronder om jouw start-locaties er in één keer naartoe te sturen!</p>
              <button 
                onClick={handleUploadToFirebase} 
                className="w-full bg-white text-pink-600 font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                Stuur Data naar Firebase 🚀
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- ALL CITIES VIEW COMPONENT ---
function AllCitiesView({ onSelectCity }) {
  const totalSpots = MOCK_CITIES.reduce((acc, city) => acc + city.count, 0);

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in fade-in">
      <header className="pt-12 px-5 pb-6 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md flex justify-between items-end">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">All Cities</h1>
        <span className="text-sm text-gray-500 font-medium pb-1">{totalSpots} spots</span>
      </header>

      <div className="px-5 grid grid-cols-2 gap-4">
        {MOCK_CITIES.map((city) => (
          <div 
            key={city.id} 
            onClick={() => onSelectCity(city)}
            className="relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm group transform transition-transform active:scale-95"
          >
            <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-pink-100/30 via-transparent to-gray-900/80"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-xl font-bold">{city.name}</h2>
              <p className="text-sm text-white/80">{city.count} spots</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CITY DETAIL VIEW COMPONENT ---
function CityDetailView({ spots, city, onSelectSpot, onBack, allSavedSpotIds, onSaveClick }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Restaurant', 'Lunch', 'Breakfast', 'Club', 'Hotel'];

  const citySpots = spots.filter(s => s.city === city?.name);

  const filteredSpots = activeFilter === 'All' 
    ? citySpots 
    : citySpots.filter(s => s.type === activeFilter);

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in slide-in-from-right-4">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{city?.name}</h1>
          </div>
          <span className="text-sm text-gray-500 font-medium">{city?.count} results</span>
        </div>
      </header>

      <div className="px-5 mt-2 space-y-3">
        {filteredSpots.map((spot, index) => {
          const isSaved = allSavedSpotIds.includes(spot.id);
          return (
            <div 
              key={spot.id || index}
              onClick={() => onSelectSpot(spot)}
              className="bg-white rounded-[1.5rem] p-2 pr-4 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden shrink-0">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{spot.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                  <Utensils className="w-3.5 h-3.5" /> {spot.type}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
