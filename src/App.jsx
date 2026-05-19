import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

export default function LocaVibesApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) { alert("Inloggen mislukt: " + err.message); }
  };

  // ALS JE NIET BENT INGELOGD:
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFEE0] flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black text-[#FF1493] mb-8">LOQA. Inloggen</h1>
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="w-full p-4 rounded-xl border" />
          <input type="password" placeholder="Wachtwoord" onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl border" />
          <button className="w-full bg-[#FF1493] text-white p-4 rounded-xl font-bold">Log in</button>
        </form>
      </div>
    );
  }

  // ALS JE WEL BENT INGELOGD:
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-[#FF1493]">Welkom bij LOQA!</h1>
      <p>Je bent ingelogd. Refresh de pagina als je de plekken nog niet ziet.</p>
    </div>
  );
}
