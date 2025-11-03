import RegistrationForm from '@/components/registration.form';

export default function Registration() {
  return (
    <div className="flex flex-row justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center md:w-[500px] min-h-screen">
        <RegistrationForm />
      </div>
    </div>
  );
}
