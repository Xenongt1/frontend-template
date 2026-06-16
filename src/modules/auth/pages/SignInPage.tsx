import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useSignInMutation, storeAuth, hasAccessToken } from '../api/authApi';
import AuthLayout from '../components/AuthLayout';

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const signInMutation = useSignInMutation();

  useEffect(() => {
    if (hasAccessToken()) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      storeAuth(result);
      navigate({ to: '/dashboard' });
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ?? 'Invalid email or password';
      setError(msg);
    }
  };

  const isLoading = signInMutation.isPending;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-[20px] font-semibold text-[#041620] leading-[1.5]">
          Sign in to your account
        </h2>
        <p className="text-sm text-[#041620] font-normal leading-[1.5] mt-1">
          Enter your credentials to access Chain Pilot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="signin-email" className="text-sm font-medium text-[#08283B] leading-[1.5]">
              Your email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6F7C] pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@flowbite.com"
                required
                className="w-full bg-[#ECECEB] border border-[#B2BCC2] rounded-lg pl-10 pr-4 py-3 text-sm text-[#08283B] placeholder:text-[#5A6F7C] leading-[1.5] outline-none focus:border-[#1A7FC1] focus:ring-1 focus:ring-[#1A7FC1] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="signin-password" className="text-sm font-medium text-[#08283B] leading-[1.5]">
              Password
            </label>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                className="w-full bg-[#ECECEB] border border-[#B2BCC2] rounded-lg px-4 py-3 pr-10 text-sm text-[#5A6F7C] placeholder:text-[#5A6F7C] leading-[1.5] outline-none focus:border-[#1A7FC1] focus:ring-1 focus:ring-[#1A7FC1] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6F7C] hover:text-[#08283B] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#B2BCC2] text-[#08283B] accent-[#08283B] cursor-pointer"
            />
            <span className="text-sm text-[#08283B] font-normal leading-[1.5]">Remember me</span>
          </label>
          <button type="button" className="text-sm text-[#08283B] font-normal leading-[1.5] hover:underline">
            Lost Password?
          </button>
        </div>

        {error && (
          <p className="text-sm text-[#C81E1E] font-normal leading-[1.5] -mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#08283B] text-[#FDFDFD] text-sm font-medium leading-[1.5] py-[10px] px-5 rounded-lg hover:bg-[#08283B] active:bg-[#08283B] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-sm text-[#08283B] font-normal leading-[1.5] text-center">
          Having trouble signing in?{' '}
          <button type="button" className="underline hover:text-[#041620] transition-colors">
            Contact your administrator
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
