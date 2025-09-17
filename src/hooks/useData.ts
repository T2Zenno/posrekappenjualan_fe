import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

// Data types
export interface Customer {
  id: string;
  name: string;
  username: string;
  note: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  sku: string;
}

export interface Channel {
  id: string;
  name: string;
  desc: string;
  url: string;
}

export interface Payment {
  id: string;
  name: string;
  desc: string;
  code: string;
}

export interface Admin {
  id: string;
  name: string;
  username: string;
  note: string;
}

export interface Sale {
  id: string;
  customer: { id: string; name: string; username: string; note: string };
  product: { id: string; name: string; type: string; sku: string };
  channel: { id: string; name: string; desc: string; url: string };
  payment: { id: string; name: string; desc: string; code: string };
  admin: { id: string; name: string; username: string; note: string };
  price: number;
  link: string;
  date: string;
  ship_date: string;
  note: string;
}

export interface SaleInput {
  customer_id: string;
  product_id: string;
  channel_id: string;
  payment_id: string;
  admin_id: string;
  price: number;
  link: string;
  date: string;
  ship_date: string;
  note: string;
}

// Base API URL
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('pos-token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Fetch CSRF cookie
const fetchCsrfCookie = async () => {
  await fetch('http://localhost:8000/sanctum/csrf-cookie', {
    credentials: 'include',
  });
};

// Fetch functions for React Query
const fetchCustomers = async (): Promise<Customer[]> => {
  const res = await fetch(`${API_BASE}/customers`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_BASE}/products`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

const fetchChannels = async (): Promise<Channel[]> => {
  const res = await fetch(`${API_BASE}/channels`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch channels');
  return res.json();
};

const fetchPayments = async (): Promise<Payment[]> => {
  const res = await fetch(`${API_BASE}/payments`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
};

const fetchAdmins = async (): Promise<Admin[]> => {
  const res = await fetch(`${API_BASE}/admins`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch admins');
  return res.json();
};

const fetchSales = async (): Promise<Sale[]> => {
  const res = await fetch(`${API_BASE}/sales`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
};

// Custom hook for data management
export const useData = () => {
  const queryClient = useQueryClient();

  // Queries
  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const channelsQuery = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  });

  const adminsQuery = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
  });

  const salesQuery = useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });

  // CRUD operations for Product using useMutation
  const addProductMutation = useMutation({
    mutationFn: async (product: Omit<Product, 'id'>) => {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to add product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan produk');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Omit<Product, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update product');
        return;
      }
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui produk');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete product');
        return;
      }
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus produk');
    },
  });

  // CRUD operations for Customer using useMutation
  const addCustomerMutation = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id'>) => {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error('Failed to add customer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Pelanggan berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan pelanggan');
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, customer }: { id: string; customer: Omit<Customer, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update customer');
        return;
      }
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(customer),
      });
      if (!res.ok) throw new Error('Failed to update customer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Pelanggan berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui pelanggan');
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete customer');
        return;
      }
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete customer');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Pelanggan berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus pelanggan');
    },
  });

  // CRUD operations for Channel using useMutation
  const addChannelMutation = useMutation({
    mutationFn: async (channel: Omit<Channel, 'id'>) => {
      const res = await fetch(`${API_BASE}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(channel),
      });
      if (!res.ok) throw new Error('Failed to add channel');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan channel');
    },
  });

  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, channel }: { id: string; channel: Omit<Channel, 'id'> }) => {
      if (!id) {
        throw new Error('ID is undefined for update channel');
      }
      const res = await fetch(`${API_BASE}/channels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(channel),
      });
      if (!res.ok) throw new Error('Failed to update channel');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui channel');
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete channel');
        return;
      }
      const res = await fetch(`${API_BASE}/channels/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete channel');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus channel');
    },
  });

  // CRUD operations for Payment using useMutation
  const addPaymentMutation = useMutation({
    mutationFn: async (payment: Omit<Payment, 'id'>) => {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(payment),
      });
      if (!res.ok) throw new Error('Failed to add payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pembayaran berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan pembayaran');
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, payment }: { id: string; payment: Omit<Payment, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update payment');
        return;
      }
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(payment),
      });
      if (!res.ok) throw new Error('Failed to update payment');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pembayaran berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui pembayaran');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete payment');
        return;
      }
      const res = await fetch(`${API_BASE}/payments/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete payment');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pembayaran berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus pembayaran');
    },
  });

  // CRUD operations for Admin using useMutation
  const addAdminMutation = useMutation({
    mutationFn: async (admin: Omit<Admin, 'id'>) => {
      const res = await fetch(`${API_BASE}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(admin),
      });
      if (!res.ok) throw new Error('Failed to add admin');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan admin');
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ id, admin }: { id: string; admin: Omit<Admin, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update admin');
        return;
      }
      const res = await fetch(`${API_BASE}/admins/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(admin),
      });
      if (!res.ok) throw new Error('Failed to update admin');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui admin');
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete admin');
        return;
      }
      const res = await fetch(`${API_BASE}/admins/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete admin');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus admin');
    },
  });

  // CRUD operations for Sale using useMutation
  const addSaleMutation = useMutation({
    mutationFn: async (sale: SaleInput) => {
      const res = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(sale),
      });
      if (!res.ok) throw new Error('Failed to add sale');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Penjualan berhasil ditambahkan');
    },
    onError: () => {
      toast.error('Gagal menambahkan penjualan');
    },
  });

  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, sale }: { id: string; sale: SaleInput }) => {
      if (!id) {
        console.error('ID is undefined for update sale');
        return;
      }
      const res = await fetch(`${API_BASE}/sales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify(sale),
      });
      if (!res.ok) throw new Error('Failed to update sale');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Penjualan berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui penjualan');
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete sale');
        return;
      }
      const res = await fetch(`${API_BASE}/sales/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete sale');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Penjualan berhasil dihapus');
    },
    onError: () => {
      toast.error('Gagal menghapus penjualan');
    },
  });

  // Utility operations
  const loadDemoData = useCallback(() => {
    toast.error('Load demo data is disabled when connected to backend');
  }, []);

  const resetAllData = useCallback(() => {
    toast.error('Reset all data is disabled when connected to backend');
  }, []);

  const exportData = useCallback(async (options?: { sections?: string[] }) => {
    const data = {
      sales: salesQuery.data || [],
      customers: customersQuery.data || [],
      products: productsQuery.data || [],
      channels: channelsQuery.data || [],
      payments: paymentsQuery.data || [],
      admins: adminsQuery.data || []
    };

    try {
      const { exportToPDF } = await import('@/utils/pdfExporter');
      exportToPDF(data, {
        title: 'Laporan Data POS & Rekap Penjualan',
        sections: options?.sections
      });
      toast.success('Laporan PDF berhasil diunduh!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Gagal mengekspor data');
    }
  }, [salesQuery.data, customersQuery.data, productsQuery.data, channelsQuery.data, paymentsQuery.data, adminsQuery.data]);

  return {
    // Data
    customers: customersQuery.data || [],
    products: productsQuery.data || [],
    channels: channelsQuery.data || [],
    payments: paymentsQuery.data || [],
    admins: adminsQuery.data || [],
    sales: salesQuery.data || [],

    // Customer operations
    addCustomer: addCustomerMutation.mutateAsync,
    updateCustomer: updateCustomerMutation.mutateAsync,
    deleteCustomer: deleteCustomerMutation.mutateAsync,

    // Product operations
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,

    // Channel operations
    addChannel: addChannelMutation.mutateAsync,
    updateChannel: updateChannelMutation.mutateAsync,
    deleteChannel: deleteChannelMutation.mutateAsync,

    // Payment operations
    addPayment: addPaymentMutation.mutateAsync,
    updatePayment: updatePaymentMutation.mutateAsync,
    deletePayment: deletePaymentMutation.mutateAsync,

    // Admin operations
    addAdmin: addAdminMutation.mutateAsync,
    updateAdmin: updateAdminMutation.mutateAsync,
    deleteAdmin: deleteAdminMutation.mutateAsync,

    // Sale operations
    addSale: addSaleMutation.mutateAsync,
    updateSale: updateSaleMutation.mutateAsync,
    deleteSale: deleteSaleMutation.mutateAsync,

    // Utility operations
    loadDemoData,
    resetAllData,
    exportData,

    // Fetch functions for refresh
    fetchCustomers,
    fetchProducts,
    fetchChannels,
    fetchPayments,
    fetchAdmins,
    fetchSales,
  };
};
