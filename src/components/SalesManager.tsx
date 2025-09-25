import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";

import {
  useData, type Sale
} from '@/hooks/useData';
import { formatCurrency, getTodayString, parseDate, isDateBetween } from '@/utils/formatters';

// Helper function to get safe price
const getSafePrice = (price: number | string | null | undefined) => {
  const num = Number(price);
  return isNaN(num) ? 0 : num;
};
import { toast } from "sonner";
import { Plus, Save, RotateCcw, Search, Filter, X, Edit, Trash2 } from 'lucide-react';
import QuickAddDialog from './QuickAddDialog';
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

import { RefreshCw } from 'lucide-react';

const SalesManager: React.FC = () => {
  const {
    customers, products, channels, payments, admins, sales,
    addSale, updateSale, deleteSale,
    addCustomer, addProduct, addChannel, addPayment, addAdmin,
    refetchSales
  } = useData();

  // Create options for comboboxes
  const customerOptions: ComboboxOption[] = customers.map(customer => ({
    value: customer.id,
    label: `${customer.name} (${customer.username})`
  }));

  const productOptions: ComboboxOption[] = products.map(product => ({
    value: product.id,
    label: `${product.name} — ${product.type}`
  }));

  const channelOptions: ComboboxOption[] = channels.map(channel => ({
    value: channel.id,
    label: channel.name
  }));

  const paymentOptions: ComboboxOption[] = payments.map(payment => ({
    value: payment.id,
    label: payment.name
  }));

  const adminOptions: ComboboxOption[] = admins.map(admin => ({
    value: admin.id,
    label: admin.name
  }));

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState<{
    type: 'customer' | 'product' | 'channel' | 'payment' | 'admin';
    show: boolean;
  }>({ type: 'customer', show: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    channel_id: '',
    payment_id: '',
    admin_id: '',
    price: '',
    link: '',
    date: getTodayString(),
    ship_date: '',
    note: ''
  });

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const customer = customers.find(c => c.id === sale.customer.id);
      const product = products.find(p => p.id === sale.product.id);
      const channel = channels.find(c => c.id === sale.channel.id);
      const payment = payments.find(p => p.id === sale.payment.id);
      const admin = admins.find(a => a.id === sale.admin.id);

      const searchTermLower = searchTerm.toLowerCase();

      const searchMatch = !searchTerm || [
        customer?.name,
        customer?.username,
        product?.name,
        product?.type,
        channel?.name,
        payment?.name,
        admin?.name,
        sale.date,
        sale.price?.toString(),
        sale.link,
        sale.ship_date,
        sale.note
      ].some(field => field?.toLowerCase().includes(searchTermLower));

      const dateMatch = isDateBetween(
        parseDate(sale.date),
        parseDate(dateFrom),
        parseDate(dateTo)
      );

      return searchMatch && dateMatch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, customers, products, channels, payments, admins, searchTerm, dateFrom, dateTo]);



  const totalRevenue = filteredSales.reduce((sum, sale) => sum + getSafePrice(sale.price), 0);

  const topChannel = useMemo(() => {
    const channelTotals = filteredSales.reduce((acc, sale) => {
      const channel = channels.find(c => c.id === sale.channel.id);
      if (channel) {
        acc[channel.name] = (acc[channel.name] || 0) + sale.price;
      }
      return acc;
    }, {} as Record<string, number>);

    const maxIncome = Math.max(...Object.values(channelTotals));
    const topChannelName = Object.keys(channelTotals).find(name => channelTotals[name] === maxIncome);

    return topChannelName ? { name: topChannelName, income: maxIncome } : null;
  }, [filteredSales, channels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.product_id || !formData.channel_id || !formData.payment_id || !formData.admin_id) {
      toast.error('Harap lengkapi semua field yang wajib diisi');
      return;
    }

    const saleData = {
      customer_id: formData.customer_id,
      product_id: formData.product_id,
      channel_id: formData.channel_id,
      payment_id: formData.payment_id,
      admin_id: formData.admin_id,
      price: Number(formData.price) || 0,
      link: formData.link,
      date: formData.date || getTodayString(),
      ship_date: formData.ship_date,
      note: formData.note
    };

    if (editingSale) {
      updateSale({ id: editingSale.id, sale: saleData });
      toast.success('Transaksi berhasil diperbarui');
      setEditingSale(null);
    } else {
      addSale(saleData);
      toast.success('Transaksi berhasil ditambahkan');
    }

    closeModal();
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      product_id: '',
      channel_id: '',
      payment_id: '',
      admin_id: '',
      price: '',
      link: '',
      date: getTodayString(),
      ship_date: '',
      note: ''
    });
    setEditingSale(null);
  };

  const openModalForAdd = () => {
    setEditingSale(null);
    setFormData({
      customer_id: '',
      product_id: '',
      channel_id: '',
      payment_id: '',
      admin_id: '',
      price: '',
      link: '',
      date: getTodayString(),
      ship_date: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (sale: Sale) => {
    setFormData({
      customer_id: sale.customer.id,
      product_id: sale.product.id,
      channel_id: sale.channel.id,
      payment_id: sale.payment.id,
      admin_id: sale.admin.id,
      price: sale.price.toString(),
      link: sale.link,
      date: sale.date,
      ship_date: sale.ship_date,
      note: sale.note
    });
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    setFormData({
      customer_id: '',
      product_id: '',
      channel_id: '',
      payment_id: '',
      admin_id: '',
      price: '',
      link: '',
      date: getTodayString(),
      ship_date: '',
      note: ''
    });
  };

  const handleEdit = (sale: Sale) => {
    setFormData({
      customer_id: sale.customer.id,
      product_id: sale.product.id,
      channel_id: sale.channel.id,
      payment_id: sale.payment.id,
      admin_id: sale.admin.id,
      price: sale.price.toString(),
      link: sale.link,
      date: sale.date,
      ship_date: sale.ship_date,
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

  const handleQuickAdd = async (type: string, data: { name: string; extra?: string }) => {
    let newItem;
    switch (type) {
      case 'customer':
        newItem = addCustomer({ name: data.name, username: data.name.toLowerCase().replace(/\s+/g, ''), note: '' });
        setFormData(prev => ({ ...prev, customer_id: newItem.id }));
        break;
      case 'product':
        newItem = addProduct({ name: data.name, type: data.extra || 'Umum', sku: '' });
        setFormData(prev => ({ ...prev, product_id: newItem.id }));
        break;
      case 'channel':
        newItem = addChannel({ name: data.name, desc: '', url: '' });
        setFormData(prev => ({ ...prev, channel_id: newItem.id }));
        break;
      case 'payment':
        newItem = addPayment({ name: data.name, desc: '', code: data.extra || 'Transfer' });
        setFormData(prev => ({ ...prev, payment_id: newItem.id }));
        break;
      case 'admin':
        newItem = addAdmin({ name: data.name, username: '', note: '' });
        setFormData(prev => ({ ...prev, admin_id: newItem.id }));
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
        <div className="flex gap-2">
          <Button onClick={() => refetchSales()} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openModalForAdd} className="bg-gradient-primary">
            <Plus className="h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Channel Teratas */}
      {topChannel && (
        <Card className="glass">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Channel Teratas</h3>
            <p className="text-sm text-muted-foreground">
              {topChannel.name} - {formatCurrency(topChannel.income)}
            </p>
          </div>
        </Card>
      )}

      {/* Sales List */}
      <Card className="glass">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <h3 className="text-lg font-semibold flex-1">Daftar Transaksi</h3>
            
            {/* Filters */}
            <div className="flex gap-2 flex-wrap relative">
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-card-foreground z-10" />
                <Input
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full glass border border-border focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Toggle filter"
                >
                  <Filter className="h-5 w-5" />
                </Button>
                {showFilters && (
                  <div className="absolute z-10 top-full mt-1 right-0 glass border border-border rounded-md shadow-lg p-3 w-56 flex flex-col gap-2">
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
                  </div>
                )}
              </div>
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
                  <th className="text-right py-3 pr-4 text-sm font-medium text-muted-foreground">Harga</th>
                  <th className="text-left py-3 pl-4 text-sm font-medium text-muted-foreground">Metode</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Catatan</th>
                  <th className="text-center py-3 text-sm font-medium text-muted-foreground no-print">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => {
                  const customer = customers.find(c => c.id === sale.customer.id);
                  const product = products.find(p => p.id === sale.product.id);
                  const channel = channels.find(c => c.id === sale.channel.id);
                  const payment = payments.find(p => p.id === sale.payment.id);
                  const admin = admins.find(a => a.id === sale.admin.id);

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
                      <td className="py-3 pr-4 text-sm text-right font-medium">{formatCurrency(sale.price)}</td>
                      <td className="py-3 pl-4 text-sm">{payment?.name || '-'}</td>
                      <td className="py-3 text-sm">{admin?.name || '-'}</td>
                      <td className="py-3 text-sm max-w-32 truncate" title={sale.note}>{sale.note || '-'}</td>
                      <td className="py-3 text-center no-print">
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModalForEdit(sale)}
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

      {/* Add/Edit Sale Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSale ? 'Edit Transaksi Penjualan' : 'Tambah Transaksi Penjualan'}
            </DialogTitle>
            <DialogDescription>
              {editingSale ? 'Perbarui detail transaksi penjualan' : 'Masukkan detail transaksi penjualan baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customer */}
              <div className="space-y-2">
                <Label htmlFor="modal-customer">Pelanggan *</Label>
                <div className="flex gap-2">
                  <Combobox
                    options={customerOptions}
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                    className="glass flex-1"
                  />
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
                <Label htmlFor="modal-product">Produk *</Label>
                <div className="flex gap-2">
                  <Combobox
                    options={productOptions}
                    value={formData.product_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
                    className="glass flex-1"
                  />
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
                <Label htmlFor="modal-price">Harga (IDR) *</Label>
                <Input
                  id="modal-price"
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
                <Label htmlFor="modal-channel">Channel *</Label>
                <div className="flex gap-2">
                  <Combobox
                    options={channelOptions}
                    value={formData.channel_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, channel_id: value }))}
                    className="glass flex-1"
                  />
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
                <Label htmlFor="modal-link">Link Sumber (opsional)</Label>
                <Input
                  id="modal-link"
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="glass"
                />
              </div>

              {/* Payment */}
              <div className="space-y-2">
                <Label htmlFor="modal-payment">Metode Pembayaran *</Label>
                <div className="flex gap-2">
                  <Combobox
                    options={paymentOptions}
                    value={formData.payment_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_id: value }))}
                    className="glass flex-1"
                  />
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
                <Label htmlFor="modal-admin">Admin *</Label>
                <div className="flex gap-2">
                  <Combobox
                    options={adminOptions}
                    value={formData.admin_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, admin_id: value }))}
                    className="glass flex-1"
                  />
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
                <Label htmlFor="modal-date">Tanggal Pembelian *</Label>
                <Input
                  id="modal-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="glass"
                  required
                />
              </div>

              {/* Ship Date */}
              <div className="space-y-2">
                <Label htmlFor="modal-shipDate">Tanggal Kirim (opsional)</Label>
                <Input
                  id="modal-shipDate"
                  type="date"
                  value={formData.ship_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, ship_date: e.target.value }))}
                  className="glass"
                />
              </div>

              {/* Note */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="modal-note">Catatan</Label>
                <Textarea
                  id="modal-note"
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
                <Button type="button" variant="outline" onClick={closeModal}>
                  <X className="h-4 w-4" />
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

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
