import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useData, type Product } from '@/hooks/useData';
import { toast } from "sonner";
import { Save, RotateCcw, Edit, Trash2 } from 'lucide-react';

const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    sku: ''
  });

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
      updateProduct(editingProduct.id, productData);
      toast.success('Produk berhasil diperbarui');
      setEditingProduct(null);
    } else {
      addProduct(productData);
      toast.success('Produk berhasil ditambahkan');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', type: '', sku: '' });
    setEditingProduct(null);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">Data Produk</h1>
      </div>

      {/* Form */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama produk"
                className="glass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Jenis / Kategori *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Jenis produk"
                className="glass"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Kode (opsional)</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU"
                className="glass"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-3">
              <Button type="submit" className="bg-gradient-primary">
                <Save className="h-4 w-4" />
                {editingProduct ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Product List */}
      <Card className="glass">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Produk</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Produk</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Jenis</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/30 hover:bg-accent/20">
                    <td className="py-3 text-sm font-medium">{product.name}</td>
                    <td className="py-3 text-sm">{product.type}</td>
                    <td className="py-3 text-sm text-muted-foreground">{product.sku || '-'}</td>
                    <td className="py-3 text-center no-print">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada data produk
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductManager;