import { render, screen } from '@testing-library/react';
import AssignedUsersAvatars from './AssignedUsersAvatars';

describe('AssignedUsersAvatars', () => {
  it('renders an em-dash when count is 0', () => {
    render(<AssignedUsersAvatars count={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders only visible previews when count <= maxAvatars (no overflow badge)', () => {
    const { container } = render(
      <AssignedUsersAvatars
        count={2}
        previews={[
          { id: 'a', url: 'http://a' },
          { id: 'b', url: 'http://b' },
        ]}
      />,
    );
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(container.textContent).not.toMatch(/\+\d/);
  });

  it('renders a +N overflow badge when count > maxAvatars', () => {
    render(
      <AssignedUsersAvatars
        count={10}
        previews={[
          { id: 'a', url: 'http://a' },
          { id: 'b' }, // placeholder swatch — no url branch
          { id: 'c', url: 'http://c' },
        ]}
      />,
    );
    expect(screen.getByText('+7')).toBeInTheDocument();
  });

  it('falls back to initials when a preview has no url but a name', () => {
    render(
      <AssignedUsersAvatars
        count={1}
        previews={[{ id: 'a', name: 'Ada Lovelace' }]}
      />,
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders a "?" swatch when neither url nor name is provided', () => {
    render(
      <AssignedUsersAvatars
        count={1}
        previews={[{ id: 'a' }]}
      />,
    );
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('respects a custom maxAvatars', () => {
    render(
      <AssignedUsersAvatars
        count={5}
        maxAvatars={1}
        previews={[{ id: 'a', url: 'http://a' }]}
      />,
    );
    expect(screen.getByText('+4')).toBeInTheDocument();
  });
});
