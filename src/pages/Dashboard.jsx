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
} from 'lucide-react';

import Card, { CardHeader } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { formatCurrency, formatDate, formatTime, capitalize } from '../lib/formatters';

const PIE_COLORS = {
  inquiry: '#9ca3af',
  proposal: '#f59e0b',
  confirmed: '#22c55e',
  completed: '#d1d5db',
  cancelled: '#ef4444',
};

export default function Dashboard() {
  const { data: overview, loading: overviewLoading } = useApi('/reports/overview');
  const { data: revenueData, loading: revenueLoading } = useApi('/reports/revenue-by-month');
  const { data: statusData, loading: statusLoading } = useApi('/reports/events-by-status');
  const { data: recentEvents, loading: eventsLoading } = useApi('/events?limit=8');
  const { data: upcomingEvents, loading: upcomingLoading } = useApi('/reports/upcoming');

  if (overviewLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your event business.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(overview?.total_revenue || 0)}
          sub="All time"
        />
        <StatCard
          icon={Clock}
          label="Outstanding"
          value={formatCurrency(overview?.outstanding_balance || 0)}
          sub="Pending payments"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={overview?.upcoming_count || 0}
          sub="Next 30 days"
        />
        <StatCard
          icon={Users}
          label="Total Events"
          value={overview?.total_events || 0}
          sub={`${overview?.confirmed_count || 0} confirmed`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue" subtitle="Monthly trend" />
          {revenueLoading ? (
            <LoadingSpinner />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData || []}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111827" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="By Status" subtitle="Event breakdown" />
          {statusLoading ? (
            <LoadingSpinner />
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                    paddingAngle={2}
                    strokeWidth={0}
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
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
                {(statusData || []).map((entry) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="w-2 h-2 rounded-full"
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

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padding={false}>
          <div className="px-5 pt-5">
            <CardHeader
              title="Recent Events"
              action={
                <Link to="/events">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              }
            />
          </div>
          {eventsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-gray-100">
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5">Event</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5">Contact</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5">Status</th>
                    <th className="text-right text-xs font-medium text-gray-500 px-5 py-2.5">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentEvents || []).map((event) => (
                    <tr key={event.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3">
                        <Link to={`/events/${event.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">
                        {event.contact_first_name} {event.contact_last_name}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{formatDate(event.event_date)}</td>
                      <td className="px-5 py-3"><Badge status={event.status} /></td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(event.total_amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Upcoming"
            action={
              <Link to="/calendar">
                <Button variant="ghost" size="sm"><ArrowRight className="w-3.5 h-3.5" /></Button>
              </Link>
            }
          />
          {upcomingLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-2">
              {(upcomingEvents || []).slice(0, 5).map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="block group">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-[10px] font-semibold text-gray-500 leading-none">
                        {event.event_date ? new Date(event.event_date + 'T00:00').toLocaleDateString('en-US', { month: 'short' }) : ''}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 leading-none mt-0.5">
                        {event.event_date ? new Date(event.event_date + 'T00:00').getDate() : ''}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-400">{formatTime(event.start_time)}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">No upcoming events</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
