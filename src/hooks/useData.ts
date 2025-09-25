import api from '@/lib/axios';
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




// Fetch functions (diekspor agar bisa digunakan di komponen)
const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get< Customer[] >('/customers');
    return response.data || [];
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengambil data pelanggan';
    toast.error(message);
    throw new Error(message);
  }
};

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get< Product[]>('/products');
     return response.data || [];
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengambil data produk';
    toast.error(message);
    throw new Error(message);
  }
};

const fetchChannels = async (): Promise<Channel[]> => {
  try {
    const response = await api.get< Channel[] >('/channels');
     return response.data || [];
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengambil data channel';
    toast.error(message);
    throw new Error(message);
  }
};

const fetchPayments = async (): Promise<Payment[]> => {
  try {
    const response = await api.get< Payment[] >('/payments');
     return response.data || [];
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengambil data pembayaran';
    toast.error(message);
    throw new Error(message);
  }
};

const fetchAdmins = async (): Promise<Admin[]> => {
  try {
    const response = await api.get< Admin[] >('/admins');
     return response.data || [];
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengambil data admin';
    toast.error(message);
    throw new Error(message);
  }
};

const fetchSales = async (): Promise<Sale[]> => {
  try {
    const response = await api.get< Sale[] >('/sales');
     return response.data || [];
  } catch (error: any) {
    const message = error.response?.data?.message || 'Gagal mengambil data penjualan';
    toast.error(message);
    throw new Error(message);
  }
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
      const response = await api.post('/products', product);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan produk');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Omit<Product, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update product');
        return;
      }
      const response = await api.put(`/products/${id}`, product);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui produk');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete product');
        return;
      }
      const response = await api.delete(`/products/${id}`);
      if (response.status !== 200 && response.status !== 204) throw new Error('Failed to delete product');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk');
    },
  });

  // CRUD operations for Customer using useMutation
  const addCustomerMutation = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id'>) => {
      const response = await api.post('/customers', customer);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Pelanggan berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan pelanggan');
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, customer }: { id: string; customer: Omit<Customer, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update customer');
        return;
      }
      const response = await api.put(`/customers/${id}`, customer);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Pelanggan berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui pelanggan');
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete customer');
        return;
      }
      await api.delete(`/customers/${id}`);
      return id; // Return id on success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Pelanggan berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus pelanggan');
    },
  });

  // CRUD operations for Channel using useMutation
  const addChannelMutation = useMutation({
    mutationFn: async (channel: Omit<Channel, 'id'>) => {
      const response = await api.post('/channels', channel);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan channel');
    },
  });

  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, channel }: { id: string; channel: Omit<Channel, 'id'> }) => {
      if (!id) {
        throw new Error('ID is undefined for update channel');
      }
      const response = await api.put(`/channels/${id}`, channel);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui channel');
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete channel');
        return;
      }
      await api.delete(`/channels/${id}`);
      return id; // Return id on success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Channel berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus channel');
    },
  });

  // CRUD operations for Payment using useMutation
  const addPaymentMutation = useMutation({
    mutationFn: async (payment: Omit<Payment, 'id'>) => {
      const response = await api.post('/payments', payment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pembayaran berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan pembayaran');
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, payment }: { id: string; payment: Omit<Payment, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update payment');
        return;
      }
      const response = await api.put(`/payments/${id}`, payment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pembayaran berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui pembayaran');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete payment');
        return;
      }
      await api.delete(`/payments/${id}`);
      return id; // Return id on success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pembayaran berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus pembayaran');
    },
  });

  // CRUD operations for Admin using useMutation
  const addAdminMutation = useMutation({
    mutationFn: async (admin: Omit<Admin, 'id'>) => {
      const response = await api.post('/admins', admin);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan admin');
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: async ({ id, admin }: { id: string; admin: Omit<Admin, 'id'> }) => {
      if (!id) {
        console.error('ID is undefined for update admin');
        return;
      }
      const response = await api.put(`/admins/${id}`, admin);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui admin');
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete admin');
        return;
      }
      await api.delete(`/admins/${id}`);
      return id; // Return id on success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success('Admin berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus admin');
    },
  });

  // CRUD operations for Sale using useMutation
  const addSaleMutation = useMutation({
    mutationFn: async (sale: SaleInput) => {
      const response = await api.post('/sales', sale);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Penjualan berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan penjualan');
    },
  });

  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, sale }: { id: string; sale: SaleInput }) => {
      if (!id) {
        console.error('ID is undefined for update sale');
        return;
      }
      const response = await api.put(`/sales/${id}`, sale);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Penjualan berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui penjualan');
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        console.error('ID is undefined for delete sale');
        return;
      }
      await api.delete(`/sales/${id}`);
      return id; // Return id on success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Penjualan berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus penjualan');
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
    try {
      const dataToExport = {
        sales: salesQuery.data || [],
        customers: customersQuery.data || [],
        products: productsQuery.data || [],
        channels: channelsQuery.data || [],
        payments: paymentsQuery.data || [],
        admins: adminsQuery.data || []
      };

      const { exportToPDF } = await import('@/utils/pdfExporter');
      exportToPDF(dataToExport, {
        title: 'Laporan Data POS & Rekap Penjualan',
        sections: options?.sections
      });
      toast.success('Laporan PDF berhasil diunduh!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Gagal mengekspor data');
    }
  }, [queryClient, salesQuery.data, customersQuery.data, productsQuery.data, channelsQuery.data, paymentsQuery.data, adminsQuery.data]);

  return {
    // Data
    customers: customersQuery.data ?? [],
    products: productsQuery.data ?? [],
    channels: channelsQuery.data ?? [],
    payments: paymentsQuery.data ?? [],
    admins: adminsQuery.data ?? [],
    sales: salesQuery.data ?? [],
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

    // Refetch functions
    refetchCustomers: customersQuery.refetch,
    refetchProducts: productsQuery.refetch,
    refetchChannels: channelsQuery.refetch,
    refetchPayments: paymentsQuery.refetch,
    refetchAdmins: adminsQuery.refetch,
    refetchSales: salesQuery.refetch,
  };
};
