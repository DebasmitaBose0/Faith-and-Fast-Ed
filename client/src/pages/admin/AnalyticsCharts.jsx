import PropTypes from "prop-types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const AnalyticsCharts = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-150 dark:border-gray-700">
      <h4 className="text-md font-bold mb-3 dark:text-white">Order Performance Overview</h4>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-250 dark:stroke-gray-700" />
            <XAxis dataKey="period" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
            <Legend />
            <Area type="monotone" dataKey="orders" stroke="#8884d8" fillOpacity={1} fill="url(#colorOrders)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

AnalyticsCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default AnalyticsCharts;
