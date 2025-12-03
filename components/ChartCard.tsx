interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">{title}</h3>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
