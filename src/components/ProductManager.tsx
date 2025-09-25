import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Product } from '@/hooks/useData';
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

const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredProducts, setFilteredProducts] = React.useState(products);

  React.useEffect(() => {
    setFilteredProducts(
      products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.type.toLowerCase().includes(searchLower) ||
          (product.sku && product.sku.toLowerCase().includes(searchLower))
        );
      })
    );
  }, [products, searchTerm]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    sku: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.type.trim()) {
      toast.error('Nama produk dan jenis harus diisi');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      type: formData.type.trim(),
      sku: formData.sku.trim()
    };

    if (editingProduct) {
      updateProduct({ id: editingProduct.id, product: productData });
      toast.success('Produk berhasil diperbarui');
    } else {
      addProduct(productData);
      toast.success('Produk berhasil ditambahkan');
    }

    closeModal();
  };

  const resetForm = () => {
    setFormData({ name: '', type: '', sku: '' });
    setEditingProduct(null);
  };

  const openModalForAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', type: '', sku: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setFormData({
      name: product.name,
      type: product.type,
      sku: product.sku
    });
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', type: '', sku: '' });
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      type: product.type,
      sku: product.sku
    });
    setEditingProduct(product);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Hapus produk ini?')) {
      deleteProduct(productId);
      toast.success('Produk berhasil dihapus');
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    toast.success('Data produk diperbarui');
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in px-4 md:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gradient">Data Produk</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openModalForAdd} className="bg-gradient-primary w-full sm:w-auto">
            Tambah
          </Button>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Perbarui data produk' : 'Masukkan data produk baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-name">Nama Produk *</Label>
              <Input
                id="modal-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama produk"
                className="glass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-type">Jenis / Kategori *</Label>
              <Input
                id="modal-type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Jenis produk"
                className="glass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-sku">SKU / Kode (opsional)</Label>
              <Input
                id="modal-sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU"
                className="glass"
              />
            </div>

            <div className="md:col-span-3 flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="bg-gradient-primary w-full sm:w-auto">
                <Save className="h-4 w-4" />
                {editingProduct ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={closeModal} className="w-full sm:w-auto">
                <RotateCcw className="h-4 w-4" />
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product List */}
      <Card className="glass">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <h3 className="text-base md:text-lg font-semibold flex-1">Daftar Produk</h3>
            <div className="relative w-56">
              <Input
                placeholder="Cari produk..."
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
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Produk</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">Jenis</th>
                  <th className="text-left py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-center py-2 md:py-3 text-xs md:text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-2 md:py-3 text-xs md:text-sm font-medium">{product.name}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm">{product.type}</td>
                    <td className="py-2 md:py-3 text-xs md:text-sm text-muted-foreground">{product.sku || '-'}</td>
                    <td className="py-2 md:py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModalForEdit(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
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

            {filteredProducts.length === 0 && (
              <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
                {searchTerm ? 'Tidak ada produk yang cocok dengan pencarian' : 'Belum ada data produk'}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductManager;
