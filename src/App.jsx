import React, { useState, useEffect } from 'react';
import { 
    Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, 
    Search, Plus, ArrowLeft, Camera, Utensils, Armchair, 
    CalendarDays, ShieldCheck, CheckCircle, Upload, Instagram, Globe, Trash2
} from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, updateDoc, doc, arrayUnion, query, where, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// --- FILTER TAGS PER CATEGORY ---
const TAGS_MAP = {
    'Restaurant': [
        'Business', 'Party', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 
        'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails/Mocktails', 'Fine dining', 'Affordable luxury', 
        'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 
        'Secret entrance', 'Sunset view', 'Golden hour spot', 'Aesthetic interior', 'Dresscode required', 'Card only', 
        'Cash only', 'Hard to book'
    ],
    'Hotel': [
        'View from bed', 'Outdoor bathtub / Jacuzzi', 'Private pool', 'Aesthetic bathroom', 'Boutique hotel', 
        'Adults only', 'All-inclusive luxury', 'Rooftop pool', 'Rooftop Bar', 'Instagrammable lobby', 
        'Spa & Wellness', 'Day pass available', 'Workation friendly'
    ],
    'Beach Club': [
        'Infinity pool', 'Daybed rental required', 'Sunset view', 'Adults only', 'Golden hour spot', 'Aesthetic interior', 
        'Dresscode required', 'Card only', 'Cash only', 'Hard to book', 'Party', 'Quiet', 'Solo-friendly', 'Group-friendly', 
        'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails/Mocktails', 'Instagrammable', 'Worth the hype', 
        'Worth the queue', 'Unique presentation', 'show', 'Hidden gem', 'DJ'
    ], // <--- DEZE KOMMA WAS HET PROBLEEM!
    'Lunch': [
        'Business', 'Quiet', 'Luxury', 'Solo-friendly', 'Group-friendly', 'First date', 'Anniversary/Romantic', 
        'Vega/Vegan friendly', 'Gluten-free', 'Halal', 'Great cocktails/Mocktails', 'Affordable luxury', 
        'Instagrammable', 'Worth the hype', 'Worth the queue', 'Unique presentation', 'Food show', 'Hidden gem', 
        'Secret entrance', 'Aesthetic interior', 'Dresscode required', 'Card only', 
        'Cash only', 'Hard to book'
    ]
};

export default function App() {
    const [user, setUser] = useState(null);
    const [spots, setSpots] = useState([]);
    const [view, setView] = useState('home'); 
    const [activeSpot, setActiveSpot] = useState(null);
    const [activeCity, setActiveCity] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (u) => { setUser(u); if (u) fetchSpots(); });
    }, []);

    const fetchSpots = async () => {
        try {
            const snapshot = await getDocs(collection(db, "spots"));
            setSpots(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Fout bij ophalen:", e);
        }
    };

    if (!user) return <AuthScreen />;

    return (
        <div className="min-h-screen bg-[#FFFEE0] pb-24 font-sans text-gray-900">
            {view === 'home' && <HomeView spots={spots} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} />}
            {view === 'all' && <AllCitiesView spots={spots} onSelectCity={(c) => { setActiveCity(c); setView('city_spots'); }} onAdd={() => setView('add')} />}
            {view === 'city_spots' && <CityDetailView spots={spots} city={activeCity} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} onBack={() => setView('all')} />}
            {view === 'add' && <AddSpotView onBack={() => setView('all')} onAdded={() => { fetchSpots(); setView('all'); }} />}
            {view === 'detail' && <SpotDetailView spot={activeSpot} user={user} onBack={() => setView('home')} onReview={() => setView('review')} />}
            {view === 'review' && <ReviewSubmissionView spot={activeSpot} onBack={() => setView('detail')} onDone={() => { fetchSpots(); setView('detail'); }} />}
            {view === 'saved' && <MyListsView user={user} spots={spots} onSelectSpot={(s) => { setActiveSpot(s); setView('detail'); }} />}
            {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

            <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-pink-100 p-4 flex justify-around z-50 shadow-[0_-5px_15px_-3px_rgba(255,20,147,0.1)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'}`}><Compass size={24} /></button>
                <button onClick={() => setView('all')} className={`flex flex-col items-center gap-1 ${view === 'all' || view === 'city_spots' || view === 'add' ? 'text-[#FF1493]' : 'text-gray-400'}`}><LayoutGrid size={24} /></button>
                <button onClick={() => setView('saved')} className={`flex flex-col items-center gap-1 relative ${view === 'saved' ? 'text-[#FF1493]' : 'text-gray-400'}`}>
                    <Heart size={24} />
                    <span className="absolute -top-1 -right-1 bg-[#FF1493] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">+</span>
                </button>
                <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'}`}><User size={24} /></button>
            </nav>
        </div>
    );
}

// --- SCREEN 1: HOME VIEW WITH ADVANCED MULTI-TAG SEARCH ---
function HomeView({ spots, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // De geavanceerde multi-tag zoeklogica
    const filteredSpots = spots.filter(s => {
        const queryStr = searchQuery.toLowerCase().trim();
        if (!queryStr) return false;

        // Slim splitsen: als er een komma staat splitsen we op komma, anders op spatie
        const pieces = queryStr.includes(',') ? queryStr.split(',') : queryStr.split(' ');
        
        // Maak de losse zoekwoorden schoon (spaties weghalen) en filter lege weg
        const terms = pieces.map(t => t.trim()).filter(t => t.length > 0);
        if (terms.length === 0) return false;

        // ALLES wat je intypt moet matchen (AND-combinatie)
        return terms.every(term => {
            const nameMatch = s.name?.toLowerCase().includes(term);
            const cityMatch = s.city?.toLowerCase().includes(term);
            const typeMatch = s.type?.toLowerCase().includes(term);
            const cuisineMatch = s.cuisine?.toLowerCase().includes(term);
            const tagsMatch = (s.tags || []).some(tag => tag.toLowerCase().includes(term));

            // Per term moet er minstens één veld kloppen
            return nameMatch || cityMatch || typeMatch || cuisineMatch || tagsMatch;
        });
    });
    
    const editorsChoice = spots.find(s => s.isEditorsChoice) || spots[0]; 
    const top10 = [...spots].sort((a,b) => ((b.rating?.vibe || 0) - (a.rating?.vibe || 0))).slice(0,10);
    const justOpened = spots.filter(s => s.status === 'just_opened');
    
    return (
        <div className="p-5 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-black bg-gradient-to-r from-[#FF1493] to-orange-400 bg-clip-text text-transparent">LOQA.</h1>
                <div className="flex gap-3 text-[#FF1493]">
                    <Search size={22} className="cursor-pointer" onClick={() => alert("Gebruik de zoekbalk hieronder om te zoeken.")} />
                    <CalendarDays size={22} className="cursor-pointer" onClick={() => alert("De Planning & Reserveringen functie wordt binnenkort toegevoegd!")} />
                    <ShieldCheck size={22} className="cursor-pointer" onClick={() => alert("Alleen LOQA-approved en geverifieerde plekken.")} />
                </div>
            </div>

            <div className="mb-6 relative">
                <input 
                    type="text" 
                    placeholder="Try: Greek, Bodrum or Luxury, Restaurant..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm bg-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FF1493]"
                />
                <Search size={18} className="absolute left-4 top-4 text-gray-400" />
            </div>

            {searchQuery ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Zoekresultaten ({filteredSpots.length})</h2>
                    <div className="space-y-3">
                        {filteredSpots.map(s => {
                            const avgScore = spot.rating ? ((Number(spot.rating.food) + Number(spot.rating.service) + Number(spot.rating.vibe)) / 3).toFixed(1) : "-";
                            return (
                                <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-3 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                        {s.image ? <img src={s.image} className="w-full h-full object-cover" alt="" /> : <span>Geen foto</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                                        <p className="text-xs text-gray-400 font-semibold mb-1">{s.type} • {s.city}</p>
                                        <div className="flex items-center gap-1 text-[#FF1493] text-xs font-bold">
                                            <span>★</span> {avgScore}
                                        </div>
                                    </div>
                                    <div className="text-[#FF1493]"><Flame size={16} className="fill-current" /></div>
                                </div>
                            );
                        })}
                        {filteredSpots.length === 0 && <p className="text-sm text-gray-400 italic text-center py-8">Geen plekken gevonden voor deze combinatie.</p>}
                    </div>
                </div>
            ) : (
                <>
                    {editorsChoice && (
                        <div className="mb-8" onClick={() => onSelect(editorsChoice)}>
                            <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
                                <img src={editorsChoice.image || 'https://images.unsplash.com/photo-1544227673-3112b3221b79'} className="w-full h-full object-cover" alt="Editor's Choice" />
                                <div className="absolute top-4 left-4 bg-[#FF1493] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">Editor's Choice</div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h2 className="text-2xl font-black">{editorsChoice.name}</h2>
                                    <p className="text-sm font-medium flex items-center gap-1 mb-2"><MapPin size={14} /> {editorsChoice.city} • {editorsChoice.type}</p>
                                    <div className="flex gap-2">
                                        {(editorsChoice.tags || []).slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-1 rounded-full font-bold">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">De Top 10 Wereldwijd</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {top10.map((s, idx) => (
                                <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm cursor-pointer border border-pink-50">
                                    <div className="relative h-28 bg-gray-100 rounded-xl mb-2 overflow-hidden">
                                        <img src={s.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt={s.name} />
                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-full">#{idx + 1}</div>
                                    </div>
                                    <p className="font-bold text-sm truncate">{s.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{s.city}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Just Opened</h2>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {justOpened.map(s => (
                                <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm cursor-pointer border border-pink-50">
                                    <div className="h-28 bg-gray-100 rounded-xl mb-2 overflow-hidden">
                                        <img src={s.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt={s.name} />
                                    </div>
                                    <p className="font-bold text-sm truncate">{s.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function AllCitiesView({ spots, onSelectCity, onAdd }) {
    // Veilige berekening: filtert plekken zonder stad eruit
    const cityCounts = spots.filter(s => s.city).reduce((acc, spot) => {
        acc[spot.city] = (acc[spot.city] || 0) + 1;
        return acc;
    }, {});
    
    const cities = Object.entries(cityCounts).map(([name, count]) => ({ name, count }));

    return (
        <div className="p-5 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-gray-900">All Cities</h1>
                <button onClick={onAdd} className="bg-black text-white p-2.5 rounded-2xl shadow-md transform hover:scale-105 active:scale-95 transition-all">
                    <Plus size={20} />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {cities.map(city => {
                    const sampleSpot = spots.find(s => s.city === city.name);
                    return (
                        <div key={city.name} onClick={() => onSelectCity(city.name)} className="relative h-48 bg-gray-200 rounded-3xl overflow-hidden cursor-pointer shadow-md group">
                            <img src={sampleSpot?.image || 'https://images.unsplash.com/photo-1519046904884-53103b34b206'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={city.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="font-black text-xl">{city.name}</h3>
                                <p className="text-xs font-medium opacity-90">{city.count} plekken</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
function CityDetailView({ spots, city, onSelect, onBack }) {
    const [filter, setFilter] = useState('Alles');
    const filters = ['Alles', 'Restaurant', 'Hotel', 'Beach Club', 'Lunch', 'Rooftop Bar', 'Café', 'Breakfast'];
    
    const citySpots = spots.filter(s => s.city === city);
    const filteredSpots = filter === 'Alles' ? citySpots : citySpots.filter(s => s.type === filter);

    return (
        <div className="p-5 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></button>
                <div>
                    <h1 className="text-2xl font-black">{city}</h1>
                    <p className="text-xs text-gray-500 font-bold">{citySpots.length} resultaten</p>
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-[#FF1493] text-white shadow-md' : 'bg-white text-gray-600 shadow-sm border border-gray-100'}`}>
                        {f}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                {filteredSpots.map(s => {
                    const avgScore = spot.rating ? ((Number(spot.rating.food) + Number(spot.rating.service) + Number(spot.rating.vibe)) / 3).toFixed(1) : "-";
                    return (
                        <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-3 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                {s.image ? <img src={s.image} className="w-full h-full object-cover" alt={s.name} /> : <span>Geen foto</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                                <p className="text-xs text-gray-500 font-semibold mb-1">{s.type}</p>
                                <div className="flex items-center gap-1 text-[#FF1493] text-xs font-bold"><span>★</span> {avgScore}</div>
                            </div>
                            <div className="bg-pink-50 p-2 rounded-full text-[#FF1493] shrink-0"><Flame size={16} className="fill-current" /></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- SCREEN 4: SPOT DETAIL VIEW ---
function SpotDetailView({ spot, user, onBack, onReview }) {
  if (!spot) return null;

  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState([]);
  
  // Nieuwe state voor de Foto Upload Modal
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  const openListModal = async () => {
    setShowListModal(true);
    try {
      const q = query(collection(db, "lists"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setUserLists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Fout bij ophalen van mappen:", e);
    }
  };

  const addSpotToList = async (listId) => {
    try {
      const listRef = doc(db, "lists", listId);
      await updateDoc(listRef, { spotIds: arrayUnion(spot.id) });
      alert("Plek succesvol toegevoegd aan de lijst!");
      setShowListModal(false);
    } catch (e) {
      console.error("Fout bij toevoegen aan lijst:", e);
      alert("Toevoegen mislukt.");
    }
  };

  // Functie om de nieuwe foto daadwerkelijk in Firebase op te slaan
  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl) return alert("Voeg in ieder geval een foto URL toe!");
    try {
        const spotRef = doc(db, "spots", spot.id);
        await updateDoc(spotRef, { 
            userPhotos: arrayUnion({ 
                url: newPhotoUrl, 
                caption: newPhotoCaption, 
                date: new Date().toISOString() 
            }) 
        });
        alert("Foto succesvol toegevoegd! (Ververs de app even om hem te zien)");
        setShowPhotoModal(false);
        setNewPhotoUrl('');
        setNewPhotoCaption('');
    } catch (error) {
        console.error("Fout bij uploaden:", error);
        alert("Uploaden mislukt.");
    }
  };

  const avgScore = spot.rating ? ((Number(spot.rating.food) + Number(spot.rating.service) + Number(spot.rating.vibe)) / 3).toFixed(1) : "-";
  const insta = spot.instagramUrl || spot.instagram || spot.Instagram;
  const web = spot.websiteUrl || spot.website || spot.Website || spot.url;
  const map = spot.addressUrl || spot.address || spot.Location || spot.locatie;

  return (
    <div className="max-w-md mx-auto p-5 space-y-4 pb-20">
      <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm mb-2"><ChevronLeft size={20} /></button>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-gray-900">{spot.name}</h1>
            <p className="text-sm text-gray-400 font-bold mt-1">{spot.type} • {spot.city}</p>
          </div>
          <div className="bg-black text-white px-3 py-1.5 rounded-full font-black text-sm flex items-center gap-1 shrink-0">
            <span>★</span> {avgScore}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {insta && <a href={insta} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-pink-50 text-[#FF1493] px-3 py-2 rounded-xl text-xs font-bold hover:bg-pink-100 transition-colors shadow-sm"><Instagram size={16} /> Instagram</a>}
          {web && <a href={web} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"><Globe size={16} /> Website</a>}
          {map && <a href={map} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm"><MapPin size={16} /> Locatie</a>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="bg-white border border-pink-200 text-[#FF1493] font-bold py-3.5 rounded-2xl shadow-sm text-center">Aanrader?</button>
        <button onClick={openListModal} className="bg-[#111827] text-white font-bold py-3.5 rounded-2xl shadow-sm text-center">Lijst</button>
      </div>

      {/* --- VERNIEUWDE FOTO CARD MET EIGEN MODAL --- */}
      <div className="bg-white p-5 rounded-3xl border border-pink-50 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-gray-900 text-sm">Foto's van anderen</h3>
          {/* Opent nu de Photo Modal in plaats van de Review View */}
          <button onClick={() => setShowPhotoModal(true)} className="text-[#FF1493] text-xs font-bold">Upload</button>
        </div>
        
        {/* Checken of er al userPhotos in Firebase staan */}
        {spot.userPhotos && spot.userPhotos.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto mt-3 pb-2 scrollbar-hide">
                {spot.userPhotos.map((p, idx) => (
                    <div key={idx} className="min-w-[100px] shrink-0">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <img src={p.url} className="w-full h-full object-cover" alt="User upload" />
                        </div>
                        {p.caption && <p className="text-[10px] text-gray-500 font-medium mt-1.5 truncate w-24">{p.caption}</p>}
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-xs text-gray-400 italic mt-1">Nog geen foto's. Wees de eerste.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {spot.cuisine && <span className="bg-white px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 border shadow-sm">{spot.cuisine}</span>}
        <span className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">★ Top Vibe</span>
      </div>
      
      {spot.dresscode && (
        <div className="bg-pink-50 text-[#FF1493] p-3 rounded-xl text-xs font-semibold border border-pink-100">
          Dresscode: {spot.dresscode}
        </div>
      )}

      {/* De orginele Review knop blijft hier staan */}
      <button onClick={onReview} className="w-full bg-[#FF1493] text-white font-black py-4 rounded-2xl shadow-md mt-4">
        HAVE YOU BEEN?
      </button>

      {/* MODAL: KIES EEN LIJST */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-gray-900">Voeg toe aan lijst</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userLists.map(list => (
                <button key={list.id} type="button" onClick={() => addSpotToList(list.id)} className="w-full text-left p-4 bg-gray-50 hover:bg-pink-50 rounded-xl font-bold text-sm transition-colors flex justify-between items-center">
                  <span>{list.name}</span><span className="text-xs text-gray-400 font-normal">{(list.spotIds || []).length} items</span>
                </button>
              ))}
              {userLists.length === 0 && <p className="text-xs text-gray-400 italic p-2">Je hebt nog geen mappen. Ga naar het Hartje-tabblad om een lijst te maken.</p>}
            </div>
            <button onClick={() => setShowListModal(false)} className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-xs">Sluiten</button>
          </div>
        </div>
      )}

      {/* MODAL: FOTO UPLOADEN */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black mb-4">Deel een foto</h3>
            <form onSubmit={handlePhotoUpload} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Foto URL (link naar afbeelding)</label>
                <input type="text" placeholder="https://..." value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 font-medium text-sm focus:ring-2 focus:ring-[#FF1493] outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Omschrijving</label>
                <input type="text" placeholder="Bijv. Geweldige zonsondergang hier!" value={newPhotoCaption} onChange={(e) => setNewPhotoCaption(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 font-medium text-sm focus:ring-2 focus:ring-[#FF1493] outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPhotoModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl text-sm">Annuleren</button>
                <button type="submit" className="flex-1 bg-[#FF1493] text-white font-black py-3 rounded-2xl text-sm">Uploaden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function ReviewSubmissionView({ spot, onBack, onDone }) {
    const [foodRating, setFoodRating] = useState(5);
    const [serviceRating, setServiceRating] = useState(5);
    const [vibeRating, setVibeRating] = useState(5);
    const [selectedVibes, setSelectedVibes] = useState([]);
    
    const availableTags = TAGS_MAP[spot.type] || TAGS_MAP['Restaurant'];

    const toggleVibe = (tag) => {
        setSelectedVibes(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const submitReview = async () => {
        if (!spot) return;
        const newRating = { food: foodRating, service: serviceRating, vibe: vibeRating };
        try {
            await updateDoc(doc(db, "spots", spot.id), {
                rating: newRating,
                tags: arrayUnion(...selectedVibes)
            });
            onDone();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-5 max-w-md mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20}/></button>
                <h1 className="text-xl font-black">Jouw Vibe Check: <br/><span className="text-[#FF1493]">{spot.name}</span></h1>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
                <SliderRow label="Eten" value={foodRating} onChange={setFoodRating} />
                <SliderRow label="Service" value={serviceRating} onChange={setServiceRating} />
                <SliderRow label="Vibe" value={vibeRating} onChange={setVibeRating} />
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Welke vibes passen hierbij?</h3>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button key={tag} onClick={() => toggleVibe(tag)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedVibes.includes(tag) ? 'bg-[#FF1493] text-white border-[#FF1493] shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={submitReview} className="w-full bg-[#222222] text-white font-black py-4 rounded-2xl shadow-xl mt-4">
                Plaats review
            </button>
        </div>
    );
}

function SliderRow({ label, value, onChange }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                <span>{label}</span><span className="text-[#FF1493]">{value.toFixed(1)} / 5</span>
            </div>
            <input type="range" min="1" max="5" step="0.1" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[#FF1493]" />
            <div className="flex items-center justify-between px-2 pt-1">
                {[1, 2, 3, 4, 5].map(n => <Flame key={n} size={18} className={Math.floor(value) >= n ? 'text-[#FF1493] fill-[#FF1493]' : 'text-gray-200'} />)}
            </div>
        </div>
    );
}

function MyListsView({ user, spots, onSelectSpot }) {
  const [lists, setLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState(null);

  useEffect(() => { if (user) fetchUserLists(); }, [user]);

  const fetchUserLists = async () => {
    try {
      const q = query(collection(db, "lists"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      setLists(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await addDoc(collection(db, "lists"), {
        name: newListName, userId: user.uid, spotIds: [], createdAt: new Date().toISOString()
      });
      setNewListName(''); setShowModal(false); fetchUserLists();
    } catch (e) { console.error(e); }
  };

  // NIEUW: Functie om een hele lijst te verwijderen
  const handleDeleteList = async (listId, listName, e) => {
    // Voorkom dat de lijst opent als je op de prullenbak klikt in het overzicht
    if (e) e.stopPropagation(); 
    
    const confirmDelete = window.confirm(`Weet je zeker dat je de lijst "${listName}" wilt verwijderen?`);
    if (!confirmDelete) return;

    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "lists", listId));
      alert("Lijst succesvol verwijderd!");
      setActiveList(null); // Als de lijst openstond, sluit hem
      fetchUserLists(); // Ververs het overzicht
    } catch (error) {
      console.error("Fout bij verwijderen:", error);
      alert("Verwijderen mislukt.");
    }
  };

  // Geselecteerde lijst detailweergave
  if (activeList) {
    const currentList = lists.find(l => l.id === activeList.id) || activeList;
    const savedSpots = spots.filter(s => currentList.spotIds?.includes(s.id));
    
    return (
      <div className="p-5 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setActiveList(null)} className="p-2 bg-white rounded-full shadow-sm">
            <ArrowLeft size={18}/>
          </button>
          {/* Prullenbak knop in de geopende lijst */}
          <button 
            onClick={(e) => handleDeleteList(currentList.id, currentList.name, e)} 
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-1">{currentList.name}</h2>
        <p className="text-xs text-gray-400 font-bold mb-6">{savedSpots.length} opgeslagen plekken</p>
        <div className="grid grid-cols-2 gap-4">
          {savedSpots.map(s => (
            <div key={s.id} onClick={() => onSelectSpot(s)} className="bg-white p-2 rounded-2xl border shadow-sm cursor-pointer">
              <div className="h-32 bg-gray-100 rounded-lg mb-2 overflow-hidden"><img src={s.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" /></div>
              <p className="font-bold text-sm truncate">{s.name}</p>
            </div>
          ))}
          {savedSpots.length === 0 && <p className="text-xs text-gray-400 italic col-span-2 text-center py-8">Deze lijst is nog leeg.</p>}
        </div>
      </div>
    );
  }

  // Hoofdoverzicht van alle mappen
  return (
    <div className="p-5 max-w-md mx-auto min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-gray-900">Mijn Lijsten</h2>
        <button onClick={() => setShowModal(true)} className="bg-[#FF1493] text-white p-2.5 rounded-2xl shadow-md"><Plus size={20} /></button>
      </div>
      {loading ? <p className="text-sm font-bold text-[#FF1493] text-center mt-10">Lijsten laden...</p> : lists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-pink-50 p-6 shadow-sm"><p className="text-sm text-gray-500 font-medium">Je hebt nog geen mappen.</p></div>
      ) : (
        <div className="space-y-3">
          {lists.map(list => (
            <div key={list.id} onClick={() => setActiveList(list)} className="bg-white p-5 rounded-2xl shadow-sm border border-pink-50 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow group">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{list.name}</h3>
                <p className="text-xs text-gray-400 font-semibold">{(list.spotIds || []).length} plekken</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Prullenbak icoon direct in het overzicht bij elke map */}
                <button 
                  onClick={(e) => handleDeleteList(list.id, list.name, e)} 
                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronLeft size={16} className="rotate-180 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-black mb-4">Nieuwe lijst maken</h3>
            <form onSubmit={handleCreateList} className="space-y-4">
              <input type="text" placeholder="Bijv. Brunch Spots..." value={newListName} onChange={(e) => setNewListName(e.target.value)} className="w-full p-4 rounded-2xl border bg-gray-50 font-medium text-sm" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl text-sm">Annuleren</button>
                <button type="submit" className="flex-1 bg-[#FF1493] text-white font-black py-3 rounded-2xl text-sm">Aanmaken</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileView({ onRefresh }) {
    return (
        <div className="p-5 max-w-md mx-auto">
            <h2 className="text-3xl font-black mb-6">Profiel</h2>
            <button onClick={onRefresh} className="w-full bg-white p-4 rounded-xl font-bold border border-gray-200 shadow-sm mb-4">Ververs Firebase Data</button>
            <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold shadow-sm">Log uit</button>
        </div>
    );
}

function AddSpotView({ onBack, onAdded }) {
  const [data, setData] = useState({ name: '', city: '', type: 'Restaurant', tags: [], image: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  const toggleTag = (tag) => {
      setData(prev => ({
          ...prev, 
          tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      }));
  };

  const save = async () => { 
      if (!data.name || !data.city) return alert("Vul in ieder geval een naam en stad in!");
      setIsSaving(true);
      try {
          await addDoc(collection(db, "spots"), data); 
          onAdded(); 
      } catch (e) {
          console.error(e);
          alert("Opslaan mislukt.");
      } finally {
          setIsSaving(false);
      }
  };
  
  return (
    <div className="p-5 pb-20 max-w-md mx-auto">
      <button onClick={onBack} className="mb-6 p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></button>
      <h2 className="text-3xl font-black mb-6 text-gray-900">Nieuwe plek</h2>
      
      <div className="space-y-4 mb-6">
          <input className="w-full p-4 rounded-2xl border bg-white shadow-sm font-medium focus:ring-2 focus:ring-[#FF1493] outline-none" placeholder="Naam van de plek (bijv. Zuma)" onChange={e => setData({...data, name: e.target.value})} />
          <input className="w-full p-4 rounded-2xl border bg-white shadow-sm font-medium focus:ring-2 focus:ring-[#FF1493] outline-none" placeholder="Stad (bijv. Bodrum)" onChange={e => setData({...data, city: e.target.value})} />
          <input className="w-full p-4 rounded-2xl border bg-white shadow-sm font-medium focus:ring-2 focus:ring-[#FF1493] outline-none" placeholder="Foto URL (bijv. https://...)" onChange={e => setData({...data, image: e.target.value})} />
          <select className="w-full p-4 rounded-2xl border bg-white shadow-sm font-bold focus:ring-2 focus:ring-[#FF1493] outline-none appearance-none" onChange={e => setData({...data, type: e.target.value, tags: []})}>
            <option value="Restaurant">Restaurant</option>
            <option value="Hotel">Hotel</option>
            <option value="Beach Club">Beach Club</option>
            <option value="Lunch">Lunch</option>
            <option value="Rooftop Bar">Rooftop Bar</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Café">Café</option>
          </select>
      </div>
      
      <p className="font-bold text-gray-900 mb-3">Vibe Filters</p>
      <div className="flex flex-wrap gap-2 mb-8">
          {(TAGS_MAP[data.type] || []).map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${data.tags.includes(t) ? 'bg-[#FF1493] text-white border-[#FF1493] shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {t}
              </button>
          ))}
      </div>
      <button onClick={save} disabled={isSaving} className="w-full bg-[#111827] text-white p-4 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all">
          {isSaving ? "Aan het opslaan..." : "Plek opslaan"}
      </button>
    </div>
  );
}

function AuthScreen() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false); 
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Account succesvol aangemaakt! Welkom bij LOQA.");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            setError(err.message.replace("Firebase: ", ""));
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFFEE0]">
            <h1 className="text-6xl font-black bg-gradient-to-r from-[#FF1493] to-orange-400 bg-clip-text text-transparent mb-2 tracking-tighter">LOQA</h1>
            <p className="text-lg font-bold text-gray-600 mb-10 tracking-widest uppercase">{isRegistering ? "Create an account" : "Access the vibes"}</p>
            
            <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
                {error && <div className="p-3 bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200">{error}</div>}
                <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-2xl border-none shadow-sm bg-white font-medium focus:ring-2 focus:ring-[#FF1493] focus:outline-none" />
                <input type="password" placeholder="Wachtwoord" required onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-2xl border-none shadow-sm bg-white font-medium focus:ring-2 focus:ring-[#FF1493] focus:outline-none" />
                <button type="submit" className="w-full bg-[#FF1493] text-white p-4 rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mt-4">
                    {isRegistering ? "Registreren" : "Inloggen"}
                </button>
                <div className="text-center pt-4">
                    <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-xs text-gray-500 font-bold hover:text-[#FF1493] transition-colors">
                        {isRegistering ? "Heb je al een account? Log in" : "Nog geen account? Registreer hier"}
                    </button>
                </div>
            </form>
        </div>
    );
}
