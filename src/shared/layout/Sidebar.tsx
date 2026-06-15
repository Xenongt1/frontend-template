import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const navActive = (pathname: string, to: string): boolean =>
  pathname === to || pathname.startsWith(`${to}/`);

const IAMIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SuppliersIcon = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 15V3C13 2.46957 12.7893 1.96086 12.4142 1.58579C12.0391 1.21071 11.5304 1 11 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V14C1 14.2652 1.10536 14.5196 1.29289 14.7071C1.48043 14.8946 1.73478 15 2 15H4M4 15C4 16.1046 4.89543 17 6 17C7.10457 17 8 16.1046 8 15M4 15C4 13.8954 4.89543 13 6 13C7.10457 13 8 13.8954 8 15M14 15H8M14 15C14 16.1046 14.8954 17 16 17C17.1046 17 18 16.1046 18 15M14 15C14 13.8954 14.8954 13 16 13C17.1046 13 18 13.8954 18 15M18 15H20C20.2652 15 20.5196 14.8946 20.7071 14.7071C20.8946 14.5196 21 14.2652 21 14V10.35C20.9996 10.1231 20.922 9.90301 20.78 9.726L17.3 5.376C17.2065 5.25888 17.0878 5.16428 16.9528 5.0992C16.8178 5.03412 16.6699 5.00021 16.52 5H13" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersNavIcon = () => (
  <svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.4167 15.75V14.0833C12.4167 13.1993 12.0655 12.3514 11.4404 11.7263C10.8152 11.1012 9.96739 10.75 9.08333 10.75H4.08333C3.19928 10.75 2.35143 11.1012 1.72631 11.7263C1.10119 12.3514 0.75 13.1993 0.75 14.0833V15.75M12.4167 0.856608C13.1315 1.04192 13.7645 1.45933 14.2164 2.04333C14.6683 2.62733 14.9135 3.34485 14.9135 4.08327C14.9135 4.8217 14.6683 5.53922 14.2164 6.12322C13.7645 6.70722 13.1315 7.12463 12.4167 7.30994M17.4167 15.7499V14.0832C17.4161 13.3447 17.1703 12.6272 16.7178 12.0435C16.2653 11.4598 15.6318 11.0429 14.9167 10.8582M9.91667 4.08333C9.91667 5.92428 8.42428 7.41667 6.58333 7.41667C4.74238 7.41667 3.25 5.92428 3.25 4.08333C3.25 2.24238 4.74238 0.75 6.58333 0.75C8.42428 0.75 9.91667 2.24238 9.91667 4.08333Z" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RolesIcon = () => (
  <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.83 5.78a.42.42 0 1 0 0-.83.42.42 0 0 0 0 .83z" fill="#08283B"/>
    <path d="M1.24 13.63a1.6 1.6 0 0 0-.49 1.18v1.8c0 .22.09.43.24.59a.84.84 0 0 0 .59.24h2.5a.84.84 0 0 0 .59-.24.84.84 0 0 0 .24-.59v-.83c0-.22.09-.43.24-.59a.84.84 0 0 1 .59-.24h.84a.84.84 0 0 0 .59-.24.84.84 0 0 0 .24-.59v-.83c0-.22.09-.43.25-.59a.84.84 0 0 1 .58-.25h.15a1.66 1.66 0 0 0 1.18-.49l.68-.68a4.92 4.92 0 0 0 3.58 0 4.92 4.92 0 0 0 2.79-2.78 4.92 4.92 0 0 0 0-3.49 4.92 4.92 0 0 0-2.79-2.78 4.92 4.92 0 0 0-3.49 0 4.92 4.92 0 0 0-2.79 2.78 4.92 4.92 0 0 0 0 3.59L1.24 13.63z" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.83 5.78a.42.42 0 1 0 0-.83.42.42 0 0 0 0 .83z" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MovementsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1H2C1.44772 1 1 1.44772 1 2V7C1 7.55228 1.44772 8 2 8H7C7.55228 8 8 7.55228 8 7V2C8 1.44772 7.55228 1 7 1Z" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 1H13C12.4477 1 12 1.44772 12 2V7C12 7.55228 12.4477 8 13 8H18C18.5523 8 19 7.55228 19 7V2C19 1.44772 18.5523 1 18 1Z" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 12H13C12.4477 12 12 12.4477 12 13V18C12 18.5523 12.4477 19 13 19H18C18.5523 19 19 18.5523 19 18V13C19 12.4477 18.5523 12 18 12Z" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 12H2C1.44772 12 1 12.4477 1 13V18C1 18.5523 1.44772 19 2 19H7C7.55228 19 8 18.5523 8 18V13C8 12.4477 7.55228 12 7 12Z" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InventoryIcon = () => (
  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.08333 14.6379L5.775 16.6213C5.51578 16.777 5.21907 16.8593 4.91667 16.8593C4.61426 16.8593 4.31755 16.777 4.05833 16.6213L1.55833 15.1213C1.3123 14.9735 1.10861 14.7646 0.96699 14.5149C0.825372 14.2653 0.750629 13.9833 0.75 13.6963V10.9963C0.750629 10.7092 0.825372 10.4273 0.96699 10.1776C1.10861 9.92794 1.3123 9.71909 1.55833 9.57127L4.91667 7.55461M9.08333 14.6379V10.0546M9.08333 14.6379L12.3917 16.6213C12.6509 16.777 12.9476 16.8593 13.25 16.8593C13.5524 16.8593 13.8491 16.777 14.1083 16.6213L16.6083 15.1213C16.8544 14.9735 17.0581 14.7646 17.1997 14.5149C17.3413 14.2653 17.416 13.9833 17.4167 13.6963V10.9963C17.416 10.7092 17.3413 10.4273 17.1997 10.1776C17.0581 9.92794 16.8544 9.71909 16.6083 9.57127L13.25 7.55461M9.08333 10.0546L4.91667 7.55461M9.08333 10.0546L4.91667 12.5545M9.08333 10.0546L13.25 7.55461M9.08333 10.0546L13.25 12.5546M9.08333 10.0546L9.08334 5.47119M4.91667 7.55461V3.91302C4.9173 3.62599 4.99204 3.344 5.13366 3.09434C5.27527 2.84468 5.47896 2.63583 5.725 2.48802L8.225 0.988016C8.48422 0.832277 8.78093 0.75 9.08333 0.75C9.38574 0.75 9.68245 0.832277 9.94167 0.988016L12.4417 2.48802C12.6877 2.63583 12.8914 2.84468 13.033 3.09434C13.1746 3.344 13.2494 3.62599 13.25 3.91302V7.55461M4.91667 12.5545L0.966675 10.1795M4.91667 12.5545L4.91667 16.8629M13.25 12.5546L17.2 10.1795M13.25 12.5546V16.8629M9.08334 5.47119L5.13334 3.09619M9.08334 5.47119L13.0333 3.09619" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CatalogueIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="22.08" x2="12" y2="12" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.66699 9.99955C1.6666 10.1589 1.71192 10.3151 1.79759 10.4495C1.88326 10.5839 2.00568 10.6909 2.15033 10.7579L9.31699 14.0162C9.533 14.114 9.76738 14.1646 10.0045 14.1646C10.2416 14.1646 10.476 14.114 10.692 14.0162L17.842 10.7662C17.9895 10.6999 18.1145 10.5921 18.2018 10.456C18.2891 10.3199 18.3349 10.1613 18.3337 9.99955M1.66699 14.1662C1.6666 14.3256 1.71192 14.4818 1.79759 14.6162C1.88326 14.7506 2.00568 14.8576 2.15033 14.9246L9.31699 18.1829C9.533 18.2807 9.76738 18.3313 10.0045 18.3313C10.2416 18.3313 10.476 18.2807 10.692 18.1829L17.842 14.9329C17.9895 14.8666 18.1145 14.7588 18.2018 14.6227C18.2891 14.4865 18.3349 14.3279 18.3337 14.1662M10.692 1.81631C10.4749 1.71727 10.239 1.66602 10.0003 1.66602C9.76166 1.66602 9.52579 1.71727 9.30865 1.81631L2.16699 5.06631C2.01911 5.13152 1.89339 5.23831 1.80512 5.37369C1.71686 5.50907 1.66987 5.6672 1.66987 5.82881C1.66987 5.99043 1.71686 6.14855 1.80512 6.28393C1.89339 6.41931 2.01911 6.52611 2.16699 6.59131L9.31699 9.84965C9.53412 9.94869 9.77 9.99994 10.0087 9.99994C10.2473 9.99994 10.4832 9.94869 10.7003 9.84965L17.8503 6.59965C17.9982 6.53444 18.1239 6.42765 18.2122 6.29227C18.3004 6.15688 18.3474 5.99876 18.3474 5.83715C18.3474 5.67553 18.3004 5.51741 18.2122 5.38203C18.1239 5.24665 17.9982 5.13985 17.8503 5.07465L10.692 1.81631Z" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StockLocationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6663 8.33366C16.6663 12.4945 12.0505 16.8278 10.5005 18.1662C10.3561 18.2747 10.1803 18.3335 9.99967 18.3335C9.81901 18.3335 9.64324 18.2747 9.49884 18.1662C7.94884 16.8278 3.33301 12.4945 3.33301 8.33366C3.33301 6.56555 4.03539 4.86986 5.28563 3.61961C6.53587 2.36937 8.23156 1.66699 9.99967 1.66699C11.7678 1.66699 13.4635 2.36937 14.7137 3.61961C15.964 4.86986 16.6663 6.56555 16.6663 8.33366Z" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.99967 10.8337C11.3804 10.8337 12.4997 9.71437 12.4997 8.33366C12.4997 6.95295 11.3804 5.83366 9.99967 5.83366C8.61896 5.83366 7.49967 6.95295 7.49967 8.33366C7.49967 9.71437 8.61896 10.8337 9.99967 10.8337Z" stroke="#08283B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
  >
    <path d="M13 7L7 1L1 7" stroke="#08283B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);
  const [iamOpen, setIamOpen] = useState(true);
  const { t } = useTranslation();
  const { location: { pathname } } = useRouterState();

  return (
    <div style={{
      width: collapsed ? 76 : 300,
      height: '100%',
      padding: 12,
      background: 'var(--Background-General-Light, #FDFDFD)',
      borderRight: '1px var(--Stroke-Default-Light, #E6EAEB) solid',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      transition: 'width 0.2s ease',
      overflow: 'visible',
    }}>

      {/* ── Collapse button — protrudes from right edge of sidebar ── */}
      <button
        type="button"
        onClick={() => setCollapsed(prev => !prev)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          left: collapsed ? 76 : 300,
          top: 31,
          padding: 4,
          background: 'var(--Buttons-Filled-Dark-Blue-Default, #08283B)',
          border: 'none',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'left 0.2s ease',
        }}
      >
        <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
          >
            <path d="M4.75 8.75L0.75 4.75L4.75 0.75" stroke="var(--Buttons-Filled-Dark-Blue-Icon, #FDFDFD)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div style={{
        paddingTop: 24,
        paddingBottom: 20,
        paddingLeft: 8,
        paddingRight: 8,
        borderBottom: '1px var(--Stroke-Default-Light, #E6EAEB) solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10,
        flexShrink: 0,
      }}>
        <svg width="20" height="23" viewBox="0 0 20 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M8.50229 0.400699C8.95783 0.138189 9.47437 0 10.0002 0C10.526 0 11.0425 0.138189 11.498 0.400699L11.5002 0.401924L18.4963 4.39971L18.5002 4.40192C18.9558 4.66497 19.3342 5.0432 19.5975 5.49867C19.8608 5.95414 19.9996 6.47084 20.0002 6.99692V14.999C19.9996 15.5251 19.8608 16.0418 19.5975 16.4972C19.3342 16.9527 18.9558 17.3309 18.5002 17.594L18.4963 17.5962L11.5002 21.594L11.4982 21.5951C11.0427 21.8577 10.526 21.9959 10.0002 21.9959C9.4743 21.9959 8.95768 21.8577 8.50209 21.5951L8.50016 21.594L1.50403 17.5962L1.50017 17.594C1.04456 17.3309 0.666136 16.9527 0.402858 16.4972C0.13958 16.0418 0.000705689 15.5251 0.000166062 14.999V6.99692C0.000705689 6.47084 0.13958 5.95414 0.402858 5.49867C0.666136 5.0432 1.04456 4.66497 1.50017 4.40192L1.50403 4.39971L8.50229 0.400699ZM10.0002 2C9.82463 2 9.65218 2.04621 9.50016 2.13397L9.4963 2.13619L2.49858 6.13489C2.34742 6.22254 2.22185 6.34826 2.1344 6.49956C2.04671 6.65126 2.00042 6.82333 2.00017 6.99854V14.9974C2.00042 15.1726 2.04671 15.3446 2.1344 15.4963C2.22184 15.6476 2.34738 15.7733 2.49851 15.861L2.50017 15.8619L9.4963 19.8597L9.50016 19.8619C9.65219 19.9497 9.82463 19.9959 10.0002 19.9959C10.1757 19.9959 10.3481 19.9497 10.5002 19.8619L10.504 19.8597L17.5002 15.8619L17.5018 15.861C17.6529 15.7733 17.7785 15.6476 17.8659 15.4963C17.9537 15.3445 18 15.1723 18.0002 14.9969V6.99898C18 6.82361 17.9537 6.65138 17.8659 6.49956C17.7785 6.34825 17.6529 6.22252 17.5017 6.13488L17.5002 6.13398L10.504 2.13619L10.5002 2.13397C10.3481 2.04621 10.1757 2 10.0002 2Z" fill="#08283B"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M4.6343 2.7077C4.9106 2.2295 5.52224 2.06582 6.00044 2.34211L10.0002 4.65306L13.9999 2.34211C14.4781 2.06582 15.0897 2.2295 15.366 2.7077C15.6423 3.18591 15.4786 3.79755 15.0004 4.07384L10.5004 6.67384C10.1909 6.85269 9.80943 6.85269 9.49989 6.67384L4.99989 4.07384C4.52169 3.79755 4.35801 3.18591 4.6343 2.7077Z" fill="#08283B"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M0.134302 10.4977C0.410597 10.0195 1.02224 9.85578 1.50044 10.1321L6.00044 12.7321C6.30969 12.9108 6.50017 13.2408 6.50017 13.5979V18.7879C6.50017 19.3402 6.05245 19.7879 5.50017 19.7879C4.94788 19.7879 4.50017 19.3402 4.50017 18.7879V14.1751L0.499889 11.8638C0.0216849 11.5875 -0.141994 10.9759 0.134302 10.4977Z" fill="#08283B"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M19.866 10.4977C20.1423 10.9759 19.9786 11.5875 19.5004 11.8638L15.5002 14.1751V18.7879C15.5002 19.3402 15.0525 19.7879 14.5002 19.7879C13.9479 19.7879 13.5002 19.3402 13.5002 18.7879V13.5979C13.5002 13.2408 13.6906 12.9108 13.9999 12.7321L18.4999 10.1321C18.9781 9.85578 19.5897 10.0195 19.866 10.4977Z" fill="#08283B"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M0.404559 5.45725C0.681101 4.97919 1.29283 4.81583 1.77089 5.09237L10.0002 9.85272L18.2294 5.09237C18.7075 4.81583 19.3192 4.97919 19.5958 5.45725C19.8723 5.93532 19.709 6.54704 19.2309 6.82359L10.5009 11.8736C10.1911 12.0528 9.80921 12.0528 9.49944 11.8736L0.769443 6.82359C0.291381 6.54704 0.128017 5.93532 0.404559 5.45725Z" fill="#08283B"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M10.0002 9.99793C10.5525 9.99793 11.0002 10.4456 11.0002 10.9979V21.0779C11.0002 21.6302 10.5525 22.0779 10.0002 22.0779C9.44788 22.0779 9.00017 21.6302 9.00017 21.0779V10.9979C9.00017 10.4456 9.44788 9.99793 10.0002 9.99793Z" fill="#08283B"/>
        </svg>
        {!collapsed && (
          <div style={{
            color: 'var(--Logo-Dark-Blue, #08283B)',
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: 600,
            lineHeight: '24px',
          }}>
            Chain Pilot
          </div>
        )}
      </div>

      {/* ── Nav sections ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 13, paddingTop: 16, overflowY: 'auto' }}>

        {/* Main Menu */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!collapsed && (
            <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 1, paddingBottom: 1 }}>
              <span style={{ color: 'var(--Body-Text-Tertiary, #5A6F7C)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                {t('nav.mainMenu')}
              </span>
            </div>
          )}

          {/* Dashboard */}
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ padding: 8 }}>
              <div style={{
                paddingLeft: collapsed ? 8 : 12,
                paddingRight: collapsed ? 8 : 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 8,
                background: navActive(pathname, '/dashboard') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
              }}>
                <DashboardIcon />
                {!collapsed && (
                  <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                    {t('nav.dashboard')}
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* IAM (expandable) */}
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={() => setIamOpen(prev => !prev)}
              aria-expanded={iamOpen}
              style={{
                paddingLeft: collapsed ? 8 : 12,
                paddingRight: collapsed ? 8 : 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign: 'left',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <IAMIcon />
              {!collapsed && (
                <span className="flex items-center gap-2 flex-1 justify-between">
                  <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                    {t('nav.iam')}
                  </span>
                  <ChevronIcon open={iamOpen} />
                </span>
              )}
            </button>

            {iamOpen && !collapsed && (
              <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link to="/users" style={{ textDecoration: 'none' }}>
                  <div style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 8,
                    background: navActive(pathname, '/users') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <UsersNavIcon />
                    <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                      {t('nav.users')}
                    </span>
                  </div>
                </Link>

                <Link to="/iam/roles" style={{ textDecoration: 'none' }}>
                  <div style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 8,
                    background: navActive(pathname, '/iam/roles') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <RolesIcon />
                    <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                      {t('nav.roleManagement')}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Operations */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!collapsed && (
            <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 1, paddingBottom: 1 }}>
              <span style={{ color: 'var(--Body-Text-Tertiary, #5A6F7C)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                {t('nav.operations')}
              </span>
            </div>
          )}

          {/* Inventory (expandable) */}
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={() => setInventoryOpen(prev => !prev)}
              aria-expanded={inventoryOpen}
              style={{
                paddingLeft: collapsed ? 8 : 12,
                paddingRight: collapsed ? 8 : 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign: 'left',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <InventoryIcon />
              {!collapsed && (
                <span className="flex items-center gap-2 flex-1 justify-between">
                  <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                    {t('nav.inventory')}
                  </span>
                  <ChevronIcon open={inventoryOpen} />
                </span>
              )}
            </button>

            {inventoryOpen && !collapsed && (
              <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>

                <Link to="/inventory/catalogue" style={{ textDecoration: 'none' }}>
                  <div style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 8,
                    background: navActive(pathname, '/inventory/catalogue') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <CatalogueIcon />
                    <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                      {t('nav.catalogue')}
                    </span>
                  </div>
                </Link>

                <Link to="/inventory/stock" style={{ textDecoration: 'none' }}>
                  <div style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 8,
                    background: pathname === '/inventory/stock' ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <StockIcon />
                    <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                      {t('nav.stock')}
                    </span>
                  </div>
                </Link>

                <Link to="/inventory/stock-locations" style={{ textDecoration: 'none' }}>
                  <div style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 8,
                    background: navActive(pathname, '/inventory/stock-locations') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <StockLocationsIcon />
                    <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                      {t('nav.stockLocations')}
                    </span>
                  </div>
                </Link>

                <Link to="/inventory/movements" style={{ textDecoration: 'none' }}>
                  <div style={{
                    paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                    borderRadius: 8,
                    background: navActive(pathname, '/inventory/movements') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <MovementsIcon />
                    <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                      {t('nav.movements')}
                    </span>
                  </div>
                </Link>

              </div>
            )}
          </div>

          {/* Suppliers */}
          <Link to="/suppliers" style={{ textDecoration: 'none' }}>
            <div style={{ padding: 8 }}>
              <div style={{
                paddingLeft: collapsed ? 8 : 12,
                paddingRight: collapsed ? 8 : 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 8,
                background: navActive(pathname, '/suppliers') ? 'var(--Background-Sidepanel-Active, #CDE6FC)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
              }}>
                <SuppliersIcon />
                {!collapsed && (
                  <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                    {t('nav.suppliers')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>

      </div>

      {/* ── User footer ───────────────────────────────────────────────── */}
      <div style={{
        paddingTop: 12,
        paddingBottom: 12,
        borderTop: '1px var(--Stroke-Default-Light, #E6EAEB) solid',
        flexShrink: 0,
      }}>
        <div style={{
          paddingLeft: collapsed ? 8 : 16,
          paddingRight: collapsed ? 8 : 16,
          paddingTop: 8,
          paddingBottom: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
        }}>
          <img
            style={{ width: 32, height: 32, borderRadius: 100, flexShrink: 0 }}
            src="https://placehold.co/32x32"
            alt={t('nav.userAvatarAlt')}
          />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--Body-Text-Primary, #08283B)', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, lineHeight: '24px' }}>
                Ruth Gingo
              </span>
              <span style={{ color: 'var(--Header-Text-Secondary, #395362)', fontSize: 14, fontFamily: 'Inter', fontWeight: 400, lineHeight: '21px' }}>
                ruth.gingo@amalitech.com
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
