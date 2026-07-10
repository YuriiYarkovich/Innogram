'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { submitRegistration } from '@/services/auth.service';

type RegistrationFormValues = {
  email: string;
  password: string;
  username: string;
  birthday: string;
  bio: string;
};

export default function RegistrationForm() {
  const router: AppRouterInstance = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegistrationFormValues>();

  const onSubmit = async (data: RegistrationFormValues) => {
    await submitRegistration(
      data.email,
      data.password,
      data.username,
      data.birthday,
      data.bio,
      (msg: string | null) => {
        if (msg) {
          setError('root', { message: msg });
        }
      },
      router,
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`w-full flex flex-col gap-2`}
    >
      <div>
        <input
          type="email"
          placeholder="Email"
          className={`border-2 ${
            errors.root?.message?.startsWith('Email') ||
            errors.root?.message?.includes('Email') ||
            errors.root?.message?.startsWith('User') ||
            errors.root?.message?.includes('User')
              ? 'border-red-600'
              : 'border-[#bcb8b8]'
          } rounded-[6px] px-3 py-2 w-full bg-white`}
          {...register('email', {
            required: 'Email is required',
          })}
        />
        {errors.email && (
          <p className="text-red-600 text-base mt-1">{errors.email.message}</p>
        )}
        {(errors.root?.message?.startsWith('Email') ||
          errors.root?.message?.includes('Email') ||
          errors.root?.message?.startsWith('User') ||
          errors.root?.message?.includes('User')) && (
          <p className="text-red-600 text-base mt-1">
            {errors.root.message
              .split(',')
              .find((msg) => msg.startsWith('Email') || msg.startsWith('User'))}
          </p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          className={`border-2 ${
            errors.root?.message?.startsWith('Password') ||
            errors.root?.message?.includes(', Password')
              ? 'border-red-600'
              : 'border-[#bcb8b8]'
          } rounded-[6px] px-3 py-2 w-full bg-white`}
          {...register('password', {
            required: 'Password is required',
          })}
        />
        {errors.password && (
          <p className="text-red-600 text-base mt-1">
            {errors.password.message}
          </p>
        )}
        {errors.root?.message?.includes('Password') && (
          <p className="text-red-600 text-base mt-1">
            {errors.root.message
              .split(',')
              .find((msg) => msg.startsWith('Password'))}
          </p>
        )}
      </div>
      <input
        type="username"
        placeholder="Username"
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
        {...register(`username`, { required: `Username is required` })}
      />
      <span className={`mb-[-10px] text-[#625b71]`}>Birthday</span>
      <input
        type="date"
        title="Birthday"
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
        {...register(`birthday`, { required: `Birthday is required` })}
      />
      <textarea
        placeholder="Bio"
        className="border-2 border-[#bcb8b8] rounded-[6px] md:h-[100px] px-3 py-2 w-full bg-white"
        {...register(`bio`, { required: `Bio is required` })}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#4f378a] text-white rounded-[20px] my-[25px] mb-[-1px] md:h-[45px] hover:bg-[#d0bcff] hover:text-black w-full"
      >
        {isSubmitting ? 'Loading...' : 'Sign up'}
      </button>
    </form>
  );
}
