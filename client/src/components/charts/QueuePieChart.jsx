import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#5777B2", "#6C7790", "#592300", "#17824C", "#C62828"];

function QueuePieChart({ data }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        Queue Distribution
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default QueuePieChart;