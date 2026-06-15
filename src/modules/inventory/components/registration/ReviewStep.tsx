import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AttributeItem, BasicInfoValues, IntakeField } from './types';

interface ReviewStepProps {
  basicInfo: BasicInfoValues;
  categoryOptions: { label: string; value: string }[];
  uomOptions: { label: string; value: string }[];
  attributes: AttributeItem[];
  intakeFields: IntakeField[];
  tags: string[];
  enableExpiryAlert: boolean;
  expiryDays: string;
  enableReorderAlert: boolean;
  reorderLevel: string;
  enableMinStockAlert: boolean;
  minStockLevel: string;
}

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#5A6F7C',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#08283B',
      }}
    >
      {value}
    </span>
  </div>
);

const getOptionLabel = (value: string, options: { label: string; value: string }[]) =>
  options.find((option) => option.value === value)?.label ?? '—';

const reviewPanelStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#F7F7F7',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
};

const reviewPanelContentStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 16,
};

const reviewPanelHeaderStyle: React.CSSProperties = {
  alignSelf: 'stretch',
  paddingBottom: 14,
  borderBottom: '1px solid #E6EAEB',
  display: 'flex',
  alignItems: 'center',
};

const reviewHeadingStyle: React.CSSProperties = {
  margin: 0,
  flex: 1,
  color: '#041620',
  fontSize: 18,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 600,
  lineHeight: '28px',
};

const reviewCardTextStyle: React.CSSProperties = {
  color: '#08283B',
  fontSize: 14,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 500,
  lineHeight: '21px',
  wordBreak: 'break-word',
};

const ReviewPanel: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={reviewPanelStyle}>
    <div style={reviewPanelContentStyle}>
      <div style={reviewPanelHeaderStyle}>
        <h3 style={reviewHeadingStyle}>{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const GreenBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 12px',
      background: '#F3FAF7',
      borderRadius: 6,
      border: '1px solid #DEF7EC',
      color: '#03543F',
      fontSize: 14,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 600,
      lineHeight: '21px',
      textAlign: 'center',
    }}
  >
    {children}
  </span>
);

const TagBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 12px',
      background: '#FDF2F2',
      borderRadius: 6,
      border: '1px solid #FDE8E8',
      color: '#9B1C1C',
      fontSize: 14,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 500,
      lineHeight: '21px',
    }}
  >
    {children}
  </span>
);

const TypeBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 6,
      border: '1px solid #E6EAEB',
      background: '#FDFDFD',
      color: '#08283B',
      fontSize: 12,
      fontWeight: 500,
      fontFamily: "'Inter', system-ui, sans-serif",
      lineHeight: '18px',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const RequiredBadge: React.FC<{ required: boolean }> = ({ required }) => {
  const { t } = useTranslation();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 10px',
        background: required ? '#FDF2F2' : '#FFF9E6',
        borderRadius: 6,
        border: required ? '1px solid #FDE8E8' : '1px solid #FFEBB0',
        color: required ? '#9B1C1C' : '#8C6900',
        fontSize: 12,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 500,
        lineHeight: '18px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {required ? t('common.required') : t('common.optional')}
    </span>
  );
};

const EnabledBadge: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const { t } = useTranslation();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: '18px',
        background: enabled ? '#F3FAF7' : '#F3F4F6',
        border: `1px solid ${enabled ? '#84E1BC' : '#D1D5DB'}`,
        color: enabled ? '#03543F' : '#6B7280',
      }}
    >
      {enabled ? t('common.true') : t('common.false')}
    </span>
  );
};

const NotificationReviewCard: React.FC<{ title: string; enabled: boolean; value: string }> = ({
  title,
  enabled,
  value,
}) => (
  <div style={{ borderRadius: 8, border: '1px solid #E6EAEB', padding: 12 }}>
    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif", color: '#041620' }}>
      {title}
    </h4>
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#5A6F7C', fontFamily: "'Inter', system-ui, sans-serif" }}>Enabled:</span>
        <EnabledBadge enabled={enabled} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#5A6F7C', fontFamily: "'Inter', system-ui, sans-serif" }}>Value:</span>
        {value !== '—' ? (
          <GreenBadge>{value}</GreenBadge>
        ) : (
          <span style={{ fontSize: 13, color: '#5A6F7C', fontFamily: "'Inter', system-ui, sans-serif" }}>—</span>
        )}
      </div>
    </div>
  </div>
);

export const ReviewStep: React.FC<ReviewStepProps> = ({
  basicInfo,
  categoryOptions,
  uomOptions,
  attributes,
  intakeFields,
  tags,
  enableExpiryAlert,
  expiryDays,
  enableReorderAlert,
  reorderLevel,
  enableMinStockAlert,
  minStockLevel,
}) => {
  const { t } = useTranslation();
  const categoryLabel = basicInfo.category
    ? getOptionLabel(basicInfo.category, categoryOptions)
    : '—';
  const uomLabel = basicInfo.uom ? getOptionLabel(basicInfo.uom, uomOptions) : '—';
  const visibleIntakeFields = intakeFields.filter((field) => field.label.trim());

  return (
    <section
      aria-label={t('inventory.review.ariaLabel')}
      style={{
        background: '#FDFDFD',
        border: '1px solid #E6EAEB',
        borderRadius: 10,
        padding: 'clamp(12px, 2vh, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ borderBottom: '1px solid #E6EAEB', paddingBottom: 10 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#041620',
            lineHeight: '28px',
          }}
        >
          {t('inventory.review.title')}
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
          {t('inventory.review.description')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Basic Information */}
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: '#041620',
            }}
          >
            {t('inventory.review.basicInformation')}
          </h3>
          <div
            style={{
              marginTop: 12,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <InfoItem label={t('inventory.review.nameLabel')} value={basicInfo.name || '—'} />
            <InfoItem label={t('inventory.review.stockUnitLabel')} value={basicInfo.stockUnit || '—'} />
            <InfoItem label={t('inventory.review.categoryLabel')} value={categoryLabel} />
            <InfoItem label={t('inventory.review.uomLabel')} value={uomLabel} />
          </div>
          <div style={{ marginTop: 12 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#5A6F7C',
              }}
            >
              {t('inventory.review.descriptionLabel')}
            </span>
            <div
              style={{
                marginTop: 6,
                padding: 12,
                background: '#ECECEB',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#395362',
              }}
            >
              {basicInfo.description || '—'}
            </div>
          </div>
        </div>

        {/* Attributes */}
        {attributes.length === 0 ? (
          <div style={{ borderRadius: 8, border: '1px solid #E6EAEB', padding: 12 }}>
            <h4
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#041620',
              }}
            >
              {t('inventory.review.attributes')}
            </h4>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif", color: '#5A6F7C' }}>
              —
            </p>
          </div>
        ) : (
          <ReviewPanel title={t('inventory.review.attributes')}>
            <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {attributes.map((attribute) => (
                <GreenBadge key={attribute.id}>
                  {attribute.label}: {attribute.value}
                  {attribute.type && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: '#D1FAE5',
                        color: '#065F46',
                        textTransform: 'capitalize',
                      }}
                    >
                      {attribute.type}
                    </span>
                  )}
                </GreenBadge>
              ))}
            </div>
          </ReviewPanel>
        )}

        {/* Stock Level Properties (intake fields) */}
        {visibleIntakeFields.length === 0 ? (
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#041620',
              }}
            >
              {t('inventory.review.intakeFields')}
            </h3>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 13, fontFamily: "'Inter', system-ui, sans-serif", color: '#5A6F7C' }}>
                {t('inventory.review.noIntakeFields')}
              </span>
            </div>
          </div>
        ) : (
          <ReviewPanel title={t('inventory.review.intakeFields')}>
            <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {visibleIntakeFields.map((field) => (
                <div
                  key={field.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    background: '#FDFDFD',
                    borderRadius: 12,
                    border: '1px solid #B2BCC2',
                    minHeight: 42,
                  }}
                >
                  <span style={reviewCardTextStyle}>{field.label}</span>
                  <TypeBadge>
                    {field.type === 'number'
                      ? t('inventory.properties.typeNumber')
                      : t('inventory.properties.typeText')}
                  </TypeBadge>
                  <RequiredBadge required={field.required} />
                </div>
              ))}
            </div>
          </ReviewPanel>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <ReviewPanel title={t('inventory.review.tagsLabel')}>
            <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
            </div>
          </ReviewPanel>
        )}

        {/* Notifications */}
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: '#041620',
              marginBottom: 12,
            }}
          >
            {t('inventory.review.notifications')}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            <NotificationReviewCard
              title={t('inventory.notifications.expiryTitle')}
              enabled={enableExpiryAlert}
              value={expiryDays ? t('common.days', { count: Number(expiryDays) }) : '—'}
            />
            <NotificationReviewCard
              title={t('inventory.review.reorderLevel')}
              enabled={enableReorderAlert}
              value={reorderLevel || '—'}
            />
            <NotificationReviewCard
              title={t('inventory.review.minStockLevel')}
              enabled={enableMinStockAlert}
              value={minStockLevel || '—'}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
