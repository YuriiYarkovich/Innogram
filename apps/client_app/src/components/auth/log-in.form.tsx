'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { submitLogin } from '@/services/auth.service';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LogInForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    await submitLogin(
      data.email,
      data.password,
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
      className="w-full flex flex-col gap-4"
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
            errors.root?.message?.includes(', Password') ||
            errors.root?.message?.startsWith('Wrong') ||
            errors.root?.message?.includes(', Wrong')
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
              .find(
                (msg) => msg.startsWith('Password') || msg.startsWith('Wrong'),
              )}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#4f378a] text-white py-2 rounded-[20px] hover:bg-[#d0bcff]"
      >
        {isSubmitting ? 'Loading...' : 'Log in'}
      </button>
    </form>
  );
}
