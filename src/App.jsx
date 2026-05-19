import { useState, useEffect } from 'react';
import {
  Map, List, Heart, Filter, MapPin, ExternalLink,
  Instagram, Globe, Camera, Utensils, Armchair, ChevronLeft,
  ThumbsUp, CheckCircle, Bell, Star, Compass, LayoutGrid, ChevronRight, ArrowLeft
} from 'lucide-react';

// --- MOCK DATA ---
const CITIES = ['Global', 'Bodrum', 'Ibiza', 'Cannes', 'Monaco', 'Marbella', 'St-Tropez', 'Amsterdam'];

const MOCK_CITIES = [
  { id: 'c1', name: 'Bodrum', count: 67, image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop' },
  { id: 'c2', name: 'Ibiza', count: 0, image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop' },
  { id: 'c3', name: 'Mykonos', count: 0, image: 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=500&auto=format&fit=crop' },
  { id: 'c4', name: 'Monaco', count: 47, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop' },
];

type Spot = {
  id: string;
  name: string;
  subtitle: string;
  city: string;
  type: string;
  isEditorsChoice?: boolean;
  price: string;
  tags: string[];
  image: string;
  rating: { food: number; service: number; vibe: number; totalVotes: number };
  galleries: { view: any[]; table: any[]; food: any[] };
};

const MOCK_SPOTS: Spot[] = [
  {
    id: 'spot_1', name: 'Oceanic Beach Club', subtitle: 'Ibiza, Spain', city: 'Ibiza', type: 'Beach Club',
    isEditorsChoice: true, price: '€€€€', tags: ['Boho-chic', "Girls' Night", 'Best view'],
    image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=1000&auto=format&fit=crop',
    rating: { food: 8.5, service: 9.0, vibe: 9.8, totalVotes: 1240 },
    galleries: {
      view: [
        { id: 1, url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=500&auto=format&fit=crop', upvotes: 342, author: 'SarahM', time: 'Sunset (19:30)' },
        { id: 2, url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop', upvotes: 128, author: 'Elena_V', time: 'Afternoon' },
      ],
      table: [
        { id: 3, url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=500&auto=format&fit=crop', upvotes: 450, author: 'LuxeTraveler', tip: 'Ask for Cabana 4 for the best sunset angle.' },
      ],
      food: [
        { id: 4, url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500&auto=format&fit=crop', upvotes: 512, author: 'FoodieG', tip: 'Signature Truffle Pasta' },
      ],
    },
  },
  {
    id: 'spot_2', name: 'Lumière Rooftop', subtitle: 'Cannes, France', city: 'Cannes', type: 'Restaurant',
    isEditorsChoice: false, price: '€€€', tags: ['Industrial', 'Date Night', 'Celebrity hotspot'],
    image: 'https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=1000&auto=format&fit=crop',
    rating: { food: 9.2, service: 8.8, vibe: 9.5, totalVotes: 890 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: 'spot_3', name: 'Casa Blanca', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Lunch',
    isEditorsChoice: false, price: '€€', tags: ['Pink/Floral', 'Working from a Cafe', 'Crazy presentation'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
    rating: { food: 8.9, service: 9.1, vibe: 8.7, totalVotes: 450 },
    galleries: { view: [], table: [], food: [] },
  },
  { id: 'b1', name: 'Zuma', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&auto=format&fit=crop', rating: { food: 8, service: 8, vibe: 9, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'b2', name: 'Mudavim', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200&auto=format&fit=crop', rating: { food: 8, service: 8, vibe: 9, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'b3', name: 'Bagatelle', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=200&auto=format&fit=crop', rating: { food: 8, service: 8, vibe: 9, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'b4', name: 'Wu', subtitle: 'Bodrum, Turkey', city: 'Bodrum', type: 'Restaurant', price: '€€', tags: ['Trendy'], image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200&auto=format&fit=crop', rating: { food: 8, service: 8, vibe: 9, totalVotes: 100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'm1', name: 'Amazonico', subtitle: 'Monte-Carlo, Monaco', city: 'Monaco', type: 'Restaurant', price: '€€€€', tags: ['Latin American fusion', 'Trendy'], image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop', rating: { food: 9.2, service: 8.9, vibe: 9.7, totalVotes: 850 }, galleries: { view: [], table: [], food: [] } },
  { id: 'm2', name: 'Cipriani', subtitle: 'Monte-Carlo, Monaco', city: 'Monaco', type: 'Restaurant', price: '€€€€', tags: ['Italian', 'Smart Elegant'], image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=500&auto=format&fit=crop', rating: { food: 9.0, service: 9.3, vibe: 8.5, totalVotes: 620 }, galleries: { view: [], table: [], food: [] } },
  { id: 'm3', name: 'Hotel de Paris Monte-Carlo', subtitle: 'Pl. du Casino, Monaco', city: 'Monaco', type: 'Hotel', isEditorsChoice: true, price: '€€€€', tags: ['5-star hotel', 'Luxury'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop', rating: { food: 9.5, service: 9.8, vibe: 9.9, totalVotes: 2100 }, galleries: { view: [], table: [], food: [] } },
  { id: 'm4', name: 'Niwaki', subtitle: 'Monte-Carlo, Monaco', city: 'Monaco', type: 'Restaurant', price: '€€€', tags: ['Japanese', 'Sushi'], image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop', rating: { food: 9.4, service: 9.1, vibe: 8.9, totalVotes: 500 }, galleries: { view: [], table: [], food: [] } },
  { id: 'm5', name: 'Monte-Carlo Beach', subtitle: 'Roquebrune-Cap-Martin', city: 'Monaco', type: 'Hotel', price: '€€€€', tags: ['5-star hotel', 'Beachfront'], image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=500&auto=format&fit=crop', rating: { food: 8.8, service: 9.2, vibe: 9.6, totalVotes: 980 }, galleries: { view: [], table: [], food: [] } },
];

const MOCK_COMING_SOON = [
  { id: 'cs_1', name: 'Gaia Bodrum', subtitle: 'Bodrum, Turkije', image: 'https://images.unsplash.com/photo-1515238152791-8225bf064fe5?q=80&w=1000&auto=format&fit=crop', opening: 'Zomer 2026' },
  { id: 'cs_2', name: 'Gaia St. Tropez', subtitle: 'St. Tropez, Frankrijk', image: 'https://images.unsplash.com/photo-1533682805518-48d1f5a8cb6b?q=80&w=1000&auto=format&fit=crop', opening: 'Zomer 2026' },
];

// --- MAIN APP ---
export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'admin' | 'all_cities' | 'city_detail' | 'have_been'>('home');
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [activeCityObj, setActiveCityObj] = useState<typeof MOCK_CITIES[number] | null>(null);
  const [previousView, setPreviousView] = useState<typeof currentView>('home');
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToast({ title: '📍 Je bent dichtbij!', message: 'Je bent 200m verwijderd van Oceanic Beach Club! Tik om te bekijken.' });
      setTimeout(() => setToast(null), 5000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const navigateToSpot = (spot: Spot) => {
    setPreviousView(currentView);
    setActiveSpot(spot);
    setCurrentView('detail');
  };

  const navigateToCityDetail = (city: typeof MOCK_CITIES[number]) => {
    setActiveCityObj(city);
    setCurrentView('city_detail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-orange-50 pb-24">
      {currentView === 'home' && <HomeFeed onSelectSpot={navigateToSpot} onAdminClick={() => setCurrentView('admin')} />}
      {currentView === 'all_cities' && <AllCitiesView onSelectCity={navigateToCityDetail} />}
      {currentView === 'city_detail' && <CityDetailView city={activeCityObj} onSelectSpot={navigateToSpot} onBack={() => setCurrentView('all_cities')} />}
      {currentView === 'detail' && <SpotDetail spot={activeSpot} onBack={() => setCurrentView(previousView)} onHaveBeenClick={() => setCurrentView('have_been')} />}
      {currentView === 'admin' && <AdminDashboard onBack={() => setCurrentView('home')} />}
      {currentView === 'have_been' && (
        <HaveBeenView
          spot={activeSpot}
          onBack={() => setCurrentView('detail')}
          onSubmit={() => {
            setCurrentView('detail');
            setToast({ title: 'Feedback opgeslagen!', message: 'Bedankt voor het delen van je ervaring.' });
            setTimeout(() => setToast(null), 4000);
          }}
        />
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white p-4 flex items-start gap-3">
            <div className="bg-pink-100 rounded-full p-2">
              <Bell className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">{toast.title}</p>
              <p className="text-gray-600 text-xs mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40">
        <div className="flex justify-around items-center py-3 px-4 text-xs text-gray-500 max-w-md mx-auto">
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-gray-900' : ''}`}>
            <Compass className="w-5 h-5" /> Ontdek
          </button>
          <button onClick={() => setCurrentView('all_cities')} className={`flex flex-col items-center gap-1 ${(currentView === 'all_cities' || currentView === 'city_detail') ? 'text-gray-900' : 'hover:text-gray-600 transition-colors'}`}>
            <LayoutGrid className="w-5 h-5" /> Alles
          </button>
          <button className="flex flex-col items-center gap-1 relative">
            <Heart className="w-5 h-5" /> Opgeslagen
            <span className="absolute -top-1 right-2 bg-pink-500 text-white text-[10px] px-1.5 rounded-full">3</span>
          </button>
          <button onClick={() => setCurrentView('admin')} className={`flex flex-col items-center gap-1 ${currentView === 'admin' ? 'text-gray-900' : ''}`}>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
            Profiel
          </button>
        </div>
      </nav>
    </div>
  );
}

// --- HOME FEED ---
function HomeFeed({ onSelectSpot, onAdminClick }: { onSelectSpot: (s: Spot) => void; onAdminClick: () => void }) {
  const [activeCity, setActiveCity] = useState('Global');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="max-w-md mx-auto">
      <div className="px-5 pt-6 pb-4 sticky top-0 z-30 bg-gradient-to-b from-pink-50/95 to-pink-50/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 onClick={onAdminClick} className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent cursor-pointer">
            LocaVibes.
          </h1>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 bg-white/50 rounded-full backdrop-blur-md border border-white shadow-sm hover:bg-white/80 transition-all">
            <Filter className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
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

        {showFilters && (
          <div className="mt-3 p-4 bg-white rounded-2xl shadow-md border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Vibe Filters</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">🌸 Pink/Floral</span>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">🍸 Date Night</span>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">📸 Best View</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-2">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1 mb-5 w-fit mx-auto">
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>
            <List className="w-4 h-4" /> Lijst
          </button>
          <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'}`}>
            <Map className="w-4 h-4" /> Kaart
          </button>
        </div>

        {viewMode === 'map' ? (
          <div className="h-[500px] rounded-3xl bg-gradient-to-br from-blue-100 to-pink-100 flex flex-col items-center justify-center text-gray-500 shadow-inner">
            <MapPin className="w-10 h-10 mb-2 text-pink-500" />
            <p className="font-semibold">📍 Oceanic Beach Club</p>
          </div>
        ) : (
          <>
            {MOCK_SPOTS.filter(s => s.isEditorsChoice).map(spot => (
              <SpotCard key={spot.id} spot={spot} onClick={() => onSelectSpot(spot)} isSponsored />
            ))}

            <div className="mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">De Top 10 Wereldwijd</h2>
              <div className="space-y-4">
                {MOCK_SPOTS.filter(s => !s.isEditorsChoice).map((spot, index) => (
                  <SpotCard key={spot.id} spot={spot} rank={index + 1} onClick={() => onSelectSpot(spot)} />
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">Binnenkort Verwacht</h2>
              <div className="space-y-4">
                {MOCK_COMING_SOON.map(spot => (
                  <div key={spot.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                    <div className="relative h-40">
                      <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-900">
                          {spot.opening}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900">{spot.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {spot.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- SPOT CARD ---
function SpotCard({ spot, isSponsored, rank, onClick }: { spot: Spot; isSponsored?: boolean; rank?: number; onClick: () => void }) {
  const overall = ((spot.rating.food + spot.rating.service + spot.rating.vibe) / 3).toFixed(1);

  return (
    <div onClick={onClick} className="relative bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      {isSponsored && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Editor's Choice
          </span>
        </div>
      )}
      <button className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white" onClick={(e) => e.stopPropagation()}>
        <Heart className="w-4 h-4 text-gray-700" />
      </button>

      <div className="relative h-56">
        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">
              {rank && <span className="text-pink-500 mr-1">#{rank}</span>}
              {spot.name}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {spot.subtitle}
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-orange-400 text-white px-3 py-1.5 rounded-2xl font-bold text-sm shrink-0">
            {overall}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{spot.price}</span>
          {spot.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-semibold">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SPOT DETAIL ---
function SpotDetail({ spot, onBack, onHaveBeenClick }: { spot: Spot | null; onBack: () => void; onHaveBeenClick: () => void }) {
  const [activeTab, setActiveTab] = useState<'view' | 'table' | 'food'>('view');
  const [draftRating, setDraftRating] = useState({ food: 5.0, service: 5.0, vibe: 5.0 });
  const [hasRated, setHasRated] = useState(false);
  const draftOverall = ((draftRating.food + draftRating.service + draftRating.vibe) / 3).toFixed(1);

  if (!spot) return null;

  return (
    <div className="max-w-md mx-auto">
      <div className="relative h-80">
        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <button onClick={onBack} className="absolute top-4 left-4 p-2.5 bg-white/30 backdrop-blur-md rounded-full">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button className="absolute top-4 right-4 p-2.5 bg-white/30 backdrop-blur-md rounded-full">
          <Heart className="w-5 h-5 text-white" />
        </button>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <h1 className="text-3xl font-bold">{spot.name}</h1>
          <p className="flex items-center gap-1 text-sm opacity-90 mt-1">
            <MapPin className="w-4 h-4" /> {spot.subtitle}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex justify-around bg-white rounded-2xl shadow-sm p-2">
          <button className="flex flex-col items-center gap-1 text-pink-600 text-xs font-semibold py-2 px-4">
            <Instagram className="w-5 h-5" /> Instagram
          </button>
          <button className="flex flex-col items-center gap-1 text-pink-600 text-xs font-semibold py-2 px-4">
            <MapPin className="w-5 h-5" /> Adres
          </button>
          <button className="flex flex-col items-center gap-1 text-pink-600 text-xs font-semibold py-2 px-4">
            <Globe className="w-5 h-5" /> Website
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{spot.price}</span>
          {spot.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-semibold">{tag}</span>
          ))}
        </div>

        <button className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2">
          <ExternalLink className="w-4 h-4" /> Reserveer een tafel
        </button>

        <button onClick={onHaveBeenClick} className="w-full bg-white border border-gray-200 text-gray-900 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Ben je hier geweest?
        </button>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">De Vibe Score</h3>

          {hasRated ? (
            <div className="text-center py-4">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-gray-900">Bedankt voor je beoordeling!</p>
              <p className="text-sm text-gray-500 mb-3">Je helpt de community hiermee.</p>
              <button onClick={() => setHasRated(false)} className="text-pink-600 text-sm font-semibold">Beoordeling bewerken</button>
            </div>
          ) : (
            <div className="space-y-4">
              <SliderRow label="Eten" icon={<Utensils className="w-4 h-4" />} value={draftRating.food} onChange={(v) => setDraftRating({ ...draftRating, food: parseFloat(v) })} />
              <SliderRow label="Service" icon={<ThumbsUp className="w-4 h-4" />} value={draftRating.service} onChange={(v) => setDraftRating({ ...draftRating, service: parseFloat(v) })} />
              <SliderRow label="Vibe" icon={<Star className="w-4 h-4" />} value={draftRating.vibe} onChange={(v) => setDraftRating({ ...draftRating, vibe: parseFloat(v) })} />

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Jouw Gemiddelde</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">{draftOverall}</span>
              </div>
              <button onClick={() => setHasRated(true)} className="w-full bg-gradient-to-r from-pink-400 to-orange-400 text-white font-bold py-3 rounded-xl shadow-md">
                Verzend Vibe Check
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Visuele Intelligentie</h3>
          <div className="flex gap-2 mb-4">
            <TabButton active={activeTab === 'view'} onClick={() => setActiveTab('view')} icon={<Camera className="w-4 h-4" />}>Het Uitzicht</TabButton>
            <TabButton active={activeTab === 'table'} onClick={() => setActiveTab('table')} icon={<Armchair className="w-4 h-4" />}>Beste Tafel</TabButton>
            <TabButton active={activeTab === 'food'} onClick={() => setActiveTab('food')} icon={<Utensils className="w-4 h-4" />}>Eten</TabButton>
          </div>

          <div className="space-y-4">
            {spot.galleries[activeTab]?.length > 0 ? (
              spot.galleries[activeTab].map((photo: any) => (
                <div key={photo.id} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="relative h-56">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {photo.time && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 backdrop-blur text-white text-xs rounded-full">{photo.time}</span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Geverifieerde Locatie
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">@{photo.author}</p>
                      {photo.tip && <p className="text-xs text-gray-500 italic">"{photo.tip}"</p>}
                    </div>
                    <button className="flex items-center gap-1 text-pink-600 text-sm font-semibold">
                      <ThumbsUp className="w-4 h-4" /> {photo.upvotes}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-sm text-gray-500 mb-3">Nog geen foto's hier. Wees de eerste!</p>
                <button className="px-4 py-2 bg-pink-500 text-white text-sm font-semibold rounded-full">+ Upload Foto</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HAVE BEEN VIEW ---
function HaveBeenView({ spot, onBack, onSubmit }: { spot: Spot | null; onBack: () => void; onSubmit: () => void }) {
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const vibeOptions = [
    'Business', 'Party', 'Quiet', 'Instagrammable',
    'Luxury', 'Vibe for solodate', 'Vibe for groups',
    'Vega / Vegan friendly', 'Gluten-free options', 'Halal options',
    'Great cocktails / Mocktails', 'Worth the hype', 'Worth the queue',
    'Unique presentation', 'Food show', 'Hidden gem', 'Secret entrance',
    'Walk-ins only', 'Outdoor seating', 'Terrace', 'First date',
    'Anniversary / Romantic', 'Late night vibe', 'DJ',
  ];

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev => prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]);
  };

  if (!spot) return null;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">Jouw Ervaring</h2>
      </div>

      <div className="px-5 pb-32">
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="relative h-32 rounded-2xl overflow-hidden mb-4">
            <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="font-bold text-xl text-gray-900">{spot.name}</h3>
          <p className="text-sm text-gray-500 mb-4">Wat was van toepassing tijdens jouw bezoek?</p>

          <div className="flex flex-wrap gap-2">
            {vibeOptions.map(vibe => {
              const isSelected = selectedVibes.includes(vibe);
              return (
                <button
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm border ${
                    isSelected
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {vibe}
                </button>
              );
            })}
          </div>

          <button
            onClick={onSubmit}
            disabled={selectedVibes.length === 0}
            className={`w-full mt-6 py-3.5 rounded-2xl font-bold transition-all ${
              selectedVibes.length > 0
                ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg transform hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Sla mijn Vibes op
          </button>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS ---
function SliderRow({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">{icon} {label}</span>
        <span className="text-sm font-bold text-pink-600">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
      />
    </div>
  );
}

function TabButton({ children, active, onClick, icon }: { children: React.ReactNode; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active ? 'bg-pink-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon} {children}
    </button>
  );
}

// --- ADMIN ---
function AdminDashboard({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 px-5 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">Admin Moderatie</h2>
      </div>

      <div className="px-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase">Wachtende Inzendingen</h3>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-pink-600 uppercase">Nieuw Stadsverzoek</span>
              <p className="font-bold text-gray-900 mt-1">Bali, Indonesië</p>
              <p className="text-xs text-gray-500">Ingezonden door @TravelGuru</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold">Publiceren</button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">Weigeren</button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs font-bold text-pink-600 uppercase">Foto Upload</span>
              <p className="font-bold text-gray-900 mt-1">Het Uitzicht @ Lumière Rooftop</p>
              <p className="text-xs text-gray-500">EXIF data geverifieerd.</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-semibold">Goedkeuren</button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">Weigeren</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ALL CITIES ---
function AllCitiesView({ onSelectCity }: { onSelectCity: (c: typeof MOCK_CITIES[number]) => void }) {
  const totalSpots = MOCK_CITIES.reduce((acc, city) => acc + city.count, 0);

  return (
    <div className="max-w-md mx-auto px-5 pt-6">
      <div className="flex items-end justify-between mb-5">
        <h1 className="text-3xl font-bold text-gray-900">Alle Steden</h1>
        <span className="text-sm text-gray-500">{totalSpots} plekken</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MOCK_CITIES.map(city => (
          <div
            key={city.id}
            onClick={() => onSelectCity(city)}
            className="relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm group transform transition-transform active:scale-95"
          >
            <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="font-bold text-xl">{city.name}</h3>
              <p className="text-xs opacity-90">{city.count} plekken</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CITY DETAIL ---
function CityDetailView({ city, onSelectSpot, onBack }: { city: typeof MOCK_CITIES[number] | null; onSelectSpot: (s: Spot) => void; onBack: () => void }) {
  const [activeFilter, setActiveFilter] = useState('Alles');
  const filters = ['Alles', 'Restaurant', 'Lunch', 'Breakfast', 'Club', 'Hotel'];

  const citySpots = MOCK_SPOTS.filter(s => s.city === city?.name);
  const filteredSpots = activeFilter === 'Alles' ? citySpots : citySpots.filter(s => s.type === activeFilter);

  return (
    <div className="max-w-md mx-auto">
      <div className="px-5 pt-6 pb-3 sticky top-0 bg-gradient-to-b from-pink-50/95 to-pink-50/80 backdrop-blur-md z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{city?.name}</h1>
          </div>
          <span className="text-xs text-gray-500">{city?.count} resultaten</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                activeFilter === filter
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
              }`}
            >
              {filter === 'Alles' && <LayoutGrid className="w-3.5 h-3.5" />}
              {filter === 'Restaurant' && <Utensils className="w-3.5 h-3.5" />}
              {filter === 'Lunch' && <Utensils className="w-3.5 h-3.5" />}
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-3 space-y-3">
        {filteredSpots.map(spot => (
          <div
            key={spot.id}
            onClick={() => onSelectSpot(spot)}
            className="bg-white rounded-[1.5rem] p-2 pr-4 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
              <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{spot.name}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Utensils className="w-3 h-3" /> {spot.type}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        ))}
        {filteredSpots.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-8">Geen plekken gevonden voor dit filter in {city?.name}.</p>
        )}
      </div>
    </div>
  );
}
