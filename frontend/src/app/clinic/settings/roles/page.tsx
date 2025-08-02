"use client";

import { useState } from "react";
import { useClinic } from "@/context/ClinicContext";
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
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Shield,
  UserCheck,
  Edit,
  Plus,
  Lock,
  Unlock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RolesPage() {
  const { staff, roles, addStaffMember, updateStaffMember } = useClinic();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    roleId: "",
  });

  const rolePermissions = {
    Receptionist: [
      {
        id: "add_patients",
        name: "Add Patients",
        description: "Add new patients to the system",
        module: "patients",
      },
      {
        id: "view_patients",
        name: "View Patients",
        description: "Search and view patient records",
        module: "patients",
      },
      {
        id: "start_visits",
        name: "Start Visits",
        description: "Initiate new patient visits",
        module: "visits",
      },
      {
        id: "view_visits",
        name: "View Visits",
        description: "View visit status and details",
        module: "visits",
      },
      {
        id: "print_receipts",
        name: "Print Receipts",
        description: "Print and send receipts",
        module: "visits",
      },
    ],
    Nurse: [
      {
        id: "add_patients",
        name: "Add Patients",
        description: "Add new patients to the system",
        module: "patients",
      },
      {
        id: "view_patients",
        name: "View Patients",
        description: "Search and view patient records",
        module: "patients",
      },
      {
        id: "view_patient_history",
        name: "View Patient History",
        description: "Access patient visit history",
        module: "patients",
      },
      {
        id: "start_visits",
        name: "Start Visits",
        description: "Initiate new patient visits",
        module: "visits",
      },
      {
        id: "add_services",
        name: "Add Services",
        description: "Add services to patient visits",
        module: "services",
      },
      {
        id: "dispense_medicine",
        name: "Dispense Medicine",
        description: "Dispense medicines during visits",
        module: "pharmacy",
      },
      {
        id: "view_medicine_stock",
        name: "View Medicine Stock",
        description: "View medicine inventory (read-only)",
        module: "pharmacy",
      },
      {
        id: "print_receipts",
        name: "Print Receipts",
        description: "Print and send receipts",
        module: "visits",
      },
    ],
    Pharmacist: [
      {
        id: "view_medicine_stock",
        name: "View Medicine Stock",
        description: "View medicine inventory status",
        module: "pharmacy",
      },
      {
        id: "add_medicines",
        name: "Add Medicines",
        description: "Add new medicines to inventory",
        module: "pharmacy",
      },
      {
        id: "stock_entries",
        name: "Stock Entries",
        description: "Record stock entries and adjustments",
        module: "pharmacy",
      },
      {
        id: "dispense_medicine",
        name: "Dispense Medicine",
        description: "Dispense medicines during visits",
        module: "pharmacy",
      },
      {
        id: "low_stock_reports",
        name: "Low Stock Reports",
        description: "Access low stock medicine reports",
        module: "reports",
      },
      {
        id: "expiry_alerts",
        name: "Expiry Alerts",
        description: "View and manage expiry alerts",
        module: "pharmacy",
      },
    ],
    Manager: [
      {
        id: "full_access",
        name: "Full Access",
        description: "Complete access to all clinic features",
        module: "settings",
      },
      {
        id: "manage_settings",
        name: "Manage Settings",
        description: "Manage clinic settings and configurations",
        module: "settings",
      },
      {
        id: "manage_roles",
        name: "Manage Roles",
        description: "Create and modify user roles",
        module: "settings",
      },
      {
        id: "view_all_reports",
        name: "View All Reports",
        description: "Access all reports and analytics",
        module: "reports",
      },
      {
        id: "manage_services",
        name: "Manage Services",
        description: "Add, edit, and delete services",
        module: "services",
      },
      {
        id: "billing_overrides",
        name: "Billing Overrides",
        description: "Override billing and inventory adjustments",
        module: "visits",
      },
    ],
    Admin: [
      {
        id: "system_admin",
        name: "System Administrator",
        description: "Complete system administration access",
        module: "settings",
      },
    ],
  };

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.phone && newStaff.roleId) {
      const selectedRoleObj = roles.find((r) => r.id === newStaff.roleId);
      if (selectedRoleObj) {
        addStaffMember({
          ...newStaff,
          role: selectedRoleObj,
          isActive: true,
        });
        setNewStaff({ name: "", email: "", phone: "", roleId: "" });
        setIsAddStaffOpen(false);
      }
    }
  };

  const toggleStaffStatus = (staffId: string, currentStatus: boolean) => {
    updateStaffMember(staffId, { isActive: !currentStatus });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Roles & Permissions
        </h1>
        <p className="text-gray-600">
          Manage staff roles and access permissions
        </p>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roles.map((role) => {
          const staffCount = staff.filter((s) => s.role.id === role.id).length;
          const activeStaffCount = staff.filter(
            (s) => s.role.id === role.id && s.isActive
          ).length;

          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${
                selectedRole === role.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() =>
                setSelectedRole(selectedRole === role.id ? null : role.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">{role.name}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    {staffCount} total staff
                  </p>
                  <p className="text-sm text-green-600">
                    {activeStaffCount} active
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Details */}
      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>
                {roles.find((r) => r.id === selectedRole)?.name} Permissions
              </span>
            </CardTitle>
            <CardDescription>
              Detailed permissions for this role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rolePermissions[
                roles.find((r) => r.id === selectedRole)
                  ?.name as keyof typeof rolePermissions
              ]?.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mt-1">
                    <Lock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{permission.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {permission.module}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {permission.description}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Unlock className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Staff Members</span>
              </CardTitle>
              <CardDescription>
                Manage staff accounts and role assignments
              </CardDescription>
            </div>
            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>
                    Create a new staff account with role assignment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newStaff.name}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newStaff.phone}
                      onChange={(e) =>
                        setNewStaff({ ...newStaff, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newStaff.roleId}
                      onValueChange={(value) =>
                        setNewStaff({ ...newStaff, roleId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddStaffOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddStaff}>Add Staff Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge variant="outline">{member.role.name}</Badge>
                      <span className="text-sm text-gray-600">
                        {member.email}
                      </span>
                      <span className="text-sm text-gray-600">
                        {member.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`active-${member.id}`} className="text-sm">
                      Active
                    </Label>
                    <Switch
                      id={`active-${member.id}`}
                      checked={member.isActive}
                      onCheckedChange={() =>
                        toggleStaffStatus(member.id, member.isActive)
                      }
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Access Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control Summary</CardTitle>
          <CardDescription>
            Overview of role-based permissions in the clinic system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Patient Management
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Add Patients</span>
                    <div className="flex space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        Receptionist
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Nurse
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Manager
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>View Patient History</span>
                    <div className="flex space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        Nurse
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Manager
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">
                  Pharmacy Management
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Dispense Medicine</span>
                    <div className="flex space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        Nurse
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Pharmacist
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Manager
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Manage Inventory</span>
                    <div className="flex space-x-1">
                      <Badge variant="secondary" className="text-xs">
                        Pharmacist
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Manager
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                Security Features
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • Role-based access control ensures staff only see relevant
                  features
                </li>
                <li>• Secure authentication with session management</li>
                <li>• Audit trails for sensitive operations</li>
                <li>• Granular permissions for fine-tuned access control</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
