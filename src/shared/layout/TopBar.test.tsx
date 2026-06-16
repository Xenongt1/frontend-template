import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopBar from './TopBar';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TopBar />
    </MemoryRouter>
  );
}

describe('TopBar', () => {
  it('renders the inventory title on /inventory/catalogue', () => {
    renderAt('/inventory/catalogue');
    expect(
      screen.getByRole('heading', { name: /inventory management/i })
    ).toBeInTheDocument();
  });

  it('renders the dashboard title on /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument();
  });

  it('renders all the chrome (avatar, bell button, user name)', () => {
    renderAt('/inventory/catalogue');
    expect(screen.getByAltText(/user avatar/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('falls back to "ChainPilot" on an unknown route', () => {
    renderAt('/some/unmapped/route');
    expect(screen.getByRole('heading', { name: /chainpilot/i })).toBeInTheDocument();
  });
});
