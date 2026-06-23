import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { Eye, EyeOff } from 'lucide-react';
import {
  useInviteDetailsQuery,
  useAcceptInviteMutation,
  storeAuth,
} from '../api/authApi';
import AuthLayout from '../components/AuthLayout';
import PasswordRequirements, { PASSWORD_REQUIREMENTS } from '../components/PasswordRequirements';

export default function AcceptInvitePage() {
  const rawSearch = useRouterState({ select: (s) => s.location.searchStr });
  const token = useMemo(() => new URLSearchParams(rawSearch).get('token') ?? '', [rawSearch]);

  const navigate = useNavigate();
  const inviteQuery = useInviteDetailsQuery(token);
  const acceptMutation = useAcceptInviteMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const form = useForm({
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError('');
      const allReqsMet = PASSWORD_REQUIREMENTS.every((r) => r.test(value.password));
      if (!allReqsMet) { setSubmitError('Please meet all password requirements.'); return; }
      if (value.password !== value.confirmPassword) {
        setSubmitError('Passwords do not match.');
        return;
      }
      try {
        const result = await acceptMutation.mutateAsync({
          token,
          fullName: value.fullName,
          password: value.password,
          confirmPassword: value.confirmPassword,
        });
        storeAuth(result);
        navigate({ to: '/dashboard', replace: true });
      } catch (err) {
        setSubmitError(
          (err as { message?: string })?.message ?? 'Something went wrong. Please try again.',
        );
      }
    },
  });

  useEffect(() => {
    if (inviteQuery.data?.fullName) {
      form.setFieldValue('fullName', inviteQuery.data.fullName);
    }
  }, [inviteQuery.data, form]);

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-4">
          <h2 className="text-[20px] font-semibold text-[#041620] leading-[1.5]">Invalid invitation link</h2>
          <p className="text-sm text-[#5A6F7C] leading-[1.5]">
            No invitation token was found. Please check your email and click the original invitation link.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (inviteQuery.isLoading) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-4">
          <h2 className="text-[20px] font-semibold text-[#041620] leading-[1.5]">Verifying invitation…</h2>
          <p className="text-sm text-[#5A6F7C] leading-[1.5]">
            Please wait while we validate your invitation link.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (inviteQuery.isError) {
    const msg = (inviteQuery.error as { message?: string })?.message
      ?? 'This invitation link is invalid or has expired.';
    return (
      <AuthLayout>
        <div className="flex flex-col gap-4">
          <h2 className="text-[20px] font-semibold text-[#C81E1E] leading-[1.5]">Invitation link expired</h2>
          <p className="text-sm text-[#5A6F7C] leading-[1.5]">{msg}</p>
          <p className="text-sm text-[#5A6F7C] leading-[1.5]">
            Please contact your administrator to request a new invitation.
          </p>
        </div>
      </AuthLayout>
    );
  }

  const submitting = acceptMutation.isPending;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-[20px] font-semibold text-[#041620] leading-[1.5]">Complete your profile</h2>
        <p className="text-sm text-[#041620] font-normal leading-[1.5] mt-1">
          Set your password to activate your account
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="invite-email" className="text-sm font-medium text-[#08283B] leading-[1.5]">Email</label>
            <input
              id="invite-email"
              type="email"
              value={inviteQuery.data?.email ?? ''}
              readOnly
              className="w-full bg-[#F5F5F5] border border-[#B2BCC2] rounded-lg px-4 py-3 text-sm text-[#5A6F7C] leading-[1.5] outline-none cursor-not-allowed"
            />
          </div>

          <form.Field name="fullName">
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor="invite-fullname" className="text-sm font-medium text-[#08283B] leading-[1.5]">Full Name</label>
                <input
                  id="invite-fullname"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="John Doe"
                  required
                  className="w-full bg-[#ECECEB] border border-[#B2BCC2] rounded-lg px-4 py-3 text-sm text-[#08283B] placeholder:text-[#9CA3AF] leading-[1.5] outline-none focus:border-[#1A7FC1] focus:ring-1 focus:ring-[#1A7FC1] transition-colors"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-2">
                <label htmlFor="invite-password" className="text-sm font-medium text-[#08283B] leading-[1.5]">Password</label>
                <div className="relative">
                  <input
                    id="invite-password"
                    type={showPassword ? 'text' : 'password'}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="••••••••••"
                    required
                    className="w-full bg-[#ECECEB] border border-[#B2BCC2] rounded-lg px-4 py-3 pr-10 text-sm text-[#5A6F7C] placeholder:text-[#5A6F7C] leading-[1.5] outline-none focus:border-[#1A7FC1] focus:ring-1 focus:ring-[#1A7FC1] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6F7C] hover:text-[#08283B] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => {
              const passwordValue = form.getFieldValue('password');
              const mismatch = field.state.value !== '' && field.state.value !== passwordValue;
              return (
                <div className="flex flex-col gap-2">
                  <label htmlFor="invite-confirm-password" className="text-sm font-medium text-[#08283B] leading-[1.5]">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="invite-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="••••••••••"
                      required
                      className={`w-full bg-[#ECECEB] border rounded-lg px-4 py-3 pr-10 text-sm placeholder:text-[#5A6F7C] leading-[1.5] outline-none focus:ring-1 transition-colors ${
                        mismatch
                          ? 'border-[#C81E1E] text-[#C81E1E] focus:border-[#C81E1E] focus:ring-[#C81E1E]'
                          : 'border-[#B2BCC2] text-[#5A6F7C] focus:border-[#1A7FC1] focus:ring-[#1A7FC1]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6F7C] hover:text-[#08283B] transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mismatch && (
                    <span className="text-xs text-[#C81E1E]">Passwords do not match</span>
                  )}
                </div>
              );
            }}
          </form.Field>
        </div>

        <form.Subscribe selector={(state) => state.values.password}>
          {(passwordValue) => <PasswordRequirements password={passwordValue} />}
        </form.Subscribe>

        {submitError && (
          <p className="text-sm text-[#C81E1E] leading-[1.5]">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#08283B] text-[#FDFDFD] text-sm font-medium leading-[1.5] py-[10px] px-5 rounded-lg hover:bg-[#08283B] active:bg-[#08283B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? 'Activating account…' : 'Activate account'}
        </button>
      </form>
    </AuthLayout>
  );
}
