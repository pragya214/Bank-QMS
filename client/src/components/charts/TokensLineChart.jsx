import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function TokensLineChart({ data }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        Tokens Over Time
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#5777B2"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TokensLineChart;