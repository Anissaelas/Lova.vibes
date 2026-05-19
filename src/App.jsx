import React, { useState, useEffect } from 'react';
import { Compass, MapPin, ExternalLink, Instagram, Globe, Camera, Utensils, Armchair, ChevronLeft, ThumbsUp, CheckCircle, Flame } from 'lucide-react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

// --- MOCK DATA ---
const TAGS_MAP = {
    'Restaurant': [
        { name: 'Romantisch', vibe: 'Romantic' },
        { name: 'Zakelijk', vibe: 'Business' },
        { name: 'Hip & Trendy', vibe: 'Trendy' },
        { name: 'Gezellig', vibe: 'Cozy' },
        { name: 'Luxe', vibe: 'Luxury' },
        { name: 'Vega/Vegan Vriendelijk', vibe: 'Vegan' },
        { name: 'Zeezicht', vibe: 'Sea View' },
        { name: 'Fijnproever', vibe: 'Fine Dining' },
        { name: 'Casual', vibe: 'Casual' },
        { name: 'Buiten eten', vibe: 'Outdoor' },
    ],
    // Voeg hier TAGS toe voor andere types zoals Beachclub/Hotel indien nodig
};

// --- MAIN APP ---
export default function LocaVibesApp() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [spots, setSpots] = useState([]);
    const [activeSpot, setActiveSpot] = useState(null);
    const [currentView, setCurrentView] = useState('feed'); // feed, detail, have_been
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchSpots();
            } else {
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const fetchSpots = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "spots"));
            const spotsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSpots(spotsData);
        } catch (error) {
            console.error("Fout bij ophalen spots: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Inlogfout: ", error);
            alert("Inloggen mislukt: " + error.message);
        }
    };

    const handleViewDetail = (spot) => {
        setActiveSpot(spot);
        setCurrentView('detail');
    };

    const handleBackToFeed = () => {
        setCurrentView('feed');
        setActiveSpot(null);
    };

    if (loading) {
        return <div className="min-h-screen bg-[#FFFEE0] flex items-center justify-center font-bold text-[#FF1493]">Laden...</div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#FFFEE0] flex flex-col items-center justify-center p-6">
                <h1 className="text-4xl font-black text-[#FF1493] mb-8">LOQA. Inloggen</h1>
                <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl border border-gray-100 bg-white shadow-inner" />
                    <input type="password" placeholder="Wachtwoord" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl border border-gray-100 bg-white shadow-inner" />
                    <button type="submit" className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold shadow-md transform hover:scale-[1.02] transition-transform">Log in</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFEE0] pb-24">
            {currentView === 'feed' && <Feed spots={spots} onViewDetail={handleViewDetail} />}
            {currentView === 'detail' && <SpotDetail spot={activeSpot} onBack={handleBackToFeed} onHaveBeenClick={() => setCurrentView('have_been')} />}
            {currentView === 'have_been' && <HaveBeenView spot={activeSpot} onBack={() => setCurrentView('detail')} onReviewSubmit={() => {setCurrentView('detail'); fetchSpots(); }} />}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.03)]">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto text-[#FF1493]">
                    <button onClick={handleBackToFeed}><Compass className="w-6 h-6" /></button>
                    <button className="flex items-center gap-1"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF1493] to-[#FF8C00]" /></button>
                </div>
            </nav>
        </div>
    );
}

// --- FEED VIEW ---
function Feed({ spots, onViewDetail }) {
    return (
        <div className="p-5 max-w-md mx-auto">
            <h1 className="text-4xl font-black text-[#FF1493] mb-8">LOQA.</h1>
            {spots.map((spot, index) => (
                <div key={index} className="mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-50 cursor-pointer transition-all hover:shadow-md" onClick={() => onViewDetail(spot)}>
                    <div className="relative h-52 rounded-2xl overflow-hidden mb-3">
                        <img src={spot.image} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full text-[#FF1493]">{spot.type}</div>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">{spot.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1"><MapPin size={14} className="text-[#FF1493]" /> {spot.city}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{spot.reviewSnippet}</p>
                    <div className="flex items-center gap-1 mt-3">
                        {[1, 2, 3, 4].map(n => <Flame key={n} size={16} className="text-[#FF1493] fill-[#FF1493]" />)}
                        {[1].map(n => <Flame key={n} size={16} className="text-gray-300 fill-gray-100" />)}
                        <span className="text-sm font-bold text-gray-900 ml-1">4.0 Vibe Score</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- SPOT DETAIL VIEW ---
function SpotDetail({ spot, onBack, onHaveBeenClick }) {
    const cuisineTag = spot.cuisine ? { name: spot.cuisine, vibe: spot.cuisine.toLowerCase() } : null;
    const allTags = [...(cuisineTag ? [cuisineTag] : []), ...(TAGS_MAP[spot.type] || [])];

    return (
        <div className="max-w-md mx-auto">
            <div className="relative h-64">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                <button onClick={onBack} className="absolute top-4 left-4 p-2.5 bg-white/30 backdrop-blur-md rounded-full shadow-md"><ChevronLeft className="w-5 h-5 text-white" /></button>
            </div>
            <div className="p-5 space-y-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-black text-gray-900 truncate">{spot.name}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={14} className="text-[#FF1493]" /> {spot.city}</p>
                    </div>
                    <div className="bg-[#FF1493] text-white px-3 py-1 rounded-full font-bold text-sm shrink-0 flex items-center gap-1.5 shadow-sm"><Flame size={16} className="fill-white" /> {((spot.rating?.food + spot.rating?.service + spot.rating?.vibe)/3).toFixed(1)}</div>
                </div>

                {/* Vibe Tags */}
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                        <div key={tag.vibe} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-[#FF1493] bg-[#FFE0E0] border border-[#FFD0D0]">
                            <Flame size={14} className="text-[#FF1493]" /> {tag.name}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    {spot.instagramUrl && <a href={spot.instagramUrl} target="_blank" className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-inner flex flex-col items-center gap-1.5 text-xs text-[#FF1493] font-semibold"><Instagram size={20}/> Instagram</a>}
                    {spot.websiteUrl && <a href={spot.websiteUrl} target="_blank" className="flex-1 bg-white p-4 rounded-xl border border-gray-100 shadow-inner flex flex-col items-center gap-1.5 text-xs text-[#FF1493] font-semibold"><Globe size={20}/> Website</a>}
                </div>

                <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transform hover:scale-[1.01] transition-transform"><ExternalLink size={18} /> Reserveer via Website</button>

                {/* HAVE YOU BEEN? BUTTON */}
                <button onClick={onHaveBeenClick} className="w-full bg-white border-2 border-[#FFD0D0] text-[#FF1493] font-black py-3 rounded-2xl flex items-center justify-center gap-2 transform hover:scale-[1.01] hover:bg-[#FFE0E0] transition-all"> <Flame size={18} /> HAVE YOU BEEN? GIVE YOUR REVIEW</button>

                {/* Visuele Intelligentie (Galleries) */}
                <VisualIntelligence spot={spot} />
            </div>
        </div>
    );
}

// --- HAVE YOU BEEN REVIEW VIEW ---
function HaveBeenView({ spot, onBack, onReviewSubmit }) {
    const [foodRating, setFoodRating] = useState(3);
    const [serviceRating, setServiceRating] = useState(3);
    const [vibeRating, setVibeRating] = useState(3);
    const [selectedVibes, setSelectedVibes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const vibeTags = TAGS_MAP[spot.type] || [];

    const toggleVibe = (tagVibe) => {
        setSelectedVibes(prev => 
            prev.includes(tagVibe) ? prev.filter(v => v !== tagVibe) : [...prev, tagVibe]
        );
    };

    const submitReview = async () => {
        if (!spot) return;
        setIsSubmitting(true);
        const spotRef = doc(db, "spots", spot.id);
        const newRating = {
            food: foodRating,
            service: serviceRating,
            vibe: vibeRating,
            totalVotes: (spot.rating?.totalVotes || 0) + 1
        };

        try {
            // Update rating, tags en increment vote count
            await updateDoc(spotRef, {
                rating: newRating,
                tags: arrayUnion(...selectedVibes)
            });
            onReviewSubmit(); // Terug naar detail en verversen
        } catch (error) {
            console.error("Fout bij updaten review: ", error);
            alert("Er ging iets mis bij het plaatsen van je review. Probeer het later opnieuw.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-5 max-w-md mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-gray-100 rounded-full"><ChevronLeft size={18}/></button>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jouw Vibe Check: {spot.name}</h1>
            </div>

            {/* sliders section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-5 border border-gray-50">
                <SliderRow label="Eten" icon={<Utensils className="w-4 h-4"/>} value={foodRating} onChange={setFoodRating} />
                <SliderRow label="Service" icon={<ThumbsUp className="w-4 h-4"/>} value={serviceRating} onChange={setServiceRating} />
                <SliderRow label="Vibe" icon={<Flame className="w-4 h-4"/>} value={vibeRating} onChange={setVibeRating} />
            </div>

            {/* vibes selection section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                <h3 className="font-bold text-gray-900 mb-4">Welke vibes waren van toepassing?</h3>
                <div className="flex flex-wrap gap-2.5">
                    {vibeTags.map(tag => {
                        const isSelected = selectedVibes.includes(tag.vibe);
                        return (
                            <button
                                key={tag.vibe}
                                onClick={() => toggleVibe(tag.vibe)}
                                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all border shadow-sm ${isSelected ? 'bg-[#FF1493] text-white border-[#FF1493] transform scale-105 shadow-md' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* photo upload section */}
            <PhotoUploadspot />

            <button 
                onClick={submitReview} 
                disabled={isSubmitting} 
                className="w-full mt-8 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transform hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
                {isSubmitting ? "Verzenden..." : "Plaats review"}
            </button>
        </div>
    );
}

// --- PHOTO UPLOAD COMPONENT FOR REVIEW ---
function PhotoUploadspot() {
    const [viewPhoto, setViewPhoto] = useState(null);
    const [interiorPhoto, setInteriorPhoto] = useState(null);
    const [foodPhoto, setFoodPhoto] = useState(null);

    const PhotoInput = ({ label, onFileSelect, children, descriptionPlaceholder }) => (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-inner space-y-3">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><Camera size={14}/> {label}</label>
            <div className="flex items-center gap-3">
                <label className="bg-white p-3 rounded-full border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50"><Plus size={16} className="text-[#FF1493]" />
                    <input type="file" className="hidden" onChange={(e) => onFileSelect(e.target.files[0])} accept="image/*" />
                </label>
                <div className="flex-1 space-y-2">
                    {children}
                    <input type="text" placeholder={descriptionPlaceholder} className="w-full text-xs p-2.5 rounded-lg border border-gray-100 bg-white shadow-inner" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 space-y-5">
            <h3 className="font-bold text-gray-900 mb-2">Heb je foto's om te delen?</h3>
            
            <PhotoInput label="The View (optioneel)" onFileSelect={setViewPhoto} descriptionPlaceholder="Naam gerechten (optioneel)">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <input type="time" className="p-2.5 rounded-lg border border-gray-100 bg-white shadow-inner" placeholder="Tijdstip" />
                    <input type="date" className="p-2.5 rounded-lg border border-gray-100 bg-white shadow-inner" placeholder="Datum" />
                </div>
            </PhotoInput>

            <PhotoInput label="The Interior & Table (optioneel)" onFileSelect={setInteriorPhoto} descriptionPlaceholder="Naam gerechten (optioneel)">
                {interiorPhoto && <p className="text-xs text-gray-700 italic">{interiorPhoto.name}</p>}
            </PhotoInput>

            <PhotoInput label="Food (optioneel)" onFileSelect={setFoodPhoto} descriptionPlaceholder="Naam gerechten (bijv. Truffle Pasta)">
                {foodPhoto && <p className="text-xs text-gray-700 italic">{foodPhoto.name}</p>}
            </PhotoInput>
        </div>
    );
}

// --- HELPER: SliderRow (cijfers 1-5 vuurtjes) ---
function SliderRow({ label, icon, value, onChange }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">{icon} {label}</span>
                <span className="text-sm font-black text-[#FF1493]">{value.toFixed(1)} / 5</span>
            </div>
            <input
                type="range" min="1" max="5" step="0.1" value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF1493]"
            />
            <div className="flex items-center gap-1 justify-center pt-2">
                {[1, 2, 3, 4, 5].map(n => (
                    <Flame key={n} size={20} className={Math.floor(value) >= n ? 'text-[#FF1493] fill-[#FF1493]' : 'text-gray-300 fill-gray-100'} />
                ))}
            </div>
        </div>
    );
}

// --- VISUAL INTELLIGENCE COMPONENT (Galleries) ---
function VisualIntelligence({ spot }) {
    const [activePhotoTab, setActivePhotoTab] = useState('view');
    const galleryItems = spot.galleries?.[activePhotoTab] || [];

    const tabs = [
        { key: 'view', label: 'The View', icon: <Camera size={14}/> },
        { key: 'table', label: 'Interior & Table', icon: <Armchair size={14}/> },
        { key: 'food', label: 'Food', icon: <Utensils size={14}/> },
    ];

    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
            <h3 className="font-bold text-gray-900 mb-4">Visuele Intelligentie</h3>
            <div className="flex gap-2 mb-4">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActivePhotoTab(tab.key)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${activePhotoTab === tab.key ? 'bg-[#FF1493] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {galleryItems.length > 0 ? galleryItems.map(item => (
                    <div key={item.id} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
                        <img src={item.url} className="w-full h-52 object-cover" />
                        <span className="absolute bottom-3 left-3 bg-green-500/90 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} /> Geverifieerde Locatie</span>
                        <button className="absolute bottom-3 right-3 flex items-center gap-1 text-sm font-semibold bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-pink-600"><ThumbsUp size={14}/> {item.upvotes}</button>
                        <span className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">{item.time}</span>
                    </div>
                )) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 text-sm italic">
                        Geen geverifieerde foto's in deze categorie. Decommunity heeft er nog geen toegevoegd!
                    </div>
                )}
            </div>
        </div>
    );
}
