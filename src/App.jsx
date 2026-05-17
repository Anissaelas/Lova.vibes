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
    galleries:
