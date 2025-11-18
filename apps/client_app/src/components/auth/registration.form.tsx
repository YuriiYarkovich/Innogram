'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { getDeviceId } from '@/utils/device';
import { SERVER } from '@/config/apiRoutes';
import returnErrorMessage from '@/utils/showAuthError';

export default function RegistrationForm() {
  const router: AppRouterInstance = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deviceId: string = getDeviceId();
    const response: Response = await fetch(SERVER.API.REGISTRATION, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'x-device-id': deviceId,
      },
      body: JSON.stringify({
        email,
        password,
        username,
        birthday,
        bio,
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      const finalMessage: string | undefined =
        await returnErrorMessage(response);
      if (finalMessage) setError(finalMessage);
      return;
    }

    if (response.status === 201) {
      router.push('/feed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full flex flex-col gap-2`}>
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
      <input
        type="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
      />
      <span className={`mb-[-10px] text-[#625b71]`}>Birthday</span>
      <input
        type="date"
        title="Birthday"
        value={birthday}
        onChange={(e) => setBirthday(e.target.value)}
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="border-2 border-[#bcb8b8] rounded-[6px] md:h-[100px] px-3 py-2 w-full bg-white"
      />
      <button
        type="submit"
        className="bg-[#4f378a] text-white rounded-[20px] my-[25px] mb-[-1px] md:h-[45px] hover:bg-[#d0bcff] hover:text-black w-full"
      >
        Sign up
      </button>
      {error && <div className={`text-red-600 text-sm mt-2 mb-7`}>{error}</div>}
    </form>
  );
}
