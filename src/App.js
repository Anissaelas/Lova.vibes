import React, { useState, useEffect } from "react";
import {
  Map,
  List,
  Heart,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Instagram,
  Globe,
  Camera,
  Utensils,
  Armchair,
  ChevronLeft,
  ThumbsUp,
  CheckCircle,
  Bell,
  Star,
  Compass,
  LayoutGrid,
  ChevronRight,
  ArrowLeft,
  Gem,
  User,
  Settings,
  ShieldAlert,
  Check,
  Plus,
  Folder,
} from "lucide-react";

// --- MOCK DATA ---
const CITIES = [
  "Global",
  "Bodrum",
  "Ibiza",
  "Cannes",
  "Monaco",
  "Marbella",
  "St-Tropez",
  "Amsterdam",
];

const MOCK_CITIES = [
  {
    id: "c1",
    name: "Bodrum",
    count: 67,
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "c2",
    name: "Ibiza",
    count: 0,
    image:
      "https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "c3",
    name: "Mykonos",
    count: 0,
    image:
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "c4",
    name: "Monaco",
    count: 47,
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop",
  },
];

// Ratings updated to a 1-5 Diamond scale
const MOCK_SPOTS = [
  {
    id: "spot_1",
    name: "Oceanic Beach Club",
    subtitle: "Ibiza, Spain",
    city: "Ibiza",
    type: "Beach Club",
    isEditorsChoice: true,
    price: "€€€€",
    tags: ["Boho-chic", "Girls' Night", "Best view"],
    image:
      "https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=1000&auto=format&fit=crop",
    rating: { food: 4.3, service: 4.5, vibe: 4.9, totalVotes: 1240 },
    galleries: {
      view: [
        {
          id: 1,
          url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=500&auto=format&fit=crop",
          upvotes: 342,
          author: "SarahM",
          time: "Sunset (19:30)",
        },
        {
          id: 2,
          url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500&auto=format&fit=crop",
          upvotes: 128,
          author: "Elena_V",
          time: "Afternoon",
        },
      ],
      table: [
        {
          id: 3,
          url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=500&auto=format&fit=crop",
          upvotes: 450,
          author: "LuxeTraveler",
          tip: "Ask for Cabana 4 for the best sunset angle.",
        },
      ],
      food: [
        {
          id: 4,
          url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=500&auto=format&fit=crop",
          upvotes: 512,
          author: "FoodieG",
          tip: "Signature Truffle Pasta",
        },
      ],
    },
  },
  {
    id: "spot_2",
    name: "Lumière Rooftop",
    subtitle: "Cannes, France",
    city: "Cannes",
    type: "Restaurant",
    isEditorsChoice: false,
    price: "€€€",
    tags: ["Industrial", "Date Night", "Celebrity hotspot"],
    image:
      "https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=1000&auto=format&fit=crop",
    rating: { food: 4.6, service: 4.4, vibe: 4.8, totalVotes: 890 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "spot_3",
    name: "Casa Blanca",
    subtitle: "Bodrum, Turkey",
    city: "Bodrum",
    type: "Lunch",
    isEditorsChoice: false,
    price: "€€",
    tags: ["Pink/Floral", "Working from a Cafe", "Crazy presentation"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
    rating: { food: 4.5, service: 4.6, vibe: 4.4, totalVotes: 450 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "b1",
    name: "Zuma",
    subtitle: "Bodrum, Turkey",
    city: "Bodrum",
    type: "Restaurant",
    price: "€€€€",
    tags: ["Trendy"],
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=200&auto=format&fit=crop",
    rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "b2",
    name: "Mudavim",
    subtitle: "Bodrum, Turkey",
    city: "Bodrum",
    type: "Restaurant",
    price: "€€",
    tags: ["Trendy"],
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200&auto=format&fit=crop",
    rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "b3",
    name: "Bagatelle",
    subtitle: "Bodrum, Turkey",
    city: "Bodrum",
    type: "Restaurant",
    price: "€€€",
    tags: ["Trendy"],
    image:
      "https://images.unsplash.com/photo-1544227673-3112b3221b79?q=80&w=200&auto=format&fit=crop",
    rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "b4",
    name: "Wu",
    subtitle: "Bodrum, Turkey",
    city: "Bodrum",
    type: "Restaurant",
    price: "€€",
    tags: ["Trendy"],
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200&auto=format&fit=crop",
    rating: { food: 4.0, service: 4.0, vibe: 4.5, totalVotes: 100 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "m1",
    name: "Amazonico",
    subtitle: "Monte-Carlo, Monaco",
    city: "Monaco",
    type: "Restaurant",
    isEditorsChoice: false,
    price: "€€€€",
    tags: ["Latin American fusion", "Trendy"],
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop",
    rating: { food: 4.6, service: 4.5, vibe: 4.9, totalVotes: 850 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "m2",
    name: "Cipriani",
    subtitle: "Monte-Carlo, Monaco",
    city: "Monaco",
    type: "Restaurant",
    isEditorsChoice: false,
    price: "€€€€",
    tags: ["Italian", "Smart Elegant"],
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=500&auto=format&fit=crop",
    rating: { food: 4.5, service: 4.7, vibe: 4.3, totalVotes: 620 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "m3",
    name: "Hotel de Paris Monte-Carlo",
    subtitle: "Pl. du Casino, Monaco",
    city: "Monaco",
    type: "Hotel",
    isEditorsChoice: true,
    price: "€€€€",
    tags: ["5-star hotel", "Luxury"],
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop",
    rating: { food: 4.8, service: 4.9, vibe: 5.0, totalVotes: 2100 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "m4",
    name: "Niwaki",
    subtitle: "Monte-Carlo, Monaco",
    city: "Monaco",
    type: "Restaurant",
    isEditorsChoice: false,
    price: "€€€",
    tags: ["Japanese", "Sushi"],
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop",
    rating: { food: 4.7, service: 4.6, vibe: 4.5, totalVotes: 500 },
    galleries: { view: [], table: [], food: [] },
  },
  {
    id: "m5",
    name: "Monte-Carlo Beach",
    subtitle: "Roquebrune-Cap-Martin",
    city: "Monaco",
    type: "Hotel",
    isEditorsChoice: false,
    price: "€€€€",
    tags: ["5-star hotel", "Beachfront"],
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=500&auto=format&fit=crop",
    rating: { food: 4.4, service: 4.6, vibe: 4.8, totalVotes: 980 },
    galleries: { view: [], table: [], food: [] },
  },
];

const MOCK_COMING_SOON = [
  {
    id: "cs_1",
    name: "Gaia Bodrum",
    subtitle: "Bodrum, Turkey",
    image:
      "https://images.unsplash.com/photo-1515238152791-8225bf064fe5?q=80&w=1000&auto=format&fit=crop",
    opening: "Summer 2026",
  },
  {
    id: "cs_2",
    name: "Gaia St. Tropez",
    subtitle: "St. Tropez, France",
    image:
      "https://images.unsplash.com/photo-1533682805518-48d1f5a8cb6b?q=80&w=1000&auto=format&fit=crop",
    opening: "Summer 2026",
  },
];

// --- MAIN APP COMPONENT ---
export default function LocaVibesApp() {
  const [currentView, setCurrentView] = useState("home");
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeCityObj, setActiveCityObj] = useState(null);
  const [previousView, setPreviousView] = useState("home");
  const [toast, setToast] = useState(null);

  // State for Multiple Saved Lists
  const [savedLists, setSavedLists] = useState([
    { id: "l1", name: "Girls Bodrum 🌸", spots: ["b1", "b2", "spot_3"] },
    { id: "l2", name: "Cannes with Hubby 🥂", spots: ["spot_2"] },
    { id: "l3", name: "Ibiza 2026 🌴", spots: ["spot_1"] },
  ]);
  const [saveModalSpot, setSaveModalSpot] = useState(null);

  // All unique spot IDs from all lists to color the hearts
  const allSavedSpotIds = Array.from(
    new Set(savedLists.flatMap((l) => l.spots))
  );

  const handleToggleSpotInList = (listId, spotId) => {
    setSavedLists((prev) =>
      prev.map((list) => {
        if (list.id === listId) {
          const hasSpot = list.spots.includes(spotId);
          return {
            ...list,
            spots: hasSpot
              ? list.spots.filter((id) => id !== spotId)
              : [...list.spots, spotId],
          };
        }
        return list;
      })
    );
  };

  const handleCreateList = (name, spotId) => {
    const newList = { id: "list_" + Date.now(), name, spots: [spotId] };
    setSavedLists((prev) => [...prev, newList]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setToast({
        title: "📍 You're nearby!",
        message: "You're 200m away from Oceanic Beach Club! Tap to view.",
      });
      setTimeout(() => setToast(null), 5000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const navigateToSpot = (spot) => {
    setPreviousView(currentView);
    setActiveSpot(spot);
    setCurrentView("detail");
  };

  const navigateToCityDetail = (city) => {
    setActiveCityObj(city);
    setCurrentView("city_detail");
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] font-sans text-gray-800 selection:bg-pink-300">
      {/* Views */}
      {currentView === "home" && (
        <HomeFeed
          onSelectSpot={navigateToSpot}
          allSavedSpotIds={allSavedSpotIds}
          onSaveClick={setSaveModalSpot}
        />
      )}
      {currentView === "all_cities" && (
        <AllCitiesView onSelectCity={navigateToCityDetail} />
      )}
      {currentView === "city_detail" && (
        <CityDetailView
          city={activeCityObj}
          onSelectSpot={navigateToSpot}
          onBack={() => setCurrentView("all_cities")}
          allSavedSpotIds={allSavedSpotIds}
          onSaveClick={setSaveModalSpot}
        />
      )}
      {currentView === "detail" && (
        <SpotDetail
          spot={activeSpot}
          onBack={() => setCurrentView(previousView)}
          onHaveBeenClick={() => setCurrentView("have_been")}
          isSaved={allSavedSpotIds.includes(activeSpot?.id)}
          onSaveClick={() => setSaveModalSpot(activeSpot)}
        />
      )}
      {currentView === "admin" && (
        <AdminDashboard onBack={() => setCurrentView("profile")} />
      )}
      {currentView === "saved" && (
        <SavedView
          lists={savedLists}
          allSpots={MOCK_SPOTS}
          onSelectSpot={navigateToSpot}
          allSavedSpotIds={allSavedSpotIds}
          onSaveClick={setSaveModalSpot}
        />
      )}
      {currentView === "profile" && (
        <ProfileView onAdminClick={() => setCurrentView("admin")} />
      )}
      {currentView === "have_been" && (
        <HaveBeenView
          spot={activeSpot}
          onBack={() => setCurrentView("detail")}
          onSubmit={() => {
            setCurrentView("detail");
            setToast({
              title: "Feedback saved!",
              message: "Thank you for sharing your experience.",
            });
            setTimeout(() => setToast(null), 4000);
          }}
        />
      )}

      {/* Save Modal Overaly */}
      <SaveModal
        spot={saveModalSpot}
        lists={savedLists}
        onClose={() => setSaveModalSpot(null)}
        onToggleInList={handleToggleSpotInList}
        onCreateList={handleCreateList}
      />

      {/* Proximity Toast Notification */}
      {toast && (
        <div className="fixed top-12 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-5">
          <div className="bg-white/90 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl flex items-start gap-3 cursor-pointer">
            <div className="bg-[#FFD1DC]/50 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm">{toast.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/50 pb-safe pt-3 px-6 pb-4 z-40">
        <div className="flex justify-between items-center max-w-md mx-auto text-gray-400">
          <button
            onClick={() => setCurrentView("home")}
            className={`flex flex-col items-center gap-1 ${
              currentView === "home" ? "text-gray-900" : ""
            }`}
          >
            <Compass className="w-6 h-6" />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          <button
            onClick={() => setCurrentView("all_cities")}
            className={`flex flex-col items-center gap-1 ${
              currentView === "all_cities" || currentView === "city_detail"
                ? "text-gray-900"
                : "hover:text-gray-600 transition-colors"
            }`}
          >
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px] font-medium">All</span>
          </button>
          <button
            onClick={() => setCurrentView("saved")}
            className={`flex flex-col items-center gap-1 ${
              currentView === "saved"
                ? "text-pink-500"
                : "hover:text-pink-400 transition-colors"
            } relative`}
          >
            <Heart
              className={`w-6 h-6 ${
                currentView === "saved" ? "fill-current" : ""
              }`}
            />
            <span className="text-[10px] font-medium">Saved</span>
            {allSavedSpotIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[9px] flex items-center justify-center font-bold rounded-full border-2 border-white">
                {allSavedSpotIds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentView("profile")}
            className={`flex flex-col items-center gap-1 ${
              currentView === "profile" || currentView === "admin"
                ? "text-gray-900"
                : ""
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full overflow-hidden ${
                currentView === "profile" || currentView === "admin"
                  ? "ring-2 ring-pink-500"
                  : "border-2 border-white"
              }`}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// --- HOME FEED COMPONENT ---
function HomeFeed({ onSelectSpot, allSavedSpotIds, onSaveClick }) {
  const [activeCity, setActiveCity] = useState("Global");
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="pb-24">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-gradient-to-b from-[#FFD1DC]/90 via-[#FFD1DC]/80 to-transparent backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black tracking-tighter text-pink-500">
            LocaVibes.
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white/50 rounded-full backdrop-blur-md border border-white shadow-sm hover:bg-white/80 transition-all"
          >
            <Filter className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCity === city
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white/50 text-gray-600 border border-white hover:bg-white/80"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white/60 backdrop-blur-xl border border-white rounded-2xl shadow-lg animate-in slide-in-from-top-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Vibe Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-medium border border-pink-200 cursor-pointer">
                🌸 Pink/Floral
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium border border-gray-200 cursor-pointer">
                🍸 Date Night
              </span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium border border-yellow-200 cursor-pointer">
                📸 Best View
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="px-5 space-y-6">
        <div className="flex bg-white/40 p-1 rounded-full border border-white/60 backdrop-blur-md w-max mx-auto shadow-sm">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-white shadow-sm text-pink-600"
                : "text-gray-500"
            }`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === "map"
                ? "bg-white shadow-sm text-pink-600"
                : "text-gray-500"
            }`}
          >
            <MapPin className="w-4 h-4" /> Map
          </button>
        </div>

        {viewMode === "map" ? (
          <div className="w-full h-[50vh] bg-blue-100 rounded-3xl border border-white shadow-inner flex items-center justify-center overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              alt="Map mock"
            />
            <div className="absolute bg-white px-4 py-2 rounded-full shadow-lg font-bold text-pink-600 animate-bounce">
              📍 Oceanic Beach Club
            </div>
          </div>
        ) : (
          <>
            {MOCK_SPOTS.filter((s) => s.isEditorsChoice).map((spot) => (
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
                The Top 10{" "}
                <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-orange-400 text-transparent bg-clip-text">
                  Worldwide
                </span>
              </h2>
              <div className="space-y-4">
                {MOCK_SPOTS.filter((s) => !s.isEditorsChoice).map(
                  (spot, index) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      rank={index + 2}
                      onClick={() => onSelectSpot(spot)}
                      isSaved={allSavedSpotIds.includes(spot.id)}
                      onSaveClick={() => onSaveClick(spot)}
                    />
                  )
                )}
              </div>
            </div>

            <div className="pt-8 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Coming Soon
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 no-scrollbar">
                {MOCK_COMING_SOON.map((spot) => (
                  <div
                    key={spot.id}
                    className="min-w-[240px] bg-white/60 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-lg opacity-90 grayscale-[20%] snap-center"
                  >
                    <div className="h-32 w-full relative">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900">
                          {spot.opening}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-gray-900">
                        {spot.name}
                      </h4>
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

// --- SAVED VIEW COMPONENT (MULTI-LIST) ---
function SavedView({
  lists,
  allSpots,
  onSelectSpot,
  onSaveClick,
  allSavedSpotIds,
}) {
  const [activeListId, setActiveListId] = useState(null);

  if (activeListId) {
    const list = lists.find((l) => l.id === activeListId);
    const spotsInList = allSpots.filter((s) => list.spots.includes(s.id));

    return (
      <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in slide-in-from-right-4">
        <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setActiveListId(null)}
              className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {spotsInList.length} spots in this list
          </span>
        </header>

        <div className="px-5 mt-2 space-y-4">
          {spotsInList.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onClick={() => onSelectSpot(spot)}
              isSaved={allSavedSpotIds.includes(spot.id)}
              onSaveClick={() => onSaveClick(spot)}
            />
          ))}
          {spotsInList.length === 0 && (
            <div className="text-center py-20 bg-white/40 rounded-3xl border border-white border-dashed">
              <Folder className="w-12 h-12 text-pink-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">
                This list is empty
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Add spots using the heart icon.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in fade-in">
      <header className="pt-12 px-5 pb-6 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md flex justify-between items-end">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Saved
        </h1>
        <span className="text-sm text-gray-500 font-medium pb-1">
          {lists.length} lists
        </span>
      </header>

      <div className="px-5 grid grid-cols-2 gap-4">
        {lists.map((list) => {
          const firstSpot = allSpots.find((s) => s.id === list.spots[0]);
          const coverImage = firstSpot
            ? firstSpot.image
            : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop";
          return (
            <div
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className="relative h-56 rounded-3xl overflow-hidden cursor-pointer shadow-sm group transform transition-transform active:scale-95"
            >
              <img
                src={coverImage}
                alt={list.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-sm font-bold leading-tight mb-1 truncate">
                  {list.name}
                </h2>
                <p className="text-xs text-white/80">
                  {list.spots.length} spots
                </p>
              </div>
            </div>
          );
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
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sophie L.</h1>
        <p className="text-sm text-pink-500 font-medium">@sophie_vibes</p>

        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">12</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Reviews
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">4</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Lists
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">89</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Upvotes
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 mt-8 space-y-3">
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 text-pink-500 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <span className="font-semibold text-gray-900">Edit Profile</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-semibold text-gray-900">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={onAdminClick}
          className="w-full flex items-center justify-between p-4 bg-gray-900 rounded-2xl shadow-sm hover:bg-gray-800 transition-all mt-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
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
  const overall = (
    (spot.rating.food + spot.rating.service + spot.rating.vibe) /
    3
  ).toFixed(1);

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white/60 backdrop-blur-xl border-2 cursor-pointer transition-transform active:scale-95 ${
        isSponsored
          ? "border-yellow-300 shadow-[0_10px_40px_rgba(253,224,71,0.3)]"
          : "border-white shadow-lg"
      } rounded-[2rem] overflow-hidden`}
    >
      {isSponsored && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1 shadow-lg">
          <Star className="w-3 h-3 fill-current" /> Editor's Choice
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSaveClick(spot);
        }}
        className={`absolute top-4 right-4 z-10 p-2 backdrop-blur-md rounded-full transition-colors ${
          isSaved
            ? "bg-pink-100 text-pink-500"
            : "bg-white/30 text-white hover:bg-white/50 hover:text-pink-500"
        }`}
      >
        <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
      </button>

      <div className="h-56 w-full overflow-hidden">
        <img
          src={spot.image}
          alt={spot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
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

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2 py-1 bg-white border border-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {spot.price}
          </span>
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-white/50 border border-gray-100 text-gray-600 rounded-lg text-[10px] font-medium shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- SPOT DETAIL COMPONENT ---
function SpotDetail({ spot, onBack, onHaveBeenClick, isSaved, onSaveClick }) {
  const [activeTab, setActiveTab] = useState("view");

  const [draftRating, setDraftRating] = useState({
    food: 0,
    service: 0,
    vibe: 0,
  });
  const [hasRated, setHasRated] = useState(false);

  const hasVoted =
    draftRating.food > 0 && draftRating.service > 0 && draftRating.vibe > 0;
  const draftOverall = hasVoted
    ? ((draftRating.food + draftRating.service + draftRating.vibe) / 3).toFixed(
        1
      )
    : 0;

  if (!spot) return null;

  return (
    <div className="min-h-screen bg-[#FFF9E3] pb-32 animate-in slide-in-from-right-8 duration-300">
      <div className="relative h-80 w-full">
        <img
          src={spot.image}
          alt={spot.name}
          className="w-full h-full object-cover rounded-b-[3rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-[3rem]"></div>

        <button
          onClick={onBack}
          className="absolute top-12 left-5 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => onSaveClick(spot)}
          className={`absolute top-12 right-5 p-3 backdrop-blur-md rounded-full transition-colors ${
            isSaved
              ? "bg-pink-100 text-pink-500"
              : "bg-white/20 text-white hover:bg-white/40"
          }`}
        >
          <Heart className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h1 className="text-3xl font-black tracking-tight">{spot.name}</h1>
          <p className="text-white/80 font-medium flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> {spot.subtitle}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-xl flex justify-around mb-6">
          <a
            href="#"
            className="flex flex-col items-center gap-1 text-pink-600 hover:text-pink-500"
          >
            <Instagram className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Instagram
            </span>
          </a>
          <a
            href="#"
            className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-500"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Address
            </span>
          </a>
          <a
            href="#"
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-gray-500"
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Website
            </span>
          </a>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="px-3 py-1.5 bg-white border border-white shadow-sm text-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider">
            {spot.price}
          </span>
          {spot.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-[#FFD1DC]/30 border border-[#FFD1DC] text-pink-800 rounded-xl text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <button className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl mb-4 shadow-lg hover:bg-gray-800 transition-colors">
          Book a table
        </button>

        <button
          onClick={onHaveBeenClick}
          className="w-full bg-white text-pink-600 border border-pink-200 font-bold text-lg py-4 rounded-2xl mb-8 shadow-sm hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" /> Have you been here?
        </button>

        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-6">Rate The Vibe</h2>

          {hasRated ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg">Thank you for your rating!</h3>
              <p className="text-sm text-gray-500 mb-4">
                You're helping the community.
              </p>
              <button
                onClick={() => setHasRated(false)}
                className="text-pink-600 text-sm font-semibold"
              >
                Edit rating
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <DiamondRatingRow
                label="Food"
                icon={<Utensils className="w-4 h-4" />}
                value={draftRating.food}
                onChange={(v) => setDraftRating({ ...draftRating, food: v })}
              />
              <DiamondRatingRow
                label="Service"
                icon={<Heart className="w-4 h-4" />}
                value={draftRating.service}
                onChange={(v) => setDraftRating({ ...draftRating, service: v })}
              />
              <DiamondRatingRow
                label="Vibe"
                icon={<Camera className="w-4 h-4" />}
                value={draftRating.vibe}
                onChange={(v) => setDraftRating({ ...draftRating, vibe: v })}
              />

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-6">
                <span className="text-sm font-bold text-gray-500">
                  Your Average
                </span>
                <div className="flex items-center gap-2">
                  <DiamondDisplay
                    score={parseFloat(draftOverall)}
                    size="w-5 h-5"
                  />
                </div>
              </div>
              <button
                onClick={() => setHasRated(true)}
                disabled={!hasVoted}
                className={`w-full font-bold py-3 rounded-xl shadow-md mt-6 transition-all ${
                  hasVoted
                    ? "bg-gradient-to-r from-pink-400 to-orange-400 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                Submit Vibe Check
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Visual Intelligence</h2>
          <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-2xl mb-4 border border-white shadow-sm">
            <TabButton
              active={activeTab === "view"}
              onClick={() => setActiveTab("view")}
              icon={<Camera className="w-4 h-4" />}
            >
              The View
            </TabButton>
            <TabButton
              active={activeTab === "table"}
              onClick={() => setActiveTab("table")}
              icon={<Armchair className="w-4 h-4" />}
            >
              Best Table
            </TabButton>
            <TabButton
              active={activeTab === "food"}
              onClick={() => setActiveTab("food")}
              icon={<Utensils className="w-4 h-4" />}
            >
              Food
            </TabButton>
          </div>

          <div className="space-y-4">
            {spot.galleries[activeTab]?.length > 0 ? (
              spot.galleries[activeTab].map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100"
                >
                  <div className="relative h-48 w-full mb-3 rounded-xl overflow-hidden group">
                    <img
                      src={photo.url}
                      alt="User submission"
                      className="w-full h-full object-cover"
                    />
                    {photo.time && (
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md">
                        {photo.time}
                      </span>
                    )}
                    <span className="absolute top-2 left-2 bg-blue-500/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified Location
                    </span>
                  </div>
                  <div className="px-2 pb-1 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        @{photo.author}
                      </p>
                      {photo.tip && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          "{photo.tip}"
                        </p>
                      )}
                    </div>
                    <button className="flex flex-col items-center justify-center gap-1 bg-pink-50 text-pink-600 px-3 py-1.5 rounded-xl hover:bg-pink-100 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-bold">{photo.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white/40 rounded-2xl border border-white border-dashed">
                <p className="text-gray-500 text-sm">
                  No photos here yet. Be the first!
                </p>
                <button className="mt-3 text-pink-500 font-semibold text-sm">
                  + Upload Photo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HAVE BEEN COMPONENT ---
function HaveBeenView({ spot, onBack, onSubmit }) {
  const [selectedVibes, setSelectedVibes] = useState([]);

  const restaurantOptions = [
    "Business",
    "Party",
    "Quiet",
    "Luxury",
    "Solo-friendly",
    "Group-friendly",
    "First date",
    "Anniversary/Romantic",
    "Vega/Vegan friendly",
    "Gluten-free",
    "Halal",
    "Kosher",
    "Great cocktails/Mocktails",
    "Fine dining",
    "Affordable luxury",
    "Instagrammable",
    "Worth the hype",
    "Worth the queue",
    "Unique presentation",
    "Food show",
    "Hidden gem",
    "Secret entrance",
    "Sunset view",
    "Golden hour spot",
    "Aesthetic interior",
    "Dresscode required",
    "Card only",
    "Cash only",
    "Hard to book",
  ];

  const beachclubOptions = [
    "Infinity pool",
    "Daybed rental required",
    "Sunset view",
    "Adults only",
    "Golden hour spot",
    "Aesthetic interior",
    "Dresscode required",
    "Card only",
    "Cash only",
    "Hard to book",
    "Party",
    "Quiet",
    "Solo-friendly",
    "Group-friendly",
    "Vega/Vegan friendly",
    "Gluten-free",
    "Halal",
    "Kosher",
    "Great cocktails/Mocktails",
    "Instagrammable",
    "Worth the hype",
    "Worth the queue",
    "Unique presentation",
    "Show",
    "Hidden gem",
    "DJ",
  ];

  const hotelOptions = [
    "View from bed",
    "Outdoor bathtub / Jacuzzi",
    "Private pool",
    "Aesthetic bathroom",
    "Boutique hotel",
    "Adults only",
    "All-inclusive luxury",
    "Rooftop pool",
    "Rooftop Bar",
    "Instagrammable lobby",
    "Spa & Wellness",
    "Day pass available",
    "Workation friendly",
    "Luxury",
    "Solo-friendly",
    "Group-friendly",
    "Anniversary/Romantic",
  ];

  let currentOptions = restaurantOptions;
  if (spot?.type === "Beach Club") currentOptions = beachclubOptions;
  if (spot?.type === "Hotel") currentOptions = hotelOptions;

  const toggleVibe = (vibe) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter((v) => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  if (!spot) return null;

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-32 animate-in slide-in-from-bottom-8 duration-300">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Your Experience</h1>
      </header>

      <div className="px-5 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-white">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4">
            <img
              src={spot.image}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-center font-bold text-xl mb-1 text-gray-900">
            {spot.name}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-8">
            What applied during your visit?
          </p>

          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {currentOptions.map((vibe) => {
              const isSelected = selectedVibes.includes(vibe);
              return (
                <button
                  key={vibe}
                  onClick={() => toggleVibe(vibe)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm border ${
                    isSelected
                      ? "bg-pink-500 text-white border-pink-500 shadow-md transform scale-105"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
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
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              selectedVibes.length > 0
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg transform hover:scale-[1.02]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Save my Vibes
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SAVE TO LIST MODAL COMPONENT ---
function SaveModal({ spot, lists, onClose, onToggleInList, onCreateList }) {
  const [newListName, setNewListName] = useState("");

  if (!spot) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-safe animate-in slide-in-from-bottom-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Save to list</h3>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <ChevronLeft className="w-5 h-5 -rotate-90" />
          </button>
        </div>

        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto no-scrollbar">
          {lists.map((list) => {
            const isSaved = list.spots.includes(spot.id);
            return (
              <button
                key={list.id}
                onClick={() => onToggleInList(list.id, spot.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                  isSaved
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isSaved
                        ? "bg-pink-100 text-pink-500"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Folder className="w-5 h-5" />
                  </div>
                  <span
                    className={`font-bold ${
                      isSaved ? "text-pink-700" : "text-gray-800"
                    }`}
                  >
                    {list.name}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    isSaved
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {isSaved && <Check className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New list name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 font-medium"
          />
          <button
            onClick={() => {
              if (newListName.trim()) {
                onCreateList(newListName.trim(), spot.id);
                setNewListName("");
              }
            }}
            disabled={!newListName.trim()}
            className="bg-gray-900 disabled:bg-gray-400 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Create
          </button>
        </div>
      </div>
    </div>
  );
}

// --- UI HELPERS ---

function DiamondRatingRow({ label, icon, value, onChange }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-semibold flex items-center gap-2 text-gray-700">
        {icon} {label}
      </span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((idx) => (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className="focus:outline-none transition-transform hover:scale-125 p-1"
          >
            <Gem
              className={`w-5 h-5 ${
                idx <= value ? "fill-pink-500 text-pink-500" : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function DiamondDisplay({ score, size = "w-3 h-3" }) {
  const full = Math.floor(score);
  const dec = score - full;
  const hasHalf = dec >= 0.3 && dec < 0.8;
  const hasRoundUp = dec >= 0.8;
  const totalFull = full + (hasRoundUp ? 1 : 0);

  return (
    <div className="flex gap-0.5" title={score.toFixed(1)}>
      {[1, 2, 3, 4, 5].map((idx) => {
        if (idx <= totalFull)
          return (
            <Gem key={idx} className={`${size} fill-pink-500 text-pink-500`} />
          );
        if (idx === totalFull + 1 && hasHalf)
          return (
            <Gem key={idx} className={`${size} fill-pink-300 text-pink-300`} />
          );
        return <Gem key={idx} className={`${size} text-gray-200`} />;
      })}
    </div>
  );
}

function TabButton({ children, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
        active
          ? "bg-white text-pink-600 shadow-sm"
          : "text-gray-500 hover:bg-white/50"
      }`}
    >
      {icon} {children}
    </button>
  );
}

// --- ADMIN DASHBOARD COMPONENT (MOCK) ---
function AdminDashboard({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-32 animate-in fade-in">
      <header className="bg-gray-900 text-white p-5 pt-12 sticky top-0 z-10 flex items-center gap-4 shadow-lg">
        <button
          onClick={onBack}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Admin Moderation</h1>
      </header>

      <div className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
          Pending Submissions
        </h2>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-1 rounded-md mb-2 inline-block">
                New City Request
              </span>
              <h3 className="font-bold">Bali, Indonesia</h3>
              <p className="text-xs text-gray-500">Submitted by @TravelGuru</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="flex-1 bg-green-500 text-white font-bold py-2 rounded-xl text-sm hover:bg-green-600">
              Publish
            </button>
            <button className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl text-sm hover:bg-gray-200">
              Reject
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-md mb-2 inline-block">
                Photo Upload
              </span>
              <h3 className="font-bold">The View @ Lumière Rooftop</h3>
              <p className="text-xs text-gray-500">EXIF data verified.</p>
            </div>
          </div>
          <div className="h-32 bg-gray-100 rounded-xl overflow-hidden mb-3">
            <img
              src="https://images.unsplash.com/photo-1582650570392-809ab43f0be7?q=80&w=500&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="pending"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 text-white font-bold py-2 rounded-xl text-sm hover:bg-green-600">
              Approve
            </button>
            <button className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-xl text-sm hover:bg-gray-200">
              Reject
            </button>
          </div>
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          All Cities
        </h1>
        <span className="text-sm text-gray-500 font-medium pb-1">
          {totalSpots} spots
        </span>
      </header>

      <div className="px-5 grid grid-cols-2 gap-4">
        {MOCK_CITIES.map((city) => (
          <div
            key={city.id}
            onClick={() => onSelectCity(city)}
            className="relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm group transform transition-transform active:scale-95"
          >
            <img
              src={city.image}
              alt={city.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
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
function CityDetailView({
  city,
  onSelectSpot,
  onBack,
  allSavedSpotIds,
  onSaveClick,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Restaurant", "Lunch", "Breakfast", "Club", "Hotel"];

  const citySpots = MOCK_SPOTS.filter((s) => s.city === city?.name);

  const filteredSpots =
    activeFilter === "All"
      ? citySpots
      : citySpots.filter((s) => s.type === activeFilter);

  return (
    <div className="min-h-screen bg-[#FFF0F5] pb-24 animate-in slide-in-from-right-4">
      <header className="pt-12 px-5 pb-4 sticky top-0 z-40 bg-[#FFF0F5]/90 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{city?.name}</h1>
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {city?.count} results
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                activeFilter === filter
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
              }`}
            >
              {filter === "All" && <LayoutGrid className="w-4 h-4" />}
              {filter === "Restaurant" && <Utensils className="w-4 h-4" />}
              {filter === "Lunch" && <Utensils className="w-4 h-4" />}
              {filter}
            </button>
          ))}
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
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {spot.name}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                  <Utensils className="w-3.5 h-3.5" /> {spot.type}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveClick(spot);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isSaved
                    ? "text-pink-500 bg-pink-50"
                    : "text-gray-300 hover:text-pink-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>
          );
        })}
        {filteredSpots.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No spots found for this filter in {city?.name}.
          </div>
        )}
      </div>
    </div>
  );
}
