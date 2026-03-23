type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
};

export function PrescriptionUpload({ file, onChange, label }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
      />
      {file && (
        <p className="text-xs text-gray-500">Fichier: {file.name}</p>
      )}
    </div>
  );
}
