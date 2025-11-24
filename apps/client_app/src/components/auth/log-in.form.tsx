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
      <input
        type="email"
        placeholder="Email"
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
        {...register('email', {
          required: 'Email is required',
        })}
      />
      {errors.email && (
        <p className="text-red-600 text-sm">{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder="Password"
        className="border-2 border-[#bcb8b8] rounded-[6px] px-3 py-2 w-full bg-white"
        {...register('password', {
          required: 'Password is required',
        })}
      />
      {errors.password && (
        <p className="text-red-600 text-sm">{errors.password.message}</p>
      )}

      {errors.root && (
        <p className="text-red-600 text-sm">{errors.root.message}</p>
      )}

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
