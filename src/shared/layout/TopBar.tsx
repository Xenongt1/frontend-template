import React from 'react';
import { useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

// "Inventory Management" is confirmed from Figma (node 1019-33558).
// Other titles are derived from route — update when those Figma pages are available.
const PAGE_TITLE_KEYS: Record<string, string> = {
  '/dashboard': 'page.dashboard',
  '/inventory': 'page.inventoryManagement',
  '/inventory/edit/:id': 'page.inventoryManagement',
  '/inventory/catalogue': 'page.inventoryManagement',
  '/inventory/register': 'page.inventoryManagement',
  '/inventory/stock': 'page.inventoryManagement',
  '/inventory/warehouse': 'page.inventoryManagement',
  '/production': 'page.production',
  '/suppliers': 'page.suppliers',
  '/orders': 'page.orders',
  '/payments': 'page.payments',
  '/fulfillment': 'page.fulfillment',
  '/reports': 'page.reports',
  '/users': 'page.users',
  '/notifications': 'page.notifications',
  '/iam/roles': 'page.roleManagement',
  '/iam/roles/new': 'page.roleManagement',
  '/iam/roles/:id': 'page.roleManagement',
  '/iam/roles/:id/edit': 'page.roleManagement',
};

const TopBar: React.FC = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const titleKey = PAGE_TITLE_KEYS[pathname];
  const title = titleKey ? t(titleKey) : 'ChainPilot';

  return (
    <header
      style={{
        width: '100%',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingTop: '16px',
        paddingBottom: '16px',
        background: 'var(--Background-General-Light, #FDFDFD)',
        borderBottom: '1px var(--Stroke-Default-Light, #E6EAEB) solid',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Page title — Poppins 500 24px #08283B, line-height: 36px from Figma */}
        <h1
          style={{
            color: 'var(--Body-Text-Primary, #08283B)',
            fontSize: '24px',
            fontFamily: 'Poppins',
            fontWeight: 500,
            lineHeight: '36px',
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Right actions — gap: 24px from Figma */}
        <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '24px', display: 'flex' }}>

          {/* Bell / notification button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.55703 17.4998C8.70332 17.7532 8.91371 17.9636 9.16707 18.1098C9.42042 18.2561 9.70782 18.3331 10.0004 18.3331C10.2929 18.3331 10.5803 18.2561 10.8337 18.1098C11.087 17.9636 11.2974 17.7532 11.4437 17.4998M2.7187 12.7715C2.60984 12.8908 2.538 13.0392 2.51191 13.1986C2.48583 13.358 2.50663 13.5215 2.57179 13.6693C2.63695 13.8171 2.74365 13.9428 2.87891 14.0311C3.01418 14.1193 3.17218 14.1664 3.3337 14.1665H16.667C16.8285 14.1666 16.9866 14.1197 17.1219 14.0316C17.2573 13.9435 17.3641 13.818 17.4294 13.6703C17.4948 13.5226 17.5158 13.3591 17.4899 13.1997C17.464 13.0402 17.3924 12.8918 17.2837 12.7723C16.1754 11.6298 15.0004 10.4157 15.0004 6.6665C15.0004 5.34042 14.4736 4.06865 13.5359 3.13097C12.5982 2.19329 11.3265 1.6665 10.0004 1.6665C8.67429 1.6665 7.40252 2.19329 6.46483 3.13097C5.52715 4.06865 5.00037 5.34042 5.00037 6.6665C5.00037 10.4157 3.82453 11.6298 2.7187 12.7715Z" stroke="#061C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* User dropdown — gap: 8px from Figma */}
          <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '8px', display: 'flex' }}>
            {/* Avatar — 48px, border: 1px #FDFDFD from Figma */}
            <img
              src="https://placehold.co/48x48"
              alt="User avatar"
              style={{
                width: '48px',
                height: '48px',
                position: 'relative',
                borderRadius: '100px',
                border: '1px solid var(--background-general-light, #FDFDFD)',
              }}
            />
            <div
              style={{
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                display: 'inline-flex',
              }}
            >
              {/* Username — Inter 400 16px #08283B from Figma */}
              <div
                style={{
                  color: 'var(--body-text-primary, #08283B)',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  lineHeight: '24px',
                  wordWrap: 'break-word',
                }}
              >
                Bright
              </div>
            </div>
            {/* Chevron down */}
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7 7L13 1" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

        </div>
      </div>
    </header>
  );
};

export default TopBar;
