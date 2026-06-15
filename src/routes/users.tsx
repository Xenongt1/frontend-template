import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  return (
    <div style={{ padding: 32, fontFamily: 'Inter' }}>
      <p style={{ color: '#6B7A85', fontSize: 13 }}>Users — coming soon</p>
    </div>
  );
}
