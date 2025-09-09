import { useState, useEffect, useCallback } from 'react';

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
  customer: string;
  product: string;
  channel: string;
  payment: string;
  admin: string;
  price: number;
  link: string;
  date: string;
  shipDate: string;
  note: string;
}

// Storage keys
const KEYS = {
  customers: 'pos_customers',
  products: 'pos_products',
  channels: 'pos_channels',
  payments: 'pos_payments',
  admins: 'pos_admins',
  sales: 'pos_sales'
} as const;

// Utility functions
const load = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const save = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Custom hook for data management
export const useData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    setCustomers(load(KEYS.customers));
    setProducts(load(KEYS.products));
    setChannels(load(KEYS.channels));
    setPayments(load(KEYS.payments));
    setAdmins(load(KEYS.admins));
    setSales(load(KEYS.sales));
  }, []);

  // Initialize with default data if empty
  useEffect(() => {
    if (payments.length === 0) {
      const defaultPayment: Payment = {
        id: generateId(),
        name: 'Transfer Bank',
        desc: '',
        code: 'TRF'
      };
      setPayments([defaultPayment]);
      save(KEYS.payments, [defaultPayment]);
    }

    if (channels.length === 0) {
      const defaultChannel: Channel = {
        id: generateId(),
        name: 'WhatsApp',
        desc: '',
        url: ''
      };
      setChannels([defaultChannel]);
      save(KEYS.channels, [defaultChannel]);
    }

    if (admins.length === 0) {
      const defaultAdmin: Admin = {
        id: generateId(),
        name: 'Administrator',
        username: '',
        note: ''
      };
      setAdmins([defaultAdmin]);
      save(KEYS.admins, [defaultAdmin]);
    }
  }, [payments.length, channels.length, admins.length]);

  // CRUD operations
  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = { ...customer, id: generateId() };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    save(KEYS.customers, updated);
    return newCustomer;
  }, [customers]);

  const updateCustomer = useCallback((id: string, customer: Omit<Customer, 'id'>) => {
    const updated = customers.map(c => c.id === id ? { ...customer, id } : c);
    setCustomers(updated);
    save(KEYS.customers, updated);
  }, [customers]);

  const deleteCustomer = useCallback((id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    save(KEYS.customers, updated);
  }, [customers]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: generateId() };
    const updated = [...products, newProduct];
    setProducts(updated);
    save(KEYS.products, updated);
    return newProduct;
  }, [products]);

  const updateProduct = useCallback((id: string, product: Omit<Product, 'id'>) => {
    const updated = products.map(p => p.id === id ? { ...product, id } : p);
    setProducts(updated);
    save(KEYS.products, updated);
  }, [products]);

  const deleteProduct = useCallback((id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    save(KEYS.products, updated);
  }, [products]);

  const addChannel = useCallback((channel: Omit<Channel, 'id'>) => {
    const newChannel: Channel = { ...channel, id: generateId() };
    const updated = [...channels, newChannel];
    setChannels(updated);
    save(KEYS.channels, updated);
    return newChannel;
  }, [channels]);

  const updateChannel = useCallback((id: string, channel: Omit<Channel, 'id'>) => {
    const updated = channels.map(c => c.id === id ? { ...channel, id } : c);
    setChannels(updated);
    save(KEYS.channels, updated);
  }, [channels]);

  const deleteChannel = useCallback((id: string) => {
    const updated = channels.filter(c => c.id !== id);
    setChannels(updated);
    save(KEYS.channels, updated);
  }, [channels]);

  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: generateId() };
    const updated = [...payments, newPayment];
    setPayments(updated);
    save(KEYS.payments, updated);
    return newPayment;
  }, [payments]);

  const updatePayment = useCallback((id: string, payment: Omit<Payment, 'id'>) => {
    const updated = payments.map(p => p.id === id ? { ...payment, id } : p);
    setPayments(updated);
    save(KEYS.payments, updated);
  }, [payments]);

  const deletePayment = useCallback((id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    save(KEYS.payments, updated);
  }, [payments]);

  const addAdmin = useCallback((admin: Omit<Admin, 'id'>) => {
    const newAdmin: Admin = { ...admin, id: generateId() };
    const updated = [...admins, newAdmin];
    setAdmins(updated);
    save(KEYS.admins, updated);
    return newAdmin;
  }, [admins]);

  const updateAdmin = useCallback((id: string, admin: Omit<Admin, 'id'>) => {
    const updated = admins.map(a => a.id === id ? { ...admin, id } : a);
    setAdmins(updated);
    save(KEYS.admins, updated);
  }, [admins]);

  const deleteAdmin = useCallback((id: string) => {
    const updated = admins.filter(a => a.id !== id);
    setAdmins(updated);
    save(KEYS.admins, updated);
  }, [admins]);

  const addSale = useCallback((sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = { ...sale, id: generateId() };
    const updated = [...sales, newSale];
    setSales(updated);
    save(KEYS.sales, updated);
    return newSale;
  }, [sales]);

  const updateSale = useCallback((id: string, sale: Omit<Sale, 'id'>) => {
    const updated = sales.map(s => s.id === id ? { ...sale, id } : s);
    setSales(updated);
    save(KEYS.sales, updated);
  }, [sales]);

  const deleteSale = useCallback((id: string) => {
    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    save(KEYS.sales, updated);
  }, [sales]);

  // Demo data loader
  const loadDemoData = useCallback(() => {
    const now = new Date();
    const day = (offset: number) => 
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset)
        .toISOString().slice(0, 10);

    const demoCustomers: Customer[] = [
      { id: generateId(), name: 'Budi Santoso', username: 'budi_s', note: '' },
      { id: generateId(), name: 'Siti Aminah', username: 'siti_aminah', note: '' },
      { id: generateId(), name: 'Andi Wijaya', username: 'andiw', note: '' }
    ];

    const demoProducts: Product[] = [
      { id: generateId(), name: 'Kaos Polos', type: 'Fashion', sku: 'TS-PLS' },
      { id: generateId(), name: 'Botol Minum', type: 'Aksesori', sku: 'BOT-01' },
      { id: generateId(), name: 'Notebook A5', type: 'ATK', sku: 'NB-A5' }
    ];

    const demoChannels: Channel[] = [
      { id: generateId(), name: 'WhatsApp', desc: 'Chat WA', url: '' },
      { id: generateId(), name: 'TikTok Shop', desc: 'Marketplace TT', url: '' },
      { id: generateId(), name: 'Instagram', desc: 'DM IG', url: '' }
    ];

    const updatedCustomers = [...customers, ...demoCustomers];
    const updatedProducts = [...products, ...demoProducts];
    const updatedChannels = [...channels, ...demoChannels];

    setCustomers(updatedCustomers);
    setProducts(updatedProducts);
    setChannels(updatedChannels);

    save(KEYS.customers, updatedCustomers);
    save(KEYS.products, updatedProducts);
    save(KEYS.channels, updatedChannels);

    const demoSales: Sale[] = [
      {
        id: generateId(),
        customer: demoCustomers[0].id,
        product: demoProducts[0].id,
        channel: demoChannels[0].id,
        payment: payments[0]?.id || '',
        admin: admins[0]?.id || '',
        price: 120000,
        date: day(0),
        shipDate: '',
        note: 'Ukuran M',
        link: ''
      },
      {
        id: generateId(),
        customer: demoCustomers[1].id,
        product: demoProducts[1].id,
        channel: demoChannels[1].id,
        payment: payments[0]?.id || '',
        admin: admins[0]?.id || '',
        price: 85000,
        date: day(1),
        shipDate: '',
        note: 'Warna biru',
        link: ''
      },
      {
        id: generateId(),
        customer: demoCustomers[2].id,
        product: demoProducts[2].id,
        channel: demoChannels[2].id,
        payment: payments[0]?.id || '',
        admin: admins[0]?.id || '',
        price: 25000,
        date: day(2),
        shipDate: '',
        note: '',
        link: ''
      }
    ];

    const updatedSales = [...sales, ...demoSales];
    setSales(updatedSales);
    save(KEYS.sales, updatedSales);
  }, [customers, products, channels, payments, admins, sales]);

  // Reset all data
  const resetAllData = useCallback(() => {
    const keys = Object.values(KEYS);
    keys.forEach(key => localStorage.removeItem(key));
    
    setCustomers([]);
    setProducts([]);
    setChannels([]);
    setPayments([]);
    setAdmins([]);
    setSales([]);
  }, []);

  // Export data
  const exportData = useCallback(() => {
    const data = {
      customers,
      products,
      channels,
      payments,
      admins,
      sales
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pos-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [customers, products, channels, payments, admins, sales]);

  // Import data
  const importData = useCallback((file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.customers) {
            setCustomers(data.customers);
            save(KEYS.customers, data.customers);
          }
          if (data.products) {
            setProducts(data.products);
            save(KEYS.products, data.products);
          }
          if (data.channels) {
            setChannels(data.channels);
            save(KEYS.channels, data.channels);
          }
          if (data.payments) {
            setPayments(data.payments);
            save(KEYS.payments, data.payments);
          }
          if (data.admins) {
            setAdmins(data.admins);
            save(KEYS.admins, data.admins);
          }
          if (data.sales) {
            setSales(data.sales);
            save(KEYS.sales, data.sales);
          }
          
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    // Data
    customers,
    products,
    channels,
    payments,
    admins,
    sales,
    
    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Channel operations
    addChannel,
    updateChannel,
    deleteChannel,
    
    // Payment operations
    addPayment,
    updatePayment,
    deletePayment,
    
    // Admin operations
    addAdmin,
    updateAdmin,
    deleteAdmin,
    
    // Sale operations
    addSale,
    updateSale,
    deleteSale,
    
    // Utility operations
    loadDemoData,
    resetAllData,
    exportData,
    importData
  };
};