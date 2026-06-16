import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

function renderSidebar(path = '/dashboard') {
  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>
  );
  // Sidebar starts collapsed; expand it so labels are visible.
  fireEvent.click(screen.getByRole('button', { name: /expand sidebar/i }));
  return result;
}

describe('Sidebar', () => {
  it('renders all top-level nav labels', () => {
    renderSidebar();
    expect(screen.getByText(/main menu/i)).toBeInTheDocument();
    expect(screen.getByText(/^dashboard$/i)).toBeInTheDocument();
    expect(screen.getByText(/operations/i)).toBeInTheDocument();
    expect(screen.getByText(/^inventory$/i)).toBeInTheDocument();
  });

  it('renders inventory sub-items because the section is open by default', () => {
    renderSidebar();
    expect(screen.getByText(/catalogue/i)).toBeInTheDocument();
    expect(screen.getByText(/^stocks$/i)).toBeInTheDocument();
    expect(screen.getByText(/^stock locations$/i)).toBeInTheDocument();
  });

  it('points NavLinks at the expected routes', () => {
    renderSidebar();
    const catalogueLink = screen.getByRole('link', { name: /catalogue/i });
    expect(catalogueLink).toHaveAttribute('href', '/inventory/catalogue');

    const stockLink = screen.getByRole('link', { name: /^stocks$/i });
    expect(stockLink).toHaveAttribute('href', '/inventory/stock');

    const stockLocationsLink = screen.getByRole('link', { name: /^stock locations$/i });
    expect(stockLocationsLink).toHaveAttribute('href', '/inventory/stock-locations');

    const dashboardLink = screen.getByRole('link', { name: /^dashboard$/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('collapses the inventory sub-menu when the header is clicked', () => {
    renderSidebar();
    expect(screen.getByText(/catalogue/i)).toBeInTheDocument();

    // The "Inventory" row in the Operations section is the expand/collapse toggle.
    fireEvent.click(screen.getByText(/^inventory$/i));

    expect(screen.queryByText(/catalogue/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^stocks$/i)).not.toBeInTheDocument();
  });

  it('renders the user avatar with localised alt text', () => {
    renderSidebar();
    expect(screen.getByAltText(/user avatar/i)).toBeInTheDocument();
  });
});
