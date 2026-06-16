import { FormField, Input } from "@/shared/components";
import Toggle from "./Toggle";

interface NotificationCardProps {
  title: string;
  subtitle?: string;
  description: string;
  toggleLabel: string;
  enabled: boolean;
  onToggle: () => void;
  fieldId: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  ariaLabelledBy: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  subtitle,
  description,
  toggleLabel,
  enabled,
  onToggle,
  fieldId,
  fieldLabel,
  fieldPlaceholder,
  value,
  onChange,
  error,
  ariaLabelledBy,
}) => (
  <section
    aria-labelledby={ariaLabelledBy}
    className="bg-canvas-50 border border-stroke-light rounded-[10px] p-[clamp(12px,2vh,24px)] flex flex-col gap-[clamp(10px,1.6vh,18px)]"
  >
    <div className="flex justify-between items-start gap-4">
      <div>
        <h2
          id={ariaLabelledBy}
          className="m-0 font-inter text-lg font-semibold leading-7 text-brand-navy-dark"
        >
          {title}
          {subtitle && (
            <span className="ml-1.5 font-normal text-base">{subtitle}</span>
          )}
        </h2>
        <p className="mt-1 mb-0 font-inter text-sm font-normal leading-5 text-text-primary">
          {description}
        </p>
      </div>
      <Toggle checked={enabled} label={toggleLabel} onToggle={onToggle} />
    </div>

    <div className="bg-canvas-50 border border-stroke-light rounded-md p-4">
      <FormField id={fieldId} label={fieldLabel} required error={error}>
        <Input
          id={fieldId}
          type="number"
          placeholder={fieldPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
        />
      </FormField>
    </div>
  </section>
);
export default NotificationCard;
