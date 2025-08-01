interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-5 flex items-center">
    <div className={`text-3xl mr-4 ${color}`}>
      <i className={icon}></i>
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatCard;