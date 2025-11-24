import Image from 'next/image';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import LogInForm from '@/components/auth/log-in.form';
import Separator from '@/components/auth/separator';
import SignUpButton from '@/components/auth/signUp.button';
import { NextRequest } from 'next/server';

export default function Home(req: NextRequest) {
  return (
    <div className="flex flex-row min-h-screen justify-center gap-[220px]">
      <div className="flex md:w-[450px] flex-col items-center justify-center min-h-screen">
        <div className="w-full md:h-[350px] rounded-[36px] flex flex-col justify-center items-center bg-[#eaddff] pr-[30px] pl-[30px]">
          <div className="mb-6">
            <Image
              src={'/images/logo.png'}
              alt="Logo"
              width={340}
              height={70}
              draggable={false}
            />
          </div>
          <LogInForm />
        </div>
        <div className="w-full flex flex-col">
          <Separator stripColor={`bg-[#ded8e1]`} />
          <div className="flex flex-col gap-3 w-full items-center">
            <GoogleSignInButton />
            <SignUpButton />
          </div>
        </div>
      </div>
    </div>
  );
}
