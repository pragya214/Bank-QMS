import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function HourlyBarChart({ data }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Hourly Load</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#5777B2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HourlyBarChart;