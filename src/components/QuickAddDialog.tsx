import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QuickAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, data: { name: string; extra?: string }) => void;
  type: 'customer' | 'product' | 'channel' | 'payment' | 'admin';
}

const QuickAddDialog: React.FC<QuickAddDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type
}) => {
  const [name, setName] = useState('');
  const [extra, setExtra] = useState('');

  const titles = {
    customer: 'Tambah Pelanggan',
    product: 'Tambah Produk',
    channel: 'Tambah Channel',
    payment: 'Tambah Metode Pembayaran',
    admin: 'Tambah Admin'
  };

  const extraLabels = {
    product: 'Jenis / Kategori'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit(type, { name: name.trim(), extra: extra.trim() });
    setName('');
    setExtra('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setExtra('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quickName">Nama</Label>
            <Input
              id="quickName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama"
              className="glass"
              required
              autoFocus
            />
          </div>
          
          {type === 'product' && (
            <div className="space-y-2">
              <Label htmlFor="quickExtra">{extraLabels.product}</Label>
              <Input
                id="quickExtra"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Masukkan jenis/kategori"
                className="glass"
              />
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddDialog;