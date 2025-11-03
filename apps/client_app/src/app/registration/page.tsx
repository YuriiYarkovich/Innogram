import RegistrationForm from '@/components/registration.form';
import Image from 'next/image';
import GoogleSignUpButton from '@/components/google-sign-up-button';
import Separator from '@/components/separator';
import React from 'react';

export default function Registration() {
  return (
    <div className="flex flex-row justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center md:w-[500px] min-h-screen">
        <div className="flex flex-col items-center justify-center w-full md:min-h-[800px] bg-[#eaddff] pr-[30px] pl-[30px] rounded-[50px] gap-2">
          <div className="mb-6 my-3">
            {/* Вставь ссылку на логотип */}
            <Image src="/images/logo.png" alt="Logo" width={340} height={70} />
          </div>
          <span className="text-[24px] text-[#625b71] font-regular text-justify flex mb-5">
            Sign up to unlock all functionality
          </span>
          <GoogleSignUpButton />
          <Separator stripColor={`bg-[#624b98]`} />
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
