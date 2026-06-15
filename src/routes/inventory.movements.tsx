import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/inventory/movements')({
  component: MovementsPage,
});

function MovementsPage() {
  return (
    <div style={{ padding: 32, fontFamily: 'Inter' }}>
      <p style={{ color: '#6B7A85', fontSize: 13 }}>Movements — coming soon</p>
    </div>
  );
}
