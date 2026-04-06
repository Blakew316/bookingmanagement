import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  CalendarDays,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { formatCurrency, formatDate, formatTime, capitalize } from '../lib/formatters';
import { STATUS_COLORS } from '../lib/constants';

const PIE_COLORS = {
  inquiry: '#60a5fa',
  proposal: '#fbbf24',
  confirmed: '#34d399',
  completed: '#9ca3af',
  cancelled: '#f87171',
};

export default function Dashboard() {
  const { data: overview, loading: overviewLoading } = useApi('/reports/overview');
  const { data: revenueData, loading: revenueLoading } = useApi('/reports/revenue-by-month');
  const { data: statusData, loading: statusLoading } = useApi('/reports/events-by-status');
  const { data: recentEvents, loading: eventsLoading } = useApi('/events?limit=8');
  const { data: upcomingEvents, loading: upcomingLoading } = useApi('/reports/upcoming');

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your event overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(overview?.total_revenue || 0)}
          sub="All time earnings"
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          icon={Clock}
          label="Outstanding Balance"
          value={formatCurrency(overview?.outstanding_balance || 0)}
          sub="Pending payments"
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={overview?.upcoming_count || 0}
          sub="Next 30 days"
          gradient="from-indigo-600 to-purple-600"
        />
        <StatCard
          icon={Users}
          label="Total Events"
          value={overview?.total_events || 0}
          sub="Active contacts"
          gradient="from-rose-500 to-pink-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 animate-fade-in">
          <CardHeader
            title="Revenue Overview"
            subtitle="Monthly revenue trend"
            action={
              <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </div>
            }
          />
          {revenueLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData || []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Events by Status - Pie Chart */}
        <Card className="animate-fade-in">
          <CardHeader title="Events by Status" subtitle="Current distribution" />
          {statusLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {(statusData || []).map((entry) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[entry.status] || '#d1d5db' }}
                    />
                    {capitalize(entry.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events Table */}
        <Card className="lg:col-span-2 animate-fade-in" padding={false}>
          <div className="p-6 pb-0">
            <CardHeader
              title="Recent Events"
              subtitle="Latest event activity"
              action={
                <Link to="/events">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              }
            />
          </div>
          {eventsLoading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Event
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Contact
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(recentEvents || []).map((event) => (
                    <tr
                      key={event.id}
                      className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/events/${event.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.contact_first_name} {event.contact_last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(event.event_date)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={event.status} type="event" />
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(event.total_amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Upcoming Events Sidebar */}
        <Card className="animate-fade-in">
          <CardHeader
            title="Upcoming Events"
            subtitle="Next on your schedule"
            action={
              <Link to="/events">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            }
          />
          {upcomingLoading ? (
            <div className="flex items-center justify-center h-48">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4">
              {(upcomingEvents || []).slice(0, 5).map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block group"
                >
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600 leading-none">
                        {event.event_date ? new Date(event.event_date + 'T00:00').toLocaleDateString('en-US', { month: 'short' }) : ''}
                      </span>
                      <span className="text-sm font-bold text-indigo-900 leading-none mt-0.5">
                        {event.event_date ? new Date(event.event_date + 'T00:00').getDate() : ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatTime(event.start_time)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-8">
                  No upcoming events
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
