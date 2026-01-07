/**
 * Company Management component for admin dashboard
 */
import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Plus,
  Link,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  QrCode,
  Calendar,
  Users,
  Download,
  Info,
  Edit,
} from "lucide-react";
import { useCompanyManagement } from "@/hooks/use-company-management";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import QRCodeStyling from "qr-code-styling";

interface CompanyManagementProps {
  onBack?: () => void;
  onCompanyCreated?: () => void;
}

export function CompanyManagement({
  onBack,
  onCompanyCreated,
}: CompanyManagementProps) {
  const { companies, loading, createCompany, updateCompany, deleteCompany, generateLink, loadCompanies } =
    useCompanyManagement();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [showQRPreview, setShowQRPreview] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);

  useEffect(() => {
    loadCompanies(!showInactive);
  }, [showInactive, loadCompanies]);

  const [newCompany, setNewCompany] = useState({
    company_name: "",
    company_email: "",
    contact_person: "",
    phone_number: "",
    variation_set_id: null as number | null,
  });

  const [availableVariationSets, setAvailableVariationSets] = useState<
    Array<{
      id: number;
      name: string;
      description: string;
      set_type: string;
      is_active: boolean;
    }>
  >([]);

  useEffect(() => {
    fetchAvailableVariationSets();
  }, []);

  const fetchAvailableVariationSets = async () => {
    try {
      const token = localStorage.getItem("admin_access_token");
      if (!token) {
        console.log("No admin token found, skipping variation sets fetch");
        return;
      }

      const response = await fetch(
        `/api/v1/admin/variation-sets?is_active=true&page_size=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.status === 401 || response.status === 403) {
        console.log("Admin authentication required for variation sets");
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setAvailableVariationSets(data.variation_sets || []);
      } else {
        console.log("Variation sets endpoint response:", response.status);
      }
    } catch (error) {
      console.error("Error fetching variation sets:", error);
    }
  };

  const handleCreateCompany = async () => {
    try {
      await createCompany(newCompany);
      setNewCompany({
        company_name: "",
        company_email: "",
        contact_person: "",
        phone_number: "",
        variation_set_id: null,
      });
      setShowCreateDialog(false);
      // Notify parent to reload filter options
      if (onCompanyCreated) {
        onCompanyCreated();
      }
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleGenerateLink = async (company: any) => {
    try {
      // Use the home page with company query parameter so users land on the homepage
      // and can start the flow from there (consent modal + redirect handled in /src/app/page.tsx)
      const baseUrl = window.location.origin;
      const financialClinicLink = `${baseUrl}/?company=${encodeURIComponent(company.unique_url)}`;

      setGeneratedLink(financialClinicLink);
      setSelectedCompany(company);
      setShowLinkDialog(true);
      toast.success("Financial Clinic link generated!");
    } catch (error) {
      toast.error("Failed to generate link");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard!");
  };

  const handleGenerateQR = () => {
    setShowQRPreview(true);

    // Small delay to ensure the container is rendered
    setTimeout(() => {
      if (qrCodeRef.current) {
        // Clear any existing QR code
        qrCodeRef.current.innerHTML = "";

        // Create new QR code
        qrCodeInstance.current = new QRCodeStyling({
          width: 300,
          height: 300,
          type: "svg",
          data: generatedLink,
          dotsOptions: {
            color: "#000000",
            type: "rounded",
          },
          backgroundOptions: {
            color: "#ffffff",
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 10,
          },
        });

        qrCodeInstance.current.append(qrCodeRef.current);
      }
    }, 100);
  };

  const handleDownloadQR = () => {
    if (qrCodeInstance.current) {
      const companyName = selectedCompany?.company_name || "company";
      qrCodeInstance.current.download({
        name: `${companyName
          .replace(/\s+/g, "-")
          .toLowerCase()}-financial-clinic-qr`,
        extension: "png",
      });
      toast.success("QR Code downloaded!");
    }
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setNewCompany({
      company_name: company.company_name,
      company_email: company.company_email,
      contact_person: company.contact_person,
      phone_number: company.phone_number || "",
      variation_set_id: company.variation_set_id || null,
    });
    setShowEditDialog(true);
  };

  const handleUpdateCompany = async () => {
    try {
      const response = await apiClient.updateCompany(
        editingCompany.id,
        newCompany
      );
      toast.success("Company updated successfully!");
      setShowEditDialog(false);
      setEditingCompany(null);
      setNewCompany({
        company_name: "",
        company_email: "",
        contact_person: "",
        phone_number: "",
        variation_set_id: null,
      });
      // Refresh companies list
      loadCompanies(!showInactive);
    } catch (error: any) {
      toast.error(error.message || "Failed to update company");
    }
  };

  const handleToggleActive = async (company: any) => {
    try {
      const newStatus = !company.is_active;
      const response = await apiClient.updateCompany(company.id, {
        is_active: newStatus,
      });
      toast.success(
        newStatus
          ? "Company activated!"
          : "Company deactivated - survey link disabled"
      );
      // Refresh companies list
      loadCompanies(!showInactive);
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle company status");
    }
  };

  const handleToggleVariations = async (company: any, enable: boolean) => {
    try {
      const response = await fetch(
        `/api/v1/admin/variations/companies/${company.id}/toggle`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enable_variations: enable,
            reason: enable ? 'Admin enabled variations' : 'Admin disabled variations'
          }),
        }
      );

      if (response.ok) {
        toast.success(`Variations ${enable ? 'enabled' : 'disabled'} successfully`);
        // Use updateCompany to update local state immediately
        await updateCompany(company.id, { enable_variations: enable });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to update variation settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update variation settings');
    }
  };

  const handleDeleteCompany = async (
    companyId: number,
    companyName: string
  ) => {
    if (
      confirm(
        `Are you sure you want to delete "${companyName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCompany(companyId);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Company Management
          </h2>
          <p className="text-muted-foreground">
            Manage corporate clients and their financial health assessment
            programs
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>
                Add a new company to the financial health assessment program
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={newCompany.company_name}
                  onChange={(e) =>
                    setNewCompany((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  placeholder="Emirates NBD"
                />
              </div>

              <div>
                <Label htmlFor="company_email">Company Email</Label>
                <Input
                  id="company_email"
                  type="email"
                  value={newCompany.company_email}
                  onChange={(e) =>
                    setNewCompany((prev) => ({
                      ...prev,
                      company_email: e.target.value,
                    }))
                  }
                  placeholder="hr@emiratesnbd.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={newCompany.contact_person}
                  onChange={(e) =>
                    setNewCompany((prev) => ({
                      ...prev,
                      contact_person: e.target.value,
                    }))
                  }
                  placeholder="Sarah Al-Mansouri"
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number (Optional)</Label>
                <Input
                  id="phone_number"
                  value={newCompany.phone_number}
                  onChange={(e) =>
                    setNewCompany((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  placeholder="+971 4 123 4567"
                />
              </div>

              {/* Variation Set Selector */}
              <div className="space-y-3 border-t pt-4">
                <Label>Question Variation Set (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Assign a pre-configured set of 15 question variations to this
                  company.
                </p>

                <Select
                  value={newCompany.variation_set_id?.toString() || "default"}
                  onValueChange={(value) => {
                    setNewCompany((prev) => ({
                      ...prev,
                      variation_set_id:
                        value === "default" ? null : parseInt(value),
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Use Default Questions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      Use Default Questions (Recommended)
                    </SelectItem>
                    {availableVariationSets.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No variation sets available
                      </SelectItem>
                    ) : (
                      availableVariationSets.map((set) => (
                        <SelectItem key={set.id} value={set.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{set.name}</span>
                            {set.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                {set.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  💡 Tip: Variation sets contain 15 pre-configured question
                  variations. Create sets in System Management → Question
                  Variation Sets.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCompany}
                  disabled={
                    !newCompany.company_name ||
                    !newCompany.company_email ||
                    !newCompany.contact_person
                  }
                >
                  Create Company
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Company Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_company_name">Company Name</Label>
              <Input
                id="edit_company_name"
                value={newCompany.company_name}
                onChange={(e) =>
                  setNewCompany((prev) => ({
                    ...prev,
                    company_name: e.target.value,
                  }))
                }
                placeholder="Emirates NBD"
              />
            </div>

            <div>
              <Label htmlFor="edit_company_email">Company Email</Label>
              <Input
                id="edit_company_email"
                type="email"
                value={newCompany.company_email}
                onChange={(e) =>
                  setNewCompany((prev) => ({
                    ...prev,
                    company_email: e.target.value,
                  }))
                }
                placeholder="hr@emiratesnbd.com"
              />
            </div>

            <div>
              <Label htmlFor="edit_contact_person">Contact Person</Label>
              <Input
                id="edit_contact_person"
                value={newCompany.contact_person}
                onChange={(e) =>
                  setNewCompany((prev) => ({
                    ...prev,
                    contact_person: e.target.value,
                  }))
                }
                placeholder="Sarah Al-Mansouri"
              />
            </div>

            <div>
              <Label htmlFor="edit_phone_number">Phone Number (Optional)</Label>
              <Input
                id="edit_phone_number"
                value={newCompany.phone_number}
                onChange={(e) =>
                  setNewCompany((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                placeholder="+971 4 123 4567"
              />
            </div>

            {/* Variation Set Selector */}
            <div className="space-y-3 border-t pt-4">
              <Label>Question Variation Set (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Assign a pre-configured set of 15 question variations to this
                company.
              </p>

              <Select
                value={newCompany.variation_set_id?.toString() || "default"}
                onValueChange={(value) => {
                  setNewCompany((prev) => ({
                    ...prev,
                    variation_set_id:
                      value === "default" ? null : parseInt(value),
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Use Default Questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    Use Default Questions (Recommended)
                  </SelectItem>
                  {availableVariationSets.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No variation sets available
                    </SelectItem>
                  ) : (
                    availableVariationSets.map((set) => (
                      <SelectItem key={set.id} value={set.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{set.name}</span>
                          {set.description && (
                            <span className="text-xs text-muted-foreground truncate">
                              {set.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground">
                💡 Tip: Variation sets contain 15 pre-configured question
                variations. Create sets in System Management → Question
                Variation Sets.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingCompany(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCompany}
                disabled={
                  !newCompany.company_name ||
                  !newCompany.company_email ||
                  !newCompany.contact_person
                }
              >
                Update Company
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variations Info */}
      <Alert>
        <AlertDescription>
          <strong>Variations Control:</strong> Toggle variations to enable/disable custom questions for each company. 
          When disabled, companies will see default questions regardless of assigned variation sets.
        </AlertDescription>
      </Alert>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Company Filter</h3>
              <p className="text-sm text-muted-foreground">
                Show {showInactive ? "all companies" : "active companies only"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Active Only</span>
              <Switch
                checked={!showInactive}
                onCheckedChange={(checked) => setShowInactive(!checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Programs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter((c) => c.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce(
                (sum, company) => sum + company.total_assessments,
                0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.length > 0
                ? Math.round(
                    companies.reduce(
                      (sum, c) => sum + (c.average_score || 0),
                      0
                    ) / companies.length
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>
            Manage company registrations and assessment programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first company to the financial health
                program
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Company
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Question Set</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variations</TableHead>
                  <TableHead>Assessments</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">
                          {company.company_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {company.company_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{company.contact_person}</div>
                        {company.phone_number && (
                          <div className="text-xs text-muted-foreground">
                            {company.phone_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        /c/{company.unique_url}
                      </code>
                    </TableCell>
                    <TableCell>
                      {company.question_variation_mapping &&
                      Object.keys(company.question_variation_mapping).length >
                        0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <span>
                            Custom (
                            {
                              Object.keys(company.question_variation_mapping)
                                .length
                            }
                            )
                          </span>
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Default
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={company.is_active ? "default" : "secondary"}
                      >
                        {company.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={company.enable_variations ? "default" : "secondary"}>
                          {company.enable_variations ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={company.enable_variations || false}
                          onCheckedChange={(checked) => 
                            handleToggleVariations(company, checked)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>{company.total_assessments}</TableCell>
                    <TableCell>
                      {company.average_score
                        ? Math.round(company.average_score)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateLink(company)}
                          title="Generate Survey Link"
                        >
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCompany(company)}
                          title="Edit Company"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={company.is_active ? "secondary" : "default"}
                          onClick={() => handleToggleActive(company)}
                          title={
                            company.is_active
                              ? "Deactivate Survey Link"
                              : "Activate Survey Link"
                          }
                        >
                          {company.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteCompany(
                              company.id,
                              company.company_name
                            )
                          }
                          title="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Link Generation Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Financial Clinic Company Link</DialogTitle>
            <DialogDescription>
              Share this Financial Clinic assessment link with{" "}
              {selectedCompany?.company_name} employees. All completed
              assessments will be automatically tracked to your company
              dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Generated Link</Label>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly />
                <Button size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Expires:</strong> 30 days
              </div>
              <div>
                <strong>Max Responses:</strong> 1,000
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Close
              </Button>
              <Button onClick={handleGenerateQR}>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Preview Dialog */}
      <Dialog open={showQRPreview} onOpenChange={setShowQRPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code - {selectedCompany?.company_name}</DialogTitle>
            <DialogDescription>
              Scan this QR code to access the Financial Clinic assessment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              <div ref={qrCodeRef} />
            </div>

            <div className="text-sm text-muted-foreground text-center">
              This QR code will direct users to:
              <br />
              <span className="font-mono text-xs break-all">
                {generatedLink}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowQRPreview(false)}>
                Close
              </Button>
              <Button onClick={handleDownloadQR}>
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
