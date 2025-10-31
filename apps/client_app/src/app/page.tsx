import Image from 'next/image';
import { CONFIG } from '@/config/apiRoutes';
import GoogleSignInButton from '@/components/google-sign-in-button';
import LogInForm from '@/components/log-in.form';

export default function Home() {
  const handleGoogleSignIn = () => {
    window.location.href = `${CONFIG.BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex flex-row min-h-screen justify-center gap-[220px]">
      {/* Центральная форма */}

      <div className="flex md:w-[450px] flex-col items-center justify-center min-h-screen">
        <div className="w-full md:h-[350px] rounded-[36px] flex flex-col justify-center items-center bg-[#eaddff] pr-[30px] pl-[30px]">
          {/* Логотип */}
          <div className="mb-6">
            {/* Вставь ссылку на логотип */}
            <Image src="/images/logo.png" alt="Logo" width={340} height={70} />
          </div>

          {/* Поля ввода */}
          <LogInForm />
        </div>
        <div className="w-full flex flex-col">
          {/* Разделитель */}
          <div className="flex items-center my-6 w-full">
            <div className="flex-grow h-[2px] bg-[#ded8e1]"></div>
            <span className="px-2 text-[#4a4458] text-[22px]">OR</span>
            <div className="flex-grow h-[2px] bg-[#ded8e1]"></div>
          </div>

          {/* Кнопки входа */}
          <div className="flex flex-col gap-3 w-full items-center">
            <GoogleSignInButton />
            <button className="flex items-center justify-center md:w-[285px] md:h-[50px] border-[#eaddff] border-3 rounded-[20px] py-2 hover:border-[#79747e]">
              <span className="text-[20px]">Sign up using email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
