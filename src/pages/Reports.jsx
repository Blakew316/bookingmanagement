import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  CalendarDays,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  PartyPopper,
} from 'lucide-react';

import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { formatCurrency, capitalize } from '../lib/formatters';
import { STATUS_COLORS } from '../lib/constants';

const PIE_COLORS = {
  inquiry: '#60a5fa',
  proposal: '#fbbf24',
  confirmed: '#34d399',
  completed: '#9ca3af',
  cancelled: '#f87171',
};

const TYPE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
];

export default function Reports() {
  const { data: overview, loading: overviewLoading } = useApi('/reports/overview');
  const { data: revenueData, loading: revenueLoading } = useApi('/reports/revenue-by-month');
  const { data: typeData, loading: typeLoading } = useApi('/reports/events-by-type');
  const { data: statusData, loading: statusLoading } = useApi('/reports/events-by-status');

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Comprehensive insights into your event business.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(overview?.totalRevenue || 0)}
          sub="All time earnings"
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Event Value"
          value={formatCurrency(overview?.avgEventValue || 0)}
          sub="Per event average"
          gradient="from-indigo-600 to-purple-600"
        />
        <StatCard
          icon={CalendarDays}
          label="Total Events"
          value={overview?.totalEvents || 0}
          sub="All time events"
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={PartyPopper}
          label="Completed Events"
          value={overview?.completedEvents || 0}
          sub="Successfully delivered"
          gradient="from-rose-500 to-pink-500"
        />
      </div>

      {/* Revenue by Month */}
      <Card className="animate-fade-in">
        <CardHeader
          title="Revenue by Month"
          subtitle="Monthly revenue breakdown"
          action={
            <div className="flex items-center gap-1.5 text-sm text-indigo-600 font-medium">
              <BarChart3 className="w-4 h-4" />
              <span>Bar Chart</span>
            </div>
          }
        />
        {revenueLoading ? (
          <div className="flex items-center justify-center h-80">
            <LoadingSpinner />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueData || []} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              />
              <Bar
                dataKey="revenue"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <Card className="animate-fade-in">
          <CardHeader
            title="Events by Type"
            subtitle="Distribution across event types"
            action={
              <div className="flex items-center gap-1.5 text-sm text-purple-600 font-medium">
                <BarChart3 className="w-4 h-4" />
              </div>
            }
          />
          {typeLoading ? (
            <div className="flex items-center justify-center h-72">
              <LoadingSpinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={typeData || []}
                layout="vertical"
                barCategoryGap="15%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tickFormatter={capitalize}
                />
                <Tooltip
                  formatter={(value) => [value, 'Events']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {(typeData || []).map((entry, index) => (
                    <Cell
                      key={entry.type}
                      fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Events by Status - Donut */}
        <Card className="animate-fade-in">
          <CardHeader
            title="Events by Status"
            subtitle="Current status distribution"
            action={
              <div className="flex items-center gap-1.5 text-sm text-teal-600 font-medium">
                <PieChartIcon className="w-4 h-4" />
              </div>
            }
          />
          {statusLoading ? (
            <div className="flex items-center justify-center h-72">
              <LoadingSpinner />
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    dataKey="count"
                    nameKey="status"
                    paddingAngle={3}
                  >
                    {(statusData || []).map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={PIE_COLORS[entry.status] || '#d1d5db'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, capitalize(name)]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    formatter={capitalize}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Payment Collection Summary */}
      <Card className="animate-fade-in">
        <CardHeader
          title="Payment Collection Summary"
          subtitle="Overview of payment statuses across events"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-emerald-50 rounded-xl">
            <p className="text-sm font-medium text-emerald-700">Collected</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {formatCurrency(overview?.totalRevenue || 0)}
            </p>
          </div>
          <div className="text-center p-6 bg-amber-50 rounded-xl">
            <p className="text-sm font-medium text-amber-700">Outstanding</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">
              {formatCurrency(overview?.outstandingBalance || 0)}
            </p>
          </div>
          <div className="text-center p-6 bg-indigo-50 rounded-xl">
            <p className="text-sm font-medium text-indigo-700">Collection Rate</p>
            <p className="text-2xl font-bold text-indigo-900 mt-1">
              {overview?.totalRevenue && overview?.outstandingBalance != null
                ? `${Math.round(
                    (overview.totalRevenue /
                      (overview.totalRevenue + overview.outstandingBalance)) *
                      100
                  )}%`
                : '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
