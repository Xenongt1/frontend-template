const Toggle: React.FC<{
  checked: boolean;
  label: string;
  onToggle: () => void;
}> = ({ checked, label, onToggle }) => (
  <button
    type="button"
    aria-pressed={checked}
    onClick={onToggle}
    className="border-none bg-transparent p-0 inline-flex items-center gap-2 cursor-pointer shrink-0"
  >
    <span
      aria-hidden="true"
      className={[
        'w-10 h-5 rounded-full relative inline-block shrink-0',
        'transition-colors duration-150',
        checked ? 'bg-brand-navy' : 'bg-canvas-200',
      ].join(' ')}
    >
      <span
        className={[
          'absolute w-4 h-4 rounded-full bg-canvas-50 top-0.5 transition-[left] duration-150',
          checked ? 'left-[22px]' : 'left-0.5',
        ].join(' ')}
      />
    </span>
    <span className="font-inter text-sm font-medium text-text-primary whitespace-nowrap">
      {label}
    </span>
  </button>
);
export default Toggle;
