import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import type { AppConfig } from './index';
import { saveConfig, normalizeApiBaseUrl } from './index';

interface Props {
  onComplete: (config: AppConfig) => void;
}

const ENVIRONMENTS: AppConfig['environment'][] = ['development', 'staging', 'production'];

const inputClass = (hasError: boolean) => [
  'w-full px-3.5 py-2.5 rounded-lg outline-none box-border',
  'font-inter text-sm font-normal leading-[21px] text-text-primary',
  'bg-canvas-50',
  hasError ? 'border border-[#E53E3E]' : 'border border-stroke-light',
].join(' ');

const ConfigSetupForm: React.FC<Props> = ({ onComplete }) => {
  const { t } = useTranslation();

  const ENV_LABEL_KEYS: Record<AppConfig['environment'], string> = {
    development: 'setup.environmentDevelopment',
    staging: 'setup.environmentStaging',
    production: 'setup.environmentProduction',
  };

  const form = useForm({
    defaultValues: {
      apiBaseUrl: '',
      environment: 'development' as AppConfig['environment'],
      tenantId: '',
      wsUrl: '',
    },
    onSubmit: async ({ value }) => {
      const config: AppConfig = {
        apiBaseUrl: normalizeApiBaseUrl(value.apiBaseUrl.trim()),
        environment: value.environment,
        tenantId: value.tenantId.trim(),
        wsUrl: value.wsUrl?.trim() ?? '',
      };
      saveConfig(config);
      onComplete(config);
    },
  });

  return (
    <div className="min-h-screen bg-surface-page flex items-center justify-center font-inter p-6 box-border">
      <div className="w-full max-w-[480px] bg-canvas-50 rounded-xl border border-stroke-light p-10 box-border">
        <div className="flex items-center gap-2.5 mb-2">
          <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8.50229 0.400699C8.95783 0.138189 9.47437 0 10.0002 0C10.526 0 11.0425 0.138189 11.498 0.400699L11.5002 0.401924L18.4963 4.39971L18.5002 4.40192C18.9558 4.66497 19.3342 5.0432 19.5975 5.49867C19.8608 5.95414 19.9996 6.47084 20.0002 6.99692V14.999C19.9996 15.5251 19.8608 16.0418 19.5975 16.4972C19.3342 16.9527 18.9558 17.3309 18.5002 17.594L18.4963 17.5962L11.5002 21.594L11.4982 21.5951C11.0427 21.8577 10.526 21.9959 10.0002 21.9959C9.4743 21.9959 8.95768 21.8577 8.50209 21.5951L8.50016 21.594L1.50403 17.5962L1.50017 17.594C1.04456 17.3309 0.666136 16.9527 0.402858 16.4972C0.13958 16.0418 0.000705689 15.5251 0.000166062 14.999V6.99692C0.000705689 6.47084 0.13958 5.95414 0.402858 5.49867C0.666136 5.0432 1.04456 4.66497 1.50017 4.40192L1.50403 4.39971L8.50229 0.400699ZM10.0002 2C9.82463 2 9.65218 2.04621 9.50016 2.13397L9.4963 2.13619L2.49858 6.13489C2.34742 6.22254 2.22185 6.34826 2.1344 6.49956C2.04671 6.65126 2.00042 6.82333 2.00017 6.99854V14.9974C2.00042 15.1726 2.04671 15.3446 2.1344 15.4963C2.22184 15.6476 2.34738 15.7733 2.49851 15.861L2.50017 15.8619L9.4963 19.8597L9.50016 19.8619C9.65219 19.9497 9.82463 19.9959 10.0002 19.9959C10.1757 19.9959 10.3481 19.9497 10.5002 19.8619L10.504 19.8597L17.5002 15.8619L17.5018 15.861C17.6529 15.7733 17.7785 15.6476 17.8659 15.4963C17.9537 15.3445 18 15.1723 18.0002 14.9969V6.99898C18 6.82361 17.9537 6.65138 17.8659 6.49956C17.7785 6.34825 17.6529 6.22252 17.5017 6.13488L17.5002 6.13398L10.504 2.13619L10.5002 2.13397C10.3481 2.04621 10.1757 2 10.0002 2Z" fill="#08283B"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M4.6343 2.7077C4.9106 2.2295 5.52224 2.06582 6.00044 2.34211L10.0002 4.65306L13.9999 2.34211C14.4781 2.06582 15.0897 2.2295 15.366 2.7077C15.6423 3.18591 15.4786 3.79755 15.0004 4.07384L10.5004 6.67384C10.1909 6.85269 9.80943 6.85269 9.49989 6.67384L4.99989 4.07384C4.52169 3.79755 4.35801 3.18591 4.6343 2.7077Z" fill="#08283B"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M0.134302 10.4977C0.410597 10.0195 1.02224 9.85578 1.50044 10.1321L6.00044 12.7321C6.30969 12.9108 6.50017 13.2408 6.50017 13.5979V18.7879C6.50017 19.3402 6.05245 19.7879 5.50017 19.7879C4.94788 19.7879 4.50017 19.3402 4.50017 18.7879V14.1751L0.499889 11.8638C0.0216849 11.5875 -0.141994 10.9759 0.134302 10.4977Z" fill="#08283B"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M19.866 10.4977C20.1423 10.9759 19.9786 11.5875 19.5004 11.8638L15.5002 14.1751V18.7879C15.5002 19.3402 15.0525 19.7879 14.5002 19.7879C13.9479 19.7879 13.5002 19.3402 13.5002 18.7879V13.5979C13.5002 13.2408 13.6906 12.9108 13.9999 12.7321L18.4999 10.1321C18.9781 9.85578 19.5897 10.0195 19.866 10.4977Z" fill="#08283B"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M0.404559 5.45725C0.681101 4.97919 1.29283 4.81583 1.77089 5.09237L10.0002 9.85272L18.2294 5.09237C18.7075 4.81583 19.3192 4.97919 19.5958 5.45725C19.8723 5.93532 19.709 6.54704 19.2309 6.82359L10.5009 11.8736C10.1911 12.0528 9.80921 12.0528 9.49944 11.8736L0.769443 6.82359C0.291381 6.54704 0.128017 5.93532 0.404559 5.45725Z" fill="#08283B"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 9.99793C10.5525 9.99793 11.0002 10.4456 11.0002 10.9979V21.0779C11.0002 21.6302 10.5525 22.0779 10.0002 22.0779C9.44788 22.0779 9.00017 21.6302 9.00017 21.0779V10.9979C9.00017 10.4456 9.44788 9.99793 10.0002 9.99793Z" fill="#08283B"/>
          </svg>
          <span className="font-inter text-lg font-semibold leading-6 text-brand-navy">
            Chain Pilot
          </span>
        </div>

        <h1 className="mt-4 mb-1 font-poppins text-[22px] font-medium leading-[33px] text-brand-navy-dark">
          {t('setup.title')}
        </h1>
        <p className="mt-0 mb-8 font-inter text-sm font-normal leading-[21px] text-text-secondary">
          {t('setup.description')}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          noValidate
          className="flex flex-col gap-5"
        >
          <form.Field
            name="apiBaseUrl"
            validators={{
              onSubmit: ({ value }) => {
                if (!value.trim()) return t('setup.errorApiRequired');
                if (!/^https?:\/\/.+/.test(value.trim())) return t('setup.errorApiInvalid');
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field
                label={t('setup.apiBaseUrlLabel')}
                required
                hint={t('setup.apiBaseUrlHint')}
                error={field.state.meta.errors[0] as string | undefined}
              >
                <input
                  type="url"
                  placeholder="https://api.chainpilot.example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={inputClass(field.state.meta.errors.length > 0)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="environment">
            {(field) => (
              <Field label={t('setup.environmentLabel')} required>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as AppConfig['environment'])}
                  onBlur={field.handleBlur}
                  className={inputClass(false)}
                >
                  {ENVIRONMENTS.map((env) => (
                    <option key={env} value={env}>
                      {t(ENV_LABEL_KEYS[env])}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="tenantId"
            validators={{
              onSubmit: ({ value }) =>
                !value.trim() ? t('setup.errorTenantRequired') : undefined,
            }}
          >
            {(field) => (
              <Field
                label={t('setup.tenantIdLabel')}
                required
                hint={t('setup.tenantIdHint')}
                error={field.state.meta.errors[0] as string | undefined}
              >
                <input
                  type="text"
                  placeholder="e.g. amalitech-gh"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={inputClass(field.state.meta.errors.length > 0)}
                />
              </Field>
            )}
          </form.Field>

          <form.Field
            name="wsUrl"
            validators={{
              onSubmit: ({ value }) => {
                if (value && !/^wss?:\/\/.+/.test(value.trim())) return t('setup.errorWsInvalid');
                return undefined;
              },
            }}
          >
            {(field) => (
              <Field
                label={t('setup.wsUrlLabel')}
                hint={t('setup.wsUrlHint')}
                error={field.state.meta.errors[0] as string | undefined}
              >
                <input
                  type="url"
                  placeholder="wss://ws.chainpilot.example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={inputClass(field.state.meta.errors.length > 0)}
                />
              </Field>
            )}
          </form.Field>

          <button
            type="submit"
            className="mt-2 w-full px-6 py-3 bg-brand-navy text-canvas-50 border-none rounded-lg cursor-pointer font-inter text-base font-medium leading-6 transition-colors duration-150 hover:bg-brand-navy-dark"
          >
            {t('setup.launchButton')}
          </button>
        </form>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, required, hint, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-inter text-sm font-medium leading-[21px] text-text-primary">
      {label}
      {required && <span className="text-[#E53E3E] ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && (
      <span className="font-inter text-xs leading-[18px] text-text-tertiary">
        {hint}
      </span>
    )}
    {error && (
      <span className="font-inter text-xs leading-[18px] text-[#E53E3E]">
        {error}
      </span>
    )}
  </div>
);

export default ConfigSetupForm;
