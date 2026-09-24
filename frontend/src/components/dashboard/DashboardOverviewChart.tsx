import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card } from '../ui/Card';
import { motion } from 'framer-motion';
import api from '../../services/api';

interface ChartDataPoint {
  date: string;
  totalTeam: number;
  activeToday: number;
  checkedIn: number;
}

export const DashboardOverviewChart = () => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSeries, setVisibleSeries] = useState({
    totalTeam: true,
    activeToday: true,
    checkedIn: true
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/admin/stats/history');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch historical stats, using mock data", error);
        // Fallback to mock data if endpoint is not fully ready
        setData(generateMockData());
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const generateMockData = () => {
    const mock = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      mock.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalTeam: 45 + Math.floor(Math.random() * 5),
        activeToday: 30 + Math.floor(Math.random() * 10),
        checkedIn: 25 + Math.floor(Math.random() * 10)
      });
    }
    return mock;
  };

  const toggleSeries = (dataKey: string) => {
    setVisibleSeries(prev => ({
      ...prev,
      [dataKey as keyof typeof visibleSeries]: !prev[dataKey as keyof typeof visibleSeries]
    }));
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => {
          const dataKey = entry.dataKey as keyof typeof visibleSeries;
          const isActive = visibleSeries[dataKey];
          return (
            <div 
              key={`item-${index}`} 
              className={`flex items-center gap-2 cursor-pointer transition-all duration-200 hover:opacity-80 ${isActive ? 'opacity-100' : 'opacity-40 grayscale'}`}
              onClick={() => toggleSeries(dataKey)}
            >
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-sm font-semibold text-text-main">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-sidebar border border-slate-700/50 p-4 rounded-xl shadow-soft-lg min-w-[160px]">
          <p className="text-white font-semibold mb-3 border-b border-white/10 pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                <span className="text-slate-300 flex-1 font-medium">{p.name}:</span>
                <span className="text-white font-bold">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="h-[420px] flex items-center justify-center bg-white border border-slate-100">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6 h-[440px] flex flex-col bg-white border border-slate-100">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-text-main text-lg mb-1">Activity History</h3>
            <p className="text-sm font-medium text-text-secondary">Last 7 days overview</p>
          </div>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6F135" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#C6F135" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCheckedIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8A8A94', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8A8A94', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} 
              />
              <Legend content={renderLegend} verticalAlign="bottom" height={36} />
              
              {visibleSeries.totalTeam && (
                <Area 
                  type="monotone" 
                  dataKey="totalTeam" 
                  name="Total Team" 
                  stroke="#818cf8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={1500}
                />
              )}
              {visibleSeries.activeToday && (
                <Area 
                  type="monotone" 
                  dataKey="activeToday" 
                  name="Active Today" 
                  stroke="#C6F135" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                  animationDuration={1500}
                />
              )}
              {visibleSeries.checkedIn && (
                <Area 
                  type="monotone" 
                  dataKey="checkedIn" 
                  name="Checked In" 
                  stroke="#34d399" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCheckedIn)" 
                  animationDuration={1500}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};
