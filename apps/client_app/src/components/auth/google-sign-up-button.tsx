'use client';
import { SERVER } from '@/config/apiRoutes';
import Image from 'next/image';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

export default function GoogleSignUpButton() {
  const router: AppRouterInstance = useRouter();

  const handleGoogleSignIn = async () => {
    window.location.href = `${SERVER.API.GOOGLE_AUTH}`;
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex flex-row items-center justify-center bg-white gap-[25px] md:w-[285px] md:h-[50px] border-[#79747e] border-3 rounded-[20px] hover:border-[#efb8c8]"
    >
      <Image
        src="/images/google-logo.svg"
        alt="Google"
        width={28}
        height={28}
      />
      <span className="text-[20px]">Sign up with Google</span>
    </button>
  );
}
