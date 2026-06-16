import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import PasswordRequirements from '../components/PasswordRequirements';

export default function CompleteProfilePage() {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-[20px] font-semibold text-[#041620] leading-[1.5]">Complete profile</h2>
        <p className="text-sm text-[#041620] font-normal leading-[1.5] mt-1">
          Let&apos;s secure your account and personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="complete-fullname" className="text-sm font-medium text-[#08283B] leading-[1.5]">
              Full Name
            </label>
            <input
              id="complete-fullname"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#ECECEB] border border-[#B2BCC2] rounded-lg px-4 py-3 text-sm text-[#08283B] placeholder:text-[#9CA3AF] leading-[1.5] outline-none focus:border-[#1A7FC1] focus:ring-1 focus:ring-[#1A7FC1] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="complete-password" className="text-sm font-medium text-[#08283B] leading-[1.5]">
              New Password
            </label>
            <div className="relative">
              <input
                id="complete-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
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

          <div className="flex flex-col gap-2">
            <label htmlFor="complete-confirm-password" className="text-sm font-medium text-[#08283B] leading-[1.5]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="complete-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-[#ECECEB] border border-[#B2BCC2] rounded-lg px-4 py-3 pr-10 text-sm text-[#5A6F7C] placeholder:text-[#5A6F7C] leading-[1.5] outline-none focus:border-[#1A7FC1] focus:ring-1 focus:ring-[#1A7FC1] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6F7C] hover:text-[#08283B] transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <PasswordRequirements password={password} />

        <button
          type="submit"
          className="w-full bg-[#08283B] text-[#FDFDFD] text-sm font-medium leading-[1.5] py-[10px] px-5 rounded-lg hover:bg-[#041620] active:bg-[#041620] transition-colors cursor-pointer"
        >
          Continue to login
        </button>
      </form>
    </AuthLayout>
  );
}
