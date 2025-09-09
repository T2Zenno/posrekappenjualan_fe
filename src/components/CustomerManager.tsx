import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Customer } from '@/hooks/useData';
import { toast } from "sonner";
import { Save, RotateCcw, Edit, Trash2 } from 'lucide-react';

const CustomerManager: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.username.trim()) {
      toast.error('Nama dan username harus diisi');
      return;
    }

    const customerData = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      note: formData.note.trim()
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
      toast.success('Pelanggan berhasil diperbarui');
      setEditingCustomer(null);
    } else {
      addCustomer(customerData);
      toast.success('Pelanggan berhasil ditambahkan');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', note: '' });
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      username: customer.username,
      note: customer.note
    });
    setEditingCustomer(customer);
  };

  const handleDelete = (customerId: string) => {
    if (window.confirm('Hapus pelanggan ini?')) {
      deleteCustomer(customerId);
      toast.success('Pelanggan berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Data Pelanggan</h1>
      </div>

      {/* Form */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Asli *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap"
                className="glass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="@username"
                className="glass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Catatan pelanggan (opsional)"
                className="glass"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" className="bg-gradient-primary">
                <Save className="h-4 w-4" />
                {editingCustomer ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Customer List */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Pelanggan</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Username</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Catatan</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-3 text-sm font-medium">{customer.name}</td>
                    <td className="py-3 text-sm">{customer.username}</td>
                    <td className="py-3 text-sm text-muted-foreground">{customer.note || '-'}</td>
                    <td className="py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {customers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data pelanggan
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CustomerManager;