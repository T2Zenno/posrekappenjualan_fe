import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Payment } from '@/hooks/useData';
import { Save, RotateCcw, Edit, Trash2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PaymentManager: React.FC = () => {
  const {
    payments, addPayment, updatePayment, deletePayment, refetchPayments,
  } = useData();


  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.name.toLowerCase().includes(searchLower) ||
        (payment.desc && payment.desc.toLowerCase().includes(searchLower)) ||
        (payment.code && payment.code.toLowerCase().includes(searchLower))
      );
    })
  }, [payments, searchTerm]);

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    code: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

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

    const action = editingPayment
      ? updatePayment({ id: editingPayment.id, payment: paymentData })
      : addPayment(paymentData);

    action.then(() => {
      setIsModalOpen(false);
      resetForm();
    });
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

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    await deletePayment(paymentToDelete.id);
    setIsConfirmDeleteOpen(false);
    setPaymentToDelete(null);
  }

  const handleRefresh = () => {
    refetchPayments();
    toast.success('Data pembayaran diperbarui');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Metode Pembayaran</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => { setEditingPayment(null); setFormData({ name: '', desc: '', code: '' }); setIsModalOpen(true); }} className="bg-gradient-primary w-full sm:w-auto">
            Tambah
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingPayment ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</DialogTitle>
            <DialogDescription>
              {editingPayment ? 'Perbarui data metode pembayaran' : 'Masukkan data metode pembayaran baru'}
            </DialogDescription>
          </DialogHeader>
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

            <div className="md:col-span-3 flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="bg-gradient-primary w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {editingPayment ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { resetForm(); setIsModalOpen(false); }} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus metode pembayaran <strong>{paymentToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment List */}
      <Card className="glass">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <h3 className="text-base md:text-lg font-semibold flex-1">Daftar Metode Pembayaran</h3>
            <div className="relative w-56">
              <Input
                placeholder="Cari metode pembayaran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass pl-10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Detail</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Kode</th>
                  <th className="text-center py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-2 md:py-3 text-xs md:text-sm font-medium">{payment.name}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm text-muted-foreground">{payment.desc || '-'}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm text-muted-foreground">{payment.code || '-'}</td>
                    <td className="py-2 md:py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { handleEdit(payment); setIsModalOpen(true); }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(payment)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
                {searchTerm ? 'Tidak ada metode pembayaran yang cocok dengan pencarian' : 'Belum ada data metode pembayaran'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentManager;
