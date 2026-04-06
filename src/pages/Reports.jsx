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
  inquiry: '#9ca3af',
  proposal: '#d1d5db',
  confirmed: '#111827',
  completed: '#6b7280',
  cancelled: '#e5e7eb',
};

const TYPE_COLORS = [
  '#111827', '#374151', '#4b5563', '#6b7280',
  '#9ca3af', '#d1d5db', '#111827', '#374151',
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
          value={formatCurrency(overview?.total_revenue || 0)}
          sub="All time earnings"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Event Value"
          value={formatCurrency(overview?.total_events ? (overview.total_revenue / overview.total_events) : 0)}
          sub="Per event average"
        />
        <StatCard
          icon={CalendarDays}
          label="Total Events"
          value={overview?.total_events || 0}
          sub="All time events"
        />
        <StatCard
          icon={PartyPopper}
          label="Confirmed Events"
          value={overview?.confirmed_count || 0}
          sub="Ready to go"
        />
      </div>

      {/* Revenue by Month */}
      <Card className="animate-fade-in">
        <CardHeader
          title="Revenue by Month"
          subtitle="Monthly revenue breakdown"
          action={
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
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
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                cursor={{ fill: 'rgba(107, 114, 128, 0.05)' }}
              />
              <Bar
                dataKey="revenue"
                fill="#111827"
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
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
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
                  dataKey="event_type"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tickFormatter={capitalize}
                />
                <Tooltip
                  formatter={(value) => [value, 'Events']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {(typeData || []).map((entry, index) => (
                    <Cell
                      key={entry.event_type}
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
              <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
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
                      borderRadius: '8px',
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
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collected</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(overview?.total_revenue || 0)}
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(overview?.outstanding_balance || 0)}
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Collection Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {overview?.total_revenue && overview?.outstanding_balance != null
                ? `${Math.round(
                    (overview.total_revenue /
                      (overview.total_revenue + overview.outstanding_balance)) *
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
