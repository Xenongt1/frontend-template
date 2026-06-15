import { FormField, Input } from "@/shared/components";
import Toggle from "./Toggle";

const cardStyle: React.CSSProperties = {
  background: '#FDFDFD',
  border: '1px solid #E6EAEB',
  borderRadius: 10,
  padding: 'clamp(12px, 2vh, 24px)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(10px, 1.6vh, 18px)',
};
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
  <section aria-labelledby={ariaLabelledBy} style={cardStyle}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
      }}
    >
      <div>
        <h2
          id={ariaLabelledBy}
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#041620',
            lineHeight: '28px',
          }}
        >
          {title}
          {subtitle && (
            <span
              style={{
                marginLeft: 6,
                fontWeight: 400,
                fontSize: 16,
              }}
            >
              {subtitle}
            </span>
          )}
        </h2>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: 14,
            fontWeight: 400,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#08283B',
            lineHeight: '20px',
          }}
        >
          {description}
        </p>
      </div>
      <Toggle checked={enabled} label={toggleLabel} onToggle={onToggle} />
    </div>

    <div
      style={{
        background: '#FDFDFD',
        border: '1px solid #E6EAEB',
        borderRadius: 6,
        padding: 16,
      }}
    >
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
