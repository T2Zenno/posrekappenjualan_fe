import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Admin } from '@/hooks/useData';
import { toast } from "sonner";
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

const AdminManager: React.FC = () => {
  const { admins, addAdmin, updateAdmin, deleteAdmin, refetchAdmins } = useData();

  const [searchTerm, setSearchTerm] = React.useState('');
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const searchLower = searchTerm.toLowerCase();
      return (
        admin.name.toLowerCase().includes(searchLower) ||
        (admin.username && admin.username.toLowerCase().includes(searchLower)) ||
        (admin.note && admin.note.toLowerCase().includes(searchLower))
      );
    })
  }, [admins, searchTerm]);

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    note: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nama admin harus diisi');
      return;
    }

    const adminData = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      note: formData.note.trim()
    };

    if (editingAdmin) {
      updateAdmin({ id: editingAdmin.id, admin: adminData });
      toast.success('Admin berhasil diperbarui');
    } else {
      addAdmin(adminData);
      toast.success('Admin berhasil ditambahkan');
    }

    closeModal();
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', note: '' });
    setEditingAdmin(null);
  };

  const openModalForAdd = () => {
    setEditingAdmin(null);
    setFormData({ name: '', username: '', note: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (admin: Admin) => {
    setFormData({
      name: admin.name,
      username: admin.username,
      note: admin.note
    });
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
    setFormData({ name: '', username: '', note: '' });
  };

  const handleEdit = (admin: Admin) => {
    setFormData({
      name: admin.name,
      username: admin.username,
      note: admin.note
    });
    setEditingAdmin(admin);
  };

  const handleDelete = (adminId: string) => {
    if (window.confirm('Hapus admin ini?')) {
      deleteAdmin(adminId);
      toast.success('Admin berhasil dihapus');
    }
  };

  const handleRefresh = () => {
    refetchAdmins();
    toast.success('Data admin diperbarui');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Data Admin</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openModalForAdd} className="bg-gradient-primary w-full sm:w-auto">
            Tambah
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingAdmin ? 'Edit Admin' : 'Tambah Admin'}</DialogTitle>
            <DialogDescription>
              {editingAdmin ? 'Perbarui data admin' : 'Masukkan data admin baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Admin *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama admin"
                className="glass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username (opsional)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="@username"
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Catatan"
                className="glass"
              />
            </div>

            <div className="md:col-span-3 flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="bg-gradient-primary w-full sm:w-auto">
                <Save className="h-4 w-4" />
                {editingAdmin ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin List */}
      <Card className="glass">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <h3 className="text-base md:text-lg font-semibold flex-1">Daftar Admin</h3>
            <div className="relative w-56">
              <Input
                placeholder="Cari admin..."
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
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Username</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Catatan</th>
                  <th className="text-center py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-2 md:py-3 text-xs md:text-sm font-medium">{admin.name}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm text-muted-foreground">{admin.username || '-'}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm text-muted-foreground">{admin.note || '-'}</td>
                    <td className="py-2 md:py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModalForEdit(admin)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
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

            {filteredAdmins.length === 0 && (
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
                {searchTerm ? 'Tidak ada admin yang cocok dengan pencarian' : 'Belum ada data admin'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminManager;
