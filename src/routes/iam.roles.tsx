import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/iam/roles')({
  component: RolesPage,
});

function RolesPage() {
  return (
    <div style={{ padding: 32, fontFamily: 'Inter' }}>
      <p style={{ color: '#6B7A85', fontSize: 13 }}>Role Management — coming soon</p>
    </div>
  );
}
