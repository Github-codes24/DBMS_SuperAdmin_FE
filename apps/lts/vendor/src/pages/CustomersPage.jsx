import React, { useState } from "react";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  Search,
  Eye,
  Trash2,
  MoreVertical,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function CustomersPage({ customers, setCustomers, globalSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const query = searchTerm || globalSearch;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query),
  );

  const handleDeleteCustomer = (id) => {
    if (
      window.confirm("Are you sure you want to delete this customer profile?")
    ) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Customer Management"
        subtitle="View customer activity, order histories, and account status"
      />

      <Card className="p-4 flex items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search customer name, email, phone..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Total Orders</th>
                <th className="px-5 py-3.5">Total Spent</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <tr
                  key={cust.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cust.avatar}
                        alt={cust.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {cust.name}
                        </p>
                        <p className="text-slate-500">ID: {cust.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{cust.email}</p>
                    <p className="text-slate-500">{cust.phone}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {cust.totalOrders} orders
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-600">
                    {formatCurrency(cust.totalSpent)}
                  </td>
                  <td className="px-5 py-4">
                    {cust.status === "Active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="neutral">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      <Dropdown.Item
                        onSelect={() => {
                          setSelectedCustomer(cust);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item
                        onSelect={() => handleDeleteCustomer(cust.id)}
                        destructive
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Account
                      </Dropdown.Item>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Customer Profile"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-xl">
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {selectedCustomer.name}
                </h4>
                <p className="text-emerald-700 font-medium">
                  {selectedCustomer.status} Customer
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />{" "}
                {selectedCustomer.email}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />{" "}
                {selectedCustomer.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400" />{" "}
                {selectedCustomer.address}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400">Total Orders</p>
                <p className="font-bold text-slate-900 text-base">
                  {selectedCustomer.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400">Total Spent</p>
                <p className="font-bold text-emerald-600 text-base">
                  {formatCurrency(selectedCustomer.totalSpent)}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
