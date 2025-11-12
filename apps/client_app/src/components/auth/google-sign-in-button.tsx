'use client';
import { CONFIG } from '@/config/apiRoutes';
import Image from 'next/image';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

export default function GoogleSignInButton() {
  const router: AppRouterInstance = useRouter();

  const handleGoogleSignIn = async () => {
    window.location.href = `${CONFIG.API.GOOGLE_AUTH}`;
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex flex-row items-center justify-center bg-white gap-[25px] md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px] hover:border-[#79747e]"
    >
      <Image
        src="/images/google-logo.svg"
        alt="Google"
        width={28}
        height={28}
        draggable={false}
      />
      <span className="text-[20px]">Sign in with Google</span>
    </button>
  );
}
