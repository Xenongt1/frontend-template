import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export type Requirement = { key: string; label: string; test: (pw: string) => boolean };
export type ReqStatus = 'idle' | 'met' | 'unmet';

export const PASSWORD_REQUIREMENTS: Requirement[] = [
  { key: 'length',    label: 'At least 8+ Characters', test: pw => pw.length >= 8 },
  { key: 'number',    label: 'One number',              test: pw => /\d/.test(pw) },
  { key: 'special',   label: 'One special character',   test: pw => /[^A-Za-z0-9]/.test(pw) },
  { key: 'uppercase', label: 'One uppercase letter',    test: pw => /[A-Z]/.test(pw) },
];

function getReqIcon(status: ReqStatus) {
  if (status === 'idle') return <span className="inline-block w-4 h-4 rounded-lg bg-[#ECECEB] border border-[#B2BCC2] shrink-0" />;
  if (status === 'met')  return <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00684A]" />;
  return <XCircle className="w-4 h-4 shrink-0 text-[#C81E1E]" />;
}

function getReqTextColor(status: ReqStatus) {
  if (status === 'met')   return 'text-[#00684A]';
  if (status === 'unmet') return 'text-[#C81E1E]';
  return 'text-[#08283B]';
}

function RequirementItem({ req, status }: Readonly<{ req: Requirement; status: ReqStatus }>) {
  return (
    <div className="flex items-center gap-2">
      {getReqIcon(status)}
      <span className={`text-sm font-medium leading-[14px] ${getReqTextColor(status)}`}>
        {req.label}
      </span>
    </div>
  );
}

export default function PasswordRequirements({ password }: Readonly<{ password: string }>) {
  const passwordTyped = password.length > 0;
  const getStatus = (req: Requirement): ReqStatus => {
    if (!passwordTyped) return 'idle';
    return req.test(password) ? 'met' : 'unmet';
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#041620] font-normal leading-[1.5]">Password must contain:</p>
      <div className="flex gap-[71px]">
        <div className="flex-1 flex flex-col gap-4">
          {[PASSWORD_REQUIREMENTS[0], PASSWORD_REQUIREMENTS[1]].map(req => (
            <RequirementItem key={req.key} req={req} status={getStatus(req)} />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {[PASSWORD_REQUIREMENTS[2], PASSWORD_REQUIREMENTS[3]].map(req => (
            <RequirementItem key={req.key} req={req} status={getStatus(req)} />
          ))}
        </div>
      </div>
    </div>
  );
}
