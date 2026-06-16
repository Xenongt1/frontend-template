import React from 'react';
import { Plus } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface EmptyStateButtonProps {
  label: string;
  onClick: () => void;
}

const EmptyStateButton: React.FC<EmptyStateButtonProps> = ({ label, onClick }) => (
  <Button
    variant="primary"
    onClick={onClick}
    leftIcon={<Plus size={20} strokeWidth={2} aria-hidden="true" />}
  >
    {label}
  </Button>
);

export default EmptyStateButton;
