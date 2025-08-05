import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert('Check your email to confirm your account.');
      router.push('/login');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white">
      <form onSubmit={handleSignup} className="bg-gray-900 p-6 rounded-lg w-full max-w-md space-y-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Sign Up to Knightly</h1>

        <input
          className="w-full p-2 rounded bg-gray-800 text-white"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full p-2 rounded bg-gray-800 text-white"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}
