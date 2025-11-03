'use client';

import Image from 'next/image';
import GoogleSignUpButton from '@/components/google-sign-up-button';
import Separator from '@/components/separator';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegistrationForm() {
  const router: AppRouterInstance = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');

  return (
    <div className="flex flex-col items-center justify-center w-full md:h-[800px] bg-[#eaddff] pr-[30px] pl-[30px] rounded-[50px] gap-2">
      <div className="mb-6 my-3">
        {/* Вставь ссылку на логотип */}
        <Image src="/images/logo.png" alt="Logo" width={340} height={70} />
      </div>
      <span className="text-[24px] text-[#625b71] font-regular text-justify flex mb-5">
        Sign up to unlock all functionality
      </span>
      <GoogleSignUpButton />
      <Separator stripColor={`bg-[#624b98]`} />
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
      <span className={`mb-[-10px] ml-[-370px] text-[#625b71]`}>Birthday</span>
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
        className="bg-[#4f378a] text-white rounded-[20px] my-[25px] md:h-[45px] hover:bg-[#d0bcff] w-full"
      >
        Sign up
      </button>
    </div>
  );
}
