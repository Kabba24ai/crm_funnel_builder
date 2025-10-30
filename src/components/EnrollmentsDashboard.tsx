import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Pause, Play, X as XIcon, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CustomerEnrollment } from '../types/funnel';
import EnrollmentDetailModal from './EnrollmentDetailModal';
import ManualEnrollmentForm from './ManualEnrollmentForm';

const EnrollmentsDashboard: React.FC = () => {
  const [enrollments, setEnrollments] = useState<CustomerEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [funnelFilter, setFunnelFilter] = useState<string>('all');
  const [funnels, setFunnels] = useState<{ id: string; name: string }[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    messagesSentToday: 0,
    pendingMessages: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadEnrollments(), loadFunnels(), loadStats()]);
  };

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const { data: enrollmentData, error } = await supabase
        .from('customer_funnel_enrollments')
        .select(`
          *,
          customers (first_name, last_name),
          sales_funnels (name)
        `)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      const enrichedEnrollments = await Promise.all(
        (enrollmentData || []).map(async (enrollment: any) => {
          const { count: totalSteps } = await supabase
            .from('funnel_steps')
            .select('*', { count: 'exact', head: true })
            .eq('funnel_id', enrollment.funnel_id);

          const { count: completedSteps } = await supabase
            .from('funnel_step_executions')
            .select('*', { count: 'exact', head: true })
            .eq('enrollment_id', enrollment.id)
            .in('status', ['sent', 'skipped']);

          return {
            ...enrollment,
            customer_name: `${enrollment.customers?.first_name || ''} ${
              enrollment.customers?.last_name || ''
            }`.trim(),
            funnel_name: enrollment.sales_funnels?.name || 'Unknown',
            progress: {
              current: completedSteps || 0,
              total: totalSteps || 0,
            },
          };
        })
      );

      setEnrollments(enrichedEnrollments);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunnels = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_funnels')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setFunnels(data || []);
    } catch (error) {
      console.error('Error loading funnels:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { count: activeCount } = await supabase
        .from('customer_funnel_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: completedCount } = await supabase
        .from('customer_funnel_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const today = new Date().toISOString().split('T')[0];
      const { count: sentTodayCount } = await supabase
        .from('funnel_step_executions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')
        .gte('executed_date', today);

      const { count: pendingCount } = await supabase
        .from('funnel_step_executions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        active: activeCount || 0,
        completed: completedCount || 0,
        messagesSentToday: sentTodayCount || 0,
        pendingMessages: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateEnrollmentStatus = async (
    enrollmentId: string,
    newStatus: 'active' | 'paused' | 'cancelled'
  ) => {
    try {
      const { error } = await supabase
        .from('customer_funnel_enrollments')
        .update({ status: newStatus })
        .eq('id', enrollmentId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      searchTerm === '' ||
      enrollment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.funnel_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesFunnel = funnelFilter === 'all' || enrollment.funnel_id === funnelFilter;

    return matchesSearch && matchesStatus && matchesFunnel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading enrollments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Enrollments</h2>
        <button
          onClick={() => setShowEnrollmentForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Manual Enrollment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Enrollments</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Messages Sent Today</p>
              <p className="text-2xl font-bold text-orange-600">{stats.messagesSentToday}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Messages</p>
              <p className="text-2xl font-bold text-gray-600">{stats.pendingMessages}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <TrendingUp size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search customers or funnels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={funnelFilter}
            onChange={(e) => setFunnelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Funnels</option>
            {funnels.map((funnel) => (
              <option key={funnel.id} value={funnel.id}>
                {funnel.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <Users size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
          <p className="text-gray-500 mb-4">
            {enrollments.length === 0
              ? 'Create your first enrollment to get started'
              : 'Try adjusting your filters'}
          </p>
          {enrollments.length === 0 && (
            <button
              onClick={() => setShowEnrollmentForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Enrollment
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.customer_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.funnel_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          enrollment.status
                        )}`}
                      >
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Step {enrollment.progress?.current || 0} of {enrollment.progress?.total || 0}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${
                              enrollment.progress?.total
                                ? (enrollment.progress.current / enrollment.progress.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedEnrollment(enrollment.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {enrollment.status === 'active' && (
                          <button
                            onClick={() => updateEnrollmentStatus(enrollment.id, 'paused')}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Pause"
                          >
                            <Pause size={18} />
                          </button>
                        )}
                        {enrollment.status === 'paused' && (
                          <button
                            onClick={() => updateEnrollmentStatus(enrollment.id, 'active')}
                            className="text-green-600 hover:text-green-800"
                            title="Resume"
                          >
                            <Play size={18} />
                          </button>
                        )}
                        {(enrollment.status === 'active' || enrollment.status === 'paused') && (
                          <button
                            onClick={() => updateEnrollmentStatus(enrollment.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <XIcon size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedEnrollment && (
        <EnrollmentDetailModal
          enrollmentId={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
          onUpdate={loadData}
        />
      )}

      {showEnrollmentForm && (
        <ManualEnrollmentForm
          onClose={() => setShowEnrollmentForm(false)}
          onSave={() => {
            loadData();
            setShowEnrollmentForm(false);
          }}
        />
      )}
    </div>
  );
};

export default EnrollmentsDashboard;
