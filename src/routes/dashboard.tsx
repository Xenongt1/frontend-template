import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div style={{ padding: 32, fontFamily: 'Inter' }}>
      <p style={{ color: '#6B7A85', fontSize: 13 }}>Dashboard — coming soon</p>
    </div>
  );
}
