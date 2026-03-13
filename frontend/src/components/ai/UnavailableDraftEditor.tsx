type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  note: string;
};

export function UnavailableDraftEditor({ value, onChange, label, note }: Props) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900">{label}</h3>
      <textarea
        className="mt-2 w-full min-h-[120px] border border-gray-200 rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-2">{note}</p>
    </div>
  );
}
