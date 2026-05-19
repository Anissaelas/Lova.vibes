import React, { useState, useEffect } from 'react';
import { 
    Compass, LayoutGrid, Heart, User, MapPin, Flame, ChevronLeft, 
    Search, Plus, ArrowLeft, Camera, Utensils, Armchair, 
    CalendarDays, ShieldCheck, CheckCircle, Upload
} from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';

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
    ]
};

// --- MAIN APP COMPONENT ---
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
            {view === 'all' && <AllCitiesView spots={spots} onSelectCity={(c) => { setActiveCity(c); setView('city_spots'); }} />}
            {view === 'city_spots' && <CityDetailView spots={spots} city={activeCity} onSelect={(s) => { setActiveSpot(s); setView('detail'); }} onBack={() => setView('all')} />}
            {view === 'detail' && <SpotDetailView spot={activeSpot} onBack={() => setView('home')} onReview={() => setView('review')} />}
            {view === 'review' && <ReviewSubmissionView spot={activeSpot} onBack={() => setView('detail')} onDone={() => { fetchSpots(); setView('detail'); }} />}
            {view === 'saved' && <MyListsView user={user} spots={spots} />}
            {view === 'profile' && <ProfileView onRefresh={fetchSpots} />}

            {/* BOTTOM NAVIGATION */}
            <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-pink-100 p-4 flex justify-around z-50 shadow-[0_-5px_15px_-3px_rgba(255,20,147,0.1)]">
                <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-[#FF1493]' : 'text-gray-400'}`}>
                    <Compass size={24} />
                </button>
                <button onClick={() => setView('all')} className={`flex flex-col items-center gap-1 ${view === 'all' || view === 'city_spots' ? 'text-[#FF1493]' : 'text-gray-400'}`}>
                    <LayoutGrid size={24} />
                </button>
                <button onClick={() => setView('saved')} className={`flex flex-col items-center gap-1 relative ${view === 'saved' ? 'text-[#FF1493]' : 'text-gray-400'}`}>
                    <Heart size={24} />
                    <span className="absolute -top-1 -right-1 bg-[#FF1493] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">+</span>
                </button>
                <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-[#FF1493]' : 'text-gray-400'}`}>
                    <User size={24} />
                </button>
            </nav>
        </div>
    );
}

// --- SCREEN 1: HOME VIEW ---
function HomeView({ spots, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Editor's Choice Mock (Zou uit database kunnen komen o.b.v. een boolean)
    const editorsChoice = spots.find(s => s.isEditorsChoice) || spots[0]; 
    const top10 = [...spots].sort((a,b) => ((b.rating?.vibe || 0) - (a.rating?.vibe || 0))).slice(0,10);
    const justOpened = spots.filter(s => s.status === 'just_opened');
    
    return (
        <div className="p-5 max-w-md mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-black bg-gradient-to-r from-[#FF1493] to-orange-400 bg-clip-text text-transparent">LOQA.</h1>
                <div className="flex gap-3 text-[#FF1493]">
                    <Search size={22} />
                    <CalendarDays size={22} />
                    <ShieldCheck size={22} />
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <input 
                    type="text" 
                    placeholder="Search places, cities, cuisines or filters..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm bg-white font-medium text-sm"
                />
                <Search size={18} className="absolute left-4 top-4 text-gray-400" />
            </div>

            {/* Editor's Choice */}
            {editorsChoice && (
                <div className="mb-8" onClick={() => onSelect(editorsChoice)}>
                    <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
                        <img src={editorsChoice.image || 'https://images.unsplash.com/photo-1544227673-3112b3221b79'} className="w-full h-full object-cover" alt="Editor's Choice" />
                        <div className="absolute top-4 left-4 bg-[#FF1493] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                            Editor's Choice
                        </div>
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

            {/* Top 10 Global */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">De Top 10 Wereldwijd</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {top10.map((s, idx) => (
                        <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm cursor-pointer border border-pink-50">
                            <div className="relative h-28 bg-gray-100 rounded-xl mb-2 overflow-hidden">
                                <img src={s.image} className="w-full h-full object-cover" alt={s.name} />
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-black px-2 py-0.5 rounded-full">#{idx + 1}</div>
                            </div>
                            <p className="font-bold text-sm truncate">{s.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{s.city}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Just Opened / Coming Soon */}
            <div className="mb-4">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Just Opened</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {justOpened.map(s => (
                        <div key={s.id} onClick={() => onSelect(s)} className="min-w-[140px] bg-white p-2 rounded-2xl shadow-sm cursor-pointer border border-pink-50">
                            <div className="h-28 bg-gray-100 rounded-xl mb-2 overflow-hidden">
                                <img src={s.image} className="w-full h-full object-cover" alt={s.name} />
                            </div>
                            <p className="font-bold text-sm truncate">{s.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- SCREEN 2: ALL PLACES VIEW (CITIES) ---
function AllCitiesView({ spots, onSelectCity }) {
    // Dynamisch steden en hun tellingen groeperen
    const cityCounts = spots.reduce((acc, spot) => {
        if (spot.city) {
            acc[spot.city] = (acc[spot.city] || 0) + 1;
        }
        return acc;
    }, {});
    
    const cities = Object.entries(cityCounts).map(([name, count]) => ({ name, count }));

    return (
        <div className="p-5 max-w-md mx-auto">
            <h1 className="text-3xl font-black mb-6">All Cities</h1>
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

// --- SCREEN 3: CITY DETAIL VIEW ---
function CityDetailView({ spots, city, onSelect, onBack }) {
    const [filter, setFilter] = useState('Alles');
    const filters = ['Alles', 'Restaurant', 'Hotel', 'Beach Club'];
    
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

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {filters.map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)} 
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-[#FF1493] text-white shadow-md' : 'bg-white text-gray-600 shadow-sm border border-gray-100'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List Layout met Vergevingsgezinde Linkjes */}
            <div className="space-y-4">
                {filteredSpots.map(s => {
                    // SLIMME CHECK: Zoek naar verschillende schrijfwijzen in jouw Firebase
                    const insta = s.instagramUrl || s.instagram || s.Instagram;
                    const web = s.websiteUrl || s.website || s.Website || s.url;
                    const map = s.addressUrl || s.address || s.Location || s.locatie;

                    return (
                        <div key={s.id} onClick={() => onSelect(s)} className="bg-white p-3 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                <img src={s.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt={s.name} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">{s.name}</h3>
                                <p className="text-xs text-gray-500 font-semibold mb-2">{s.type}</p>
                                
                                {/* Linkjes */}
                                <div className="flex gap-2">
                                    {insta && (
                                        <a href={insta} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-pink-50 text-[#FF1493] px-2 py-1 rounded text-[10px] font-bold hover:bg-pink-100">
                                            IG
                                        </a>
                                    )}
                                    {web && (
                                        <a href={web} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-200">
                                            WEB
                                        </a>
                                    )}
                                    {map && (
                                        <a href={map} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-gray-200">
                                            MAP
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-pink-50 p-2 rounded-full text-[#FF1493] shrink-0">
                                <Flame size={16} className="fill-current" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- SCREEN 4: SPOT DETAIL VIEW ---
function SpotDetailView({ spot, onBack, onReview }) {
    if (!spot) return null;

    // Haal de top 3 tags uit de array
    const topTags = (spot.tags || []).slice(0, 3);
    
    // Bereken gemiddelde score
    const avgScore = spot.rating ? ((spot.rating.food + spot.rating.service + spot.rating.vibe) / 3).toFixed(1) : "5.0";

    const [activePhotoTab, setActivePhotoTab] = useState('view');

    return (
        <div className="max-w-md mx-auto pb-6">
            {/* Hero Image */}
            <div className="relative h-80 rounded-b-3xl overflow-hidden shadow-sm">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button onClick={onBack} className="absolute top-6 left-5 p-2.5 bg-white/30 backdrop-blur-md rounded-full shadow-md"><ChevronLeft className="w-5 h-5 text-white" /></button>
                <button className="absolute top-6 right-5 p-2.5 bg-white/30 backdrop-blur-md rounded-full shadow-md"><Heart className="w-5 h-5 text-white" /></button>
                
                <div className="absolute bottom-6 left-5 right-5 text-white">
                    <h1 className="text-3xl font-black">{spot.name}</h1>
                    <p className="text-sm font-medium flex items-center gap-1 mt-1"><MapPin size={14} /> {spot.city} • {spot.type}</p>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Have you been Button */}
                <button onClick={onReview} className="w-full bg-gradient-to-r from-[#FF1493] to-orange-400 text-white font-black py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-transform">
                    <Flame size={20} className="fill-white" /> HAVE YOU BEEN? GIVE YOUR REVIEW
                </button>

                {/* Rating Section */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Overall Vibe Score</p>
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(n => <Flame key={n} size={24} className={Math.floor(avgScore) >= n ? "text-[#FF1493] fill-[#FF1493]" : "text-gray-300"} />)}
                            <span className="text-2xl font-black text-gray-900 ml-2">{avgScore}</span>
                        </div>
                    </div>
                </div>

                {/* Top 3 Tags */}
                {topTags.length > 0 && (
                    <div>
                        <p className="text-sm font-bold text-gray-900 mb-2">The Vibe:</p>
                        <div className="flex flex-wrap gap-2">
                            {topTags.map(tag => (
                                <span key={tag} className="bg-pink-100 text-[#FF1493] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visuele Intelligentie */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Visuele Intelligentie</h3>
                    <div className="flex gap-2 mb-4 bg-gray-50 p-1 rounded-xl">
                        {[
                            { id: 'view', label: 'The View' },
                            { id: 'interior', label: 'Interior & Table' },
                            { id: 'food', label: 'Food' }
                        ].map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActivePhotoTab(tab.id)} 
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activePhotoTab === tab.id ? 'bg-[#FF1493] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {/* Dummy Images for Visual Intelligence */}
                        <div className="relative h-48 bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-200">
                             <img src={spot.image} className="w-full h-full object-cover opacity-90" alt="Gallery item" />
                             {activePhotoTab === 'view' && (
                                 <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                     Tijdstip: 19:30 | Datum: 19-05-2026
                                 </div>
                             )}
                             {activePhotoTab === 'food' && (
                                 <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                     Signature Truffle Pasta
                                 </div>
                             )}
                             <button className="absolute bottom-3 right-3 bg-white/90 text-[#FF1493] px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                                 👍 124
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SCREEN 5: REVIEW SUBMISSION VIEW ---
function ReviewSubmissionView({ spot, onBack, onDone }) {
    const [foodRating, setFoodRating] = useState(5);
    const [serviceRating, setServiceRating] = useState(5);
    const [vibeRating, setVibeRating] = useState(5);
    const [selectedVibes, setSelectedVibes] = useState([]);
    
    // Select the right tags based on spot type
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
        <div className="p-5 max-w-md mx-auto space-y-6 pb-10">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20}/></button>
                <h1 className="text-xl font-black">Jouw Vibe Check: <br/><span className="text-[#FF1493]">{spot.name}</span></h1>
            </div>

            {/* Sliders Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
                <SliderRow label="Eten" value={foodRating} onChange={setFoodRating} />
                <SliderRow label="Service" value={serviceRating} onChange={setServiceRating} />
                <SliderRow label="Vibe" value={vibeRating} onChange={setVibeRating} />
            </div>

            {/* Vibes Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Welke vibes passen hierbij?</h3>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button 
                            key={tag} 
                            onClick={() => toggleVibe(tag)} 
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectedVibes.includes(tag) ? 'bg-[#FF1493] text-white border-[#FF1493] shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Photo Upload Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 mb-2">Deel je foto's</h3>
                
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <p className="text-xs font-bold mb-2">The View (optioneel)</p>
                    <div className="flex gap-2 mb-2">
                        <label className="flex-1 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center cursor-pointer text-[#FF1493]"><Upload size={16}/> <input type="file" className="hidden" /></label>
                        <input type="time" placeholder="Tijdstip" className="flex-1 text-xs p-2 rounded-xl border border-gray-200" />
                        <input type="date" placeholder="Datum" className="flex-1 text-xs p-2 rounded-xl border border-gray-200" />
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <p className="text-xs font-bold mb-2">The Interior & Table (optioneel)</p>
                    <div className="flex gap-2">
                        <label className="shrink-0 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center cursor-pointer text-[#FF1493]"><Upload size={16}/> <input type="file" className="hidden" /></label>
                        <input type="text" placeholder="Korte omschrijving..." className="w-full text-xs p-2 rounded-xl border border-gray-200" />
                    </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <p className="text-xs font-bold mb-2">Food (optioneel)</p>
                    <div className="flex gap-2">
                        <label className="shrink-0 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center cursor-pointer text-[#FF1493]"><Upload size={16}/> <input type="file" className="hidden" /></label>
                        <input type="text" placeholder="Naam van het gerecht" className="w-full text-xs p-2 rounded-xl border border-gray-200" />
                    </div>
                </div>
            </div>

            <button onClick={submitReview} className="w-full bg-[#222222] text-white font-black py-4 rounded-2xl shadow-xl mt-4">
                Plaats review
            </button>
        </div>
    );
}

// Helper Slider Component
function SliderRow({ label, value, onChange }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                <span>{label}</span>
                <span className="text-[#FF1493]">{value.toFixed(1)} / 5</span>
            </div>
            <input type="range" min="1" max="5" step="0.1" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full accent-[#FF1493]" />
            <div className="flex items-center justify-between px-2 pt-1">
                {[1, 2, 3, 4, 5].map(n => <Flame key={n} size={18} className={Math.floor(value) >= n ? 'text-[#FF1493] fill-[#FF1493]' : 'text-gray-200'} />)}
            </div>
        </div>
    );
}

// --- PROFILE VIEW ---
function ProfileView({ onRefresh }) {
    return (
        <div className="p-5 max-w-md mx-auto">
            <h2 className="text-3xl font-black mb-6">Profiel</h2>
            <button onClick={onRefresh} className="w-full bg-white p-4 rounded-xl font-bold border border-gray-200 shadow-sm mb-4">Ververs Firebase Data</button>
            <button onClick={() => signOut(auth)} className="w-full bg-red-500 text-white p-4 rounded-xl font-bold shadow-sm">Log uit</button>
        </div>
    );
}

// --- LOGIN SCREEN ---
function AuthScreen() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FFFEE0]">
            <h1 className="text-6xl font-black bg-gradient-to-r from-[#FF1493] to-orange-400 bg-clip-text text-transparent mb-2 tracking-tighter">LOQA</h1>
            <p className="text-lg font-bold text-gray-600 mb-10 tracking-widest uppercase">Access the vibes</p>
            
            <div className="w-full max-w-xs space-y-3">
                <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-2xl border-none shadow-sm bg-white font-medium focus:ring-2 focus:ring-[#FF1493]" />
                <input type="password" placeholder="Wachtwoord" onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-2xl border-none shadow-sm bg-white font-medium focus:ring-2 focus:ring-[#FF1493]" />
                <button onClick={() => signInWithEmailAndPassword(auth, email, password)} className="w-full bg-[#FF1493] text-white p-4 rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all mt-4">Inloggen</button>
            </div>
        </div>
    );
}
