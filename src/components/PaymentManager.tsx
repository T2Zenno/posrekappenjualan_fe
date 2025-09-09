import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Payment } from '@/hooks/useData';
import { toast } from "sonner";
import { Save, RotateCcw, Edit, Trash2 } from 'lucide-react';

const PaymentManager: React.FC = () => {
  const { payments, addPayment, updatePayment, deletePayment } = useData();
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    code: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nama metode pembayaran harus diisi');
      return;
    }

    const paymentData = {
      name: formData.name.trim(),
      desc: formData.desc.trim(),
      code: formData.code.trim()
    };

    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData);
      toast.success('Metode pembayaran berhasil diperbarui');
      setEditingPayment(null);
    } else {
      addPayment(paymentData);
      toast.success('Metode pembayaran berhasil ditambahkan');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', desc: '', code: '' });
    setEditingPayment(null);
  };

  const handleEdit = (payment: Payment) => {
    setFormData({
      name: payment.name,
      desc: payment.desc,
      code: payment.code
    });
    setEditingPayment(payment);
  };

  const handleDelete = (paymentId: string) => {
    if (window.confirm('Hapus metode pembayaran ini?')) {
      deletePayment(paymentId);
      toast.success('Metode pembayaran berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Metode Pembayaran</h1>
      </div>

      {/* Form */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingPayment ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Metode *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Transfer / COD / E-Wallet…"
                className="glass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desc">Detail (opsional)</Label>
              <Input
                id="desc"
                value={formData.desc}
                onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                placeholder="No. rekening / catatan"
                className="glass"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code">Kode (opsional)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Kode internal"
                className="glass"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" className="bg-gradient-primary">
                <Save className="h-4 w-4" />
                {editingPayment ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Payment List */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Metode Pembayaran</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Detail</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Kode</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-3 text-sm font-medium">{payment.name}</td>
                    <td className="py-3 text-sm text-muted-foreground">{payment.desc || '-'}</td>
                    <td className="py-3 text-sm text-muted-foreground">{payment.code || '-'}</td>
                    <td className="py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data metode pembayaran
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentManager;