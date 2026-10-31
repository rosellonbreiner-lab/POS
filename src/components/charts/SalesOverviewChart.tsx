"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface SalesChartProps {
  data: {
    day: string;
    ventas: number;
    utilidad: number;
  }[];
}

export function SalesOverviewChart({ data }: SalesChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5AA9E6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#5AA9E6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUtilidad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis 
            dataKey="day" 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false} 
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false} 
            tickFormatter={(val) => `$${val / 1000}k`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "rgba(11, 13, 18, 0.95)",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              backdropFilter: "blur(12px)",
              color: "#F3F4F6",
              fontSize: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            }}
            formatter={(value) => [
              `$${Number(value || 0).toLocaleString("es-CO")} COP`,
            ]}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            name="Ventas"
            stroke="#5AA9E6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVentas)"
          />
          <Area
            type="monotone"
            dataKey="utilidad"
            name="Utilidad"
            stroke="#22D3EE"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUtilidad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
