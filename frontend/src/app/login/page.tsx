'use client';
import Head from 'next/head';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import GoogleLoginButton from '@/components/login/GoogleLoginButton';
import { useRouter } from 'next/navigation';
import LoginImage from '@/public/login.jpg';

export default function LoginPage() {
  const handleClick = () => {
    signIn('google', { callbackUrl: '/' });
  };
  return (
    <>
      <Head>
        <title>EmotiSense - Login</title>
      </Head>

      <main className="flex items-center justify-center min-h-screen bg-gray-50 font-inter">
        <section className="login-container bg-white rounded-2xl shadow-lg w-full max-w-md p-8 mx-4">
          <div className="text-center mb-8">
            <h1 className="font-[Pacifico] text-3xl text-primary mb-2">
              EmotiSense
            </h1>
            <p className="text-gray-600">
              Understand emotions, enhance connections
            </p>
          </div>

          <div className="mb-10">
            <div className="flex justify-center mb-8">
              <div
                className="w-48 h-48 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden"
                role="img"
                aria-label="Emotion Recognition Illustration"
              >
                <Image
                  src={LoginImage}
                  alt="Abstract minimalist illustration of emotions"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>

            <h2 className="text-2xl font-medium text-gray-800 mb-3 text-center">
              Welcome back
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Sign in to continue to your emotional intelligence dashboard
            </p>
          </div>

          <GoogleLoginButton onClick={handleClick} />

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By continuing, you agree to EmotiSense's</p>
            <div className="mt-1">
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
              <span className="mx-2">•</span>
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
