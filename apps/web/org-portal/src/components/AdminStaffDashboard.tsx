// @ts-nocheck
// AdminStaffDashboard.tsx
// Super Admin Staff Management Dashboard Component

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Badge,
  Modal,
  Form,
  TextArea,
  Select,
  Alert,
  Card,
  Stat,
  TabGroup,
  Tab,
} from '@/components';

interface StaffRequest {
  id: string;
  organization_name: string;
  organization_tier: string;
  staff_template_title: string;
  requested_by_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  justification: string;
  created_at: string;
}

interface ComplianceReport {
  organization_id: string;
  organization_name: string;
  organization_tier: string;
  total_approved_staff: number;
  minimum_required: number;
  compliance_status: 'compliant' | 'at_risk' | 'non_compliant';
  missing_roles: Array<{
    template_key: string;
    title: string;
    required: number;
    current: number;
  }>;
}

export const AdminStaffDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<StaffRequest[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StaffRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [requestsRes, complianceRes] = await Promise.all([
        fetch('/api/admin/staff-requests/pending'),
        fetch('/api/admin/compliance/all-organizations'),
      ]);

      const requests = await requestsRes.json();
      const compliance = await complianceRes.json();

      setPendingRequests(requests);
      setComplianceReports(compliance);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/staff-requests/${selectedRequest.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'approved',
            approval_notes: approvalNotes,
          }),
        }
      );

      if (res.ok) {
        setSelectedRequest(null);
        setApprovalNotes('');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/staff-requests/${selectedRequest.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'rejected',
            approval_notes: approvalNotes,
          }),
        }
      );

      if (res.ok) {
        setSelectedRequest(null);
        setApprovalNotes('');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'yellow', label: 'Pending' },
      approved: { color: 'green', label: 'Approved' },
      rejected: { color: 'red', label: 'Rejected' },
      revoked: { color: 'gray', label: 'Revoked' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const statusConfig = {
      compliant: { color: 'green', label: '✓ Compliant' },
      at_risk: { color: 'yellow', label: '⚠ At Risk' },
      non_compliant: { color: 'red', label: '✗ Non-Compliant' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const pendingCount = pendingRequests.filter((r) => r.status === 'pending').length;
  const nonCompliantCount = complianceReports.filter(
    (r) => r.compliance_status === 'non_compliant'
  ).length;
  const atRiskCount = complianceReports.filter(
    (r) => r.compliance_status === 'at_risk'
  ).length;

  return (
    <div className="staff-admin-dashboard">
      <div className="dashboard-header">
        <h1>Staff Management Dashboard</h1>
        <p className="text-muted">Manage staff role approvals and monitor organizational compliance</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <Card>
          <Stat
            label="Pending Requests"
            value={pendingCount}
            trend="neutral"
            color="warning"
          />
        </Card>
        <Card>
          <Stat
            label="Non-Compliant Orgs"
            value={nonCompliantCount}
            trend="down"
            color="danger"
          />
        </Card>
        <Card>
          <Stat
            label="At-Risk Orgs"
            value={atRiskCount}
            trend="down"
            color="warning"
          />
        </Card>
        <Card>
          <Stat
            label="Total Organizations"
            value={complianceReports.length}
            trend="up"
            color="primary"
          />
        </Card>
      </div>

      {/* Tabs */}
      <TabGroup activeTab={activeTab} onChange={setActiveTab}>
        {/* Pending Requests Tab */}
        <Tab label="Pending Requests" id="pending">
          <div className="tab-content">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : pendingCount === 0 ? (
              <Alert type="info">
                ✓ No pending requests. All staff requests have been reviewed.
              </Alert>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Staff Role</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Justification</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests
                    .filter((r) => r.status === 'pending')
                    .map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-semibold">
                          {request.organization_name}
                        </TableCell>
                        <TableCell>
                          <Badge>{request.organization_tier}</Badge>
                        </TableCell>
                        <TableCell>{request.staff_template_title}</TableCell>
                        <TableCell className="text-sm">
                          {request.requested_by_email}
                        </TableCell>
                        <TableCell className="text-sm truncate">
                          {request.justification}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setSelectedRequest(request)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Tab>

        {/* Compliance Tab */}
        <Tab label="Compliance Status" id="compliance">
          <div className="tab-content">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Approved Staff</TableCell>
                    <TableCell>Min Required</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Missing Roles</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceReports.map((report) => (
                    <TableRow
                      key={report.organization_id}
                      className={
                        report.compliance_status === 'non_compliant'
                          ? 'bg-red-50'
                          : report.compliance_status === 'at_risk'
                          ? 'bg-yellow-50'
                          : ''
                      }
                    >
                      <TableCell className="font-semibold">
                        {report.organization_name}
                      </TableCell>
                      <TableCell>
                        <Badge>{report.organization_tier}</Badge>
                      </TableCell>
                      <TableCell>{report.total_approved_staff}</TableCell>
                      <TableCell>{report.minimum_required}</TableCell>
                      <TableCell>
                        {getComplianceBadge(report.compliance_status)}
                      </TableCell>
                      <TableCell>
                        {report.missing_roles.length > 0 ? (
                          <span className="text-red-600 font-semibold">
                            {report.missing_roles.length} role(s)
                          </span>
                        ) : (
                          <span className="text-green-600">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            // Show detailed compliance modal
                          }}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Tab>

        {/* All Requests History Tab */}
        <Tab label="Request History" id="history">
          <div className="tab-content">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell>Staff Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell>Resolved</TableCell>
                  <TableCell>Reviewed By</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.organization_name}</TableCell>
                    <TableCell>{request.staff_template_title}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{request.requested_by_email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tab>
      </TabGroup>

      {/* Review Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title="Review Staff Request"
        >
          <div className="modal-content">
            <div className="request-details">
              <div className="detail-row">
                <span className="label">Organization:</span>
                <span className="value">{selectedRequest.organization_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tier:</span>
                <span className="value">{selectedRequest.organization_tier}</span>
              </div>
              <div className="detail-row">
                <span className="label">Staff Role:</span>
                <span className="value">{selectedRequest.staff_template_title}</span>
              </div>
              <div className="detail-row">
                <span className="label">Requested By:</span>
                <span className="value">{selectedRequest.requested_by_email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Justification:</span>
                <span className="value">{selectedRequest.justification}</span>
              </div>
            </div>

            <Form>
              <TextArea
                label="Approval Notes"
                placeholder="Enter your approval or rejection notes..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </Form>

            <div className="modal-actions">
              <Button
                variant="primary"
                onClick={handleApprove}
                loading={actionLoading}
              >
                ✓ Approve
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={actionLoading}
              >
                ✗ Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminStaffDashboard;
