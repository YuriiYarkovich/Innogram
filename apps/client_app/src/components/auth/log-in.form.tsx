'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import ActionsService from '@/services/actions.service';

export default function LogInForm() {
  const router: AppRouterInstance = useRouter();
  const actionsService: ActionsService = new ActionsService();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await actionsService.submitLogin(email, password, setError, router);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
      />
      <button
        type="submit"
        className="bg-[#4f378a] text-white py-2 rounded-[20px] hover:bg-[#d0bcff]"
      >
        Log in
      </button>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </form>
  );
}
