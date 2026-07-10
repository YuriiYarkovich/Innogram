'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

export default function SignUpButton() {
  const router: AppRouterInstance = useRouter();

  const handleEmailSingUp = () => {
    router.push(`/registration`);
  };

  return (
    <button
      className="flex items-center justify-center md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px] py-2 hover:border-[#79747e]"
      onClick={handleEmailSingUp}
    >
      <span className="text-[20px]">Sign up using email</span>
    </button>
  );
}
