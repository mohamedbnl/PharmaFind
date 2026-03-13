type Props = {
  summary: string;
  title: string;
};

export function AISummaryCard({ summary, title }: Props) {
  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-700 mt-2">{summary}</p>
    </div>
  );
}
