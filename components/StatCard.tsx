interface StatCardProps {
  title: string;
  value: string | number;
  className?: string;
}

export default function StatCard({ title, value, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <h3 className="text-[#5a5a5a] text-sm font-medium mb-3">{title}</h3>
      <div className="flex items-center mb-4">
        <div className="w-12 h-1 bg-[#1a1a1a] rounded"></div>
      </div>
      <p className="text-3xl font-bold text-[#1a1a1a]">{value}</p>
    </div>
  );
}
