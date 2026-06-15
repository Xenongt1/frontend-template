const Toggle: React.FC<{
  checked: boolean;
  label: string;
  onToggle: () => void;
}> = ({ checked, label, onToggle }) => (
  <button
    type="button"
    aria-pressed={checked}
    onClick={onToggle}
    style={{
      border: 'none',
      background: 'transparent',
      padding: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    <span
      aria-hidden="true"
      style={{
        width: 40,
        height: 20,
        borderRadius: 999,
        background: checked ? '#08283B' : '#ECECEB',
        position: 'relative',
        display: 'inline-block',
        transition: 'background 0.15s ease',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          background: '#FDFDFD',
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          transition: 'left 0.15s ease',
        }}
      />
    </span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#08283B',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  </button>
);
export default Toggle;
