interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-xl">
          {icon}
        </div>
      )}
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}