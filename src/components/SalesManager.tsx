import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useData, type Sale } from '@/hooks/useData';
import { formatCurrency, getTodayString, parseDate, isDateBetween } from '@/utils/formatters';
import { toast } from "sonner";
import { Plus, Save, RotateCcw, Search, Filter, X, Edit, Trash2 } from 'lucide-react';
import QuickAddDialog from './QuickAddDialog';

const SalesManager: React.FC = () => {
  const {
    customers, products, channels, payments, admins, sales,
    addSale, updateSale, deleteSale,
    addCustomer, addProduct, addChannel, addPayment, addAdmin
  } = useData();

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState<{
    type: 'customer' | 'product' | 'channel' | 'payment' | 'admin';
    show: boolean;
  }>({ type: 'customer', show: false });

  const [formData, setFormData] = useState({
    customer: '',
    product: '',
    channel: '',
    payment: '',
    admin: '',
    price: '',
    link: '',
    date: getTodayString(),
    shipDate: '',
    note: ''
  });

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const customer = customers.find(c => c.id === sale.customer);
      const product = products.find(p => p.id === sale.product);
      
      const searchMatch = !searchTerm || [
        customer?.name,
        customer?.username,
        product?.name,
        product?.type,
        sale.note
      ].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));

      const dateMatch = isDateBetween(
        parseDate(sale.date),
        parseDate(dateFrom),
        parseDate(dateTo)
      );

      return searchMatch && dateMatch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, customers, products, searchTerm, dateFrom, dateTo]);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.price || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer || !formData.product || !formData.channel || !formData.payment || !formData.admin) {
      toast.error('Harap lengkapi semua field yang wajib diisi');
      return;
    }

    const saleData = {
      customer: formData.customer,
      product: formData.product,
      channel: formData.channel,
      payment: formData.payment,
      admin: formData.admin,
      price: Number(formData.price) || 0,
      link: formData.link,
      date: formData.date || getTodayString(),
      shipDate: formData.shipDate,
      note: formData.note
    };

    if (editingSale) {
      updateSale(editingSale.id, saleData);
      toast.success('Transaksi berhasil diperbarui');
      setEditingSale(null);
    } else {
      addSale(saleData);
      toast.success('Transaksi berhasil ditambahkan');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customer: '',
      product: '',
      channel: '',
      payment: '',
      admin: '',
      price: '',
      link: '',
      date: getTodayString(),
      shipDate: '',
      note: ''
    });
    setEditingSale(null);
  };

  const handleEdit = (sale: Sale) => {
    setFormData({
      customer: sale.customer,
      product: sale.product,
      channel: sale.channel,
      payment: sale.payment,
      admin: sale.admin,
      price: sale.price.toString(),
      link: sale.link,
      date: sale.date,
      shipDate: sale.shipDate,
      note: sale.note
    });
    setEditingSale(sale);
  };

  const handleDelete = (saleId: string) => {
    if (window.confirm('Hapus transaksi ini?')) {
      deleteSale(saleId);
      toast.success('Transaksi berhasil dihapus');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const handleQuickAdd = async (type: string, data: any) => {
    let newItem;
    switch (type) {
      case 'customer':
        newItem = addCustomer({ name: data.name, username: data.name.toLowerCase().replace(/\s+/g, ''), note: '' });
        setFormData(prev => ({ ...prev, customer: newItem.id }));
        break;
      case 'product':
        newItem = addProduct({ name: data.name, type: data.extra || 'Umum', sku: '' });
        setFormData(prev => ({ ...prev, product: newItem.id }));
        break;
      case 'channel':
        newItem = addChannel({ name: data.name, desc: '', url: '' });
        setFormData(prev => ({ ...prev, channel: newItem.id }));
        break;
      case 'payment':
        newItem = addPayment({ name: data.name, desc: '', code: '' });
        setFormData(prev => ({ ...prev, payment: newItem.id }));
        break;
      case 'admin':
        newItem = addAdmin({ name: data.name, username: '', note: '' });
        setFormData(prev => ({ ...prev, admin: newItem.id }));
        break;
    }
    toast.success(`${type} berhasil ditambahkan`);
    setShowQuickAdd({ type: 'customer', show: false });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gradient">
          {editingSale ? 'Edit Transaksi Penjualan' : 'Tambah Transaksi Penjualan'}
        </h1>
      </div>

      {/* Form */}
      <Card className="glass">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Customer */}
            <div className="space-y-2">
              <Label htmlFor="customer">Pelanggan *</Label>
              <div className="flex gap-2">
                <Select value={formData.customer} onValueChange={(value) => setFormData(prev => ({ ...prev, customer: value }))}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Pilih pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAdd({ type: 'customer', show: true })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label htmlFor="product">Produk *</Label>
              <div className="flex gap-2">
                <Select value={formData.product} onValueChange={(value) => setFormData(prev => ({ ...prev, product: value }))}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} — {product.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAdd({ type: 'product', show: true })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Harga (IDR) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="glass"
                required
              />
            </div>

            {/* Channel */}
            <div className="space-y-2">
              <Label htmlFor="channel">Channel *</Label>
              <div className="flex gap-2">
                <Select value={formData.channel} onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Pilih channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map(channel => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAdd({ type: 'channel', show: true })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="link">Link Sumber (opsional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                className="glass"
              />
            </div>

            {/* Payment */}
            <div className="space-y-2">
              <Label htmlFor="payment">Metode Pembayaran *</Label>
              <div className="flex gap-2">
                <Select value={formData.payment} onValueChange={(value) => setFormData(prev => ({ ...prev, payment: value }))}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent>
                    {payments.map(payment => (
                      <SelectItem key={payment.id} value={payment.id}>
                        {payment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAdd({ type: 'payment', show: true })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Admin */}
            <div className="space-y-2">
              <Label htmlFor="admin">Admin *</Label>
              <div className="flex gap-2">
                <Select value={formData.admin} onValueChange={(value) => setFormData(prev => ({ ...prev, admin: value }))}>
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Pilih admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map(admin => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickAdd({ type: 'admin', show: true })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Pembelian *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="glass"
                required
              />
            </div>

            {/* Ship Date */}
            <div className="space-y-2">
              <Label htmlFor="shipDate">Tanggal Kirim (opsional)</Label>
              <Input
                id="shipDate"
                type="date"
                value={formData.shipDate}
                onChange={(e) => setFormData(prev => ({ ...prev, shipDate: e.target.value }))}
                className="glass"
              />
            </div>

            {/* Note */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label htmlFor="note">Catatan</Label>
              <Textarea
                id="note"
                rows={2}
                placeholder="Catatan tambahan..."
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="glass"
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3 flex-wrap">
              <Button type="submit" className="bg-gradient-primary">
                <Save className="h-4 w-4" />
                {editingSale ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4" />
                Reset Form
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Sales List */}
      <Card className="glass">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <h3 className="text-lg font-semibold flex-1">Daftar Transaksi</h3>
            
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48 glass"
                />
              </div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="glass"
                placeholder="Dari tanggal"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="glass"
                placeholder="Sampai tanggal"
              />
              {(searchTerm || dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Bersihkan
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Tanggal</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Pelanggan</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Produk</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Channel</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Harga</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Metode</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Catatan</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const customer = customers.find(c => c.id === sale.customer);
                  const product = products.find(p => p.id === sale.product);
                  const channel = channels.find(c => c.id === sale.channel);
                  const payment = payments.find(p => p.id === sale.payment);
                  const admin = admins.find(a => a.id === sale.admin);

                  return (
                    <tr key={sale.id} className="border-b border-border/30 hover:bg-accent/20">
                      <td className="py-3 text-sm">{sale.date}</td>
                      <td className="py-3 text-sm">{customer?.name || '-'}</td>
                      <td className="py-3 text-sm">{product?.name || '-'}</td>
                      <td className="py-3 text-sm">
                        {channel?.name || '-'}
                        {sale.link && (
                          <a
                            href={sale.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                          >
                            link
                          </a>
                        )}
                      </td>
                      <td className="py-3 text-sm text-right font-medium">{formatCurrency(sale.price)}</td>
                      <td className="py-3 text-sm">{payment?.name || '-'}</td>
                      <td className="py-3 text-sm">{admin?.name || '-'}</td>
                      <td className="py-3 text-sm max-w-32 truncate" title={sale.note}>{sale.note || '-'}</td>
                      <td className="py-3 text-center no-print">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border/50 bg-muted/20">
                  <th colSpan={4} className="text-right py-3 text-sm font-medium">
                    Total ({filteredSales.length} transaksi):
                  </th>
                  <th className="text-right py-3 text-sm font-bold">
                    {formatCurrency(totalRevenue)}
                  </th>
                  <th colSpan={4}></th>
                </tr>
              </tfoot>
            </table>

            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || dateFrom || dateTo
                  ? 'Tidak ada transaksi yang sesuai dengan filter'
                  : 'Belum ada transaksi'
                }
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Add Dialog */}
      <QuickAddDialog
        isOpen={showQuickAdd.show}
        onClose={() => setShowQuickAdd(prev => ({ ...prev, show: false }))}
        onSubmit={handleQuickAdd}
        type={showQuickAdd.type}
      />
    </div>
  );
};

export default SalesManager;