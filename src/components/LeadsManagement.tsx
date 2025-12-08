import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Users,
  Download,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  Edit,
  Trash2,
  RefreshCw,
  MoreVertical,
  Clock,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ScheduleEmailModal } from "@/components/ScheduleEmailModal";

interface ConsultationRequest {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  message?: string;
  preferred_contact_method: "email" | "phone" | "whatsapp";
  preferred_time: "morning" | "afternoon" | "evening";
  source: string;
  status: "pending" | "contacted" | "scheduled" | "completed";
  notes?: string;
  created_at: string;
  contacted_at?: string;
  scheduled_at?: string;
  updated_at?: string;
}

interface LeadsStats {
  total: number;
  pending: number;
  contacted: number;
  scheduled: number;
  completed: number;
  this_week: number;
  conversion_rate: number;
}

export function LeadsManagement() {
  const [leads, setLeads] = useState<ConsultationRequest[]>([]);
  const [stats, setStats] = useState<LeadsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [incomeFilter, setIncomeFilter] = useState<string>("all");
  const [nationalityFilter, setNationalityFilter] = useState<string>("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<ConsultationRequest | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>(
    []
  );
  const [isScheduleEmailOpen, setIsScheduleEmailOpen] = useState(false);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      if (incomeFilter !== "all") params.append("income_range", incomeFilter);
      if (nationalityFilter !== "all")
        params.append("nationality", nationalityFilter);
      if (ageGroupFilter !== "all") params.append("age_group", ageGroupFilter);
      if (companyFilter !== "all") params.append("company_id", companyFilter);
      if (searchTerm) params.append("search", searchTerm);

      const data = (await apiClient.request(
        `/consultations/admin/list?${params}`
      )) as ConsultationRequest[];
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("An error occurred while loading leads");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = (await apiClient.request(
        "/consultations/admin/stats"
      )) as LeadsStats;
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = (await apiClient.request(
        "/admin/simple/filter-options"
      )) as any;
      setCompanies(response.companies || []);
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [
    statusFilter,
    sourceFilter,
    incomeFilter,
    nationalityFilter,
    ageGroupFilter,
    companyFilter,
    searchTerm,
  ]);

  const handleStatusUpdate = async (
    id: number,
    newStatus: string,
    notes?: string
  ) => {
    try {
      await apiClient.request(`/consultations/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          notes: notes || selectedLead?.notes,
        }),
      });

      toast.success("Lead status updated successfully");
      loadLeads();
      loadStats();
      setIsEditDialogOpen(false);
      setSelectedLead(null);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("An error occurred while updating the lead");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      await apiClient.request(`/consultations/admin/${id}`, {
        method: "DELETE",
      });

      toast.success("Lead deleted successfully");
      loadLeads();
      loadStats();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("An error occurred while deleting the lead");
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      if (searchTerm) params.append("search", searchTerm);

      const token = localStorage.getItem("admin_access_token");
      const response = await fetch(
        `${apiClient.getBaseUrl()}/consultations/admin/export?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `consultation-leads-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Export completed successfully");
      } else {
        toast.error("Failed to export leads data");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred during export");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      contacted: "bg-blue-100 text-blue-800",
      scheduled: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getPreferredTimeLabel = (time: string) => {
    const labels = {
      morning: "Morning (9 AM - 12 PM)",
      afternoon: "Afternoon (12 PM - 5 PM)",
      evening: "Evening (5 PM - 8 PM)",
    };
    return labels[time as keyof typeof labels] || time;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Leads
                </CardTitle>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Contacted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.contacted}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.scheduled}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {stats.this_week}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Consultation Leads</CardTitle>
              <CardDescription>
                Manage consultation requests from customers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadLeads} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} disabled={isExporting} size="sm">
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
              <Button
                onClick={() => setIsScheduleEmailOpen(true)}
                variant="outline"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Email
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="financial_clinic_results">
                    Clinic Results
                  </SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Demographic Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={incomeFilter} onValueChange={setIncomeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Income Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Income Ranges</SelectItem>
                  <SelectItem value="Below 5K">Below 5K</SelectItem>
                  <SelectItem value="5K-10K">5K-10K</SelectItem>
                  <SelectItem value="10K-15K">10K-15K</SelectItem>
                  <SelectItem value="15K-20K">15K-20K</SelectItem>
                  <SelectItem value="20K-30K">20K-30K</SelectItem>
                  <SelectItem value="30K-50K">30K-50K</SelectItem>
                  <SelectItem value="Above 50K">Above 50K</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={nationalityFilter}
                onValueChange={setNationalityFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Nationalities</SelectItem>
                  <SelectItem value="Emirati">Emirati</SelectItem>
                  <SelectItem value="Non-Emirati">Non-Emirati</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Age Groups</SelectItem>
                  <SelectItem value="< 18">&lt; 18</SelectItem>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-45">36-45</SelectItem>
                  <SelectItem value="46-60">46-60</SelectItem>
                  <SelectItem value="60+">60+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Preferred Contact</TableHead>
                  <TableHead>Preferred Time</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading leads...
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No consultation requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          {lead.message && (
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {lead.message}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{lead.email}</div>
                          <div className="text-gray-500">
                            {lead.phone_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {lead.source.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContactMethodIcon(lead.preferred_contact_method)}
                          <span className="text-sm capitalize">
                            {lead.preferred_contact_method}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {getPreferredTimeLabel(lead.preferred_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedLead(lead);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(lead.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the status and notes for this consultation request.
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <div className="text-sm text-gray-900">
                    {selectedLead.name}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="text-sm text-gray-900">
                    {selectedLead.email}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="text-sm text-gray-900">
                    {selectedLead.phone_number}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <div className="text-sm text-gray-900">
                    {selectedLead.source.replace("_", " ")}
                  </div>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedLead.status}
                  onValueChange={(value) =>
                    setSelectedLead({ ...selectedLead, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  value={selectedLead.notes || ""}
                  onChange={(e) =>
                    setSelectedLead({ ...selectedLead, notes: e.target.value })
                  }
                  placeholder="Add internal notes about this lead..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedLead &&
                handleStatusUpdate(
                  selectedLead.id,
                  selectedLead.status,
                  selectedLead.notes
                )
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Email Modal */}
      <ScheduleEmailModal
        open={isScheduleEmailOpen}
        onOpenChange={setIsScheduleEmailOpen}
        currentFilters={{
          statusFilter,
          sourceFilter,
        }}
      />
    </div>
  );
}
