# Refactor Data Fetching to React Query

## Overview
Refactor the data fetching system in the React frontend to fully use React Query (TanStack Query) for caching and persistence across menu/tab changes. Replace manual fetch + useState with React Query mutations and queries.

## Tasks
- [ ] Refactor `useData.ts` hook:
  - Fix queries to return data directly (e.g., customers: customersQuery.data || [])
  - Replace manual CRUD operations with `useMutation`
  - Remove manual `setState` calls and manual fetch in mutations
  - Use `queryClient.invalidateQueries` after mutations to update cache
- [ ] Update components to remove manual polling and fetch calls:
  - [ ] ProductManager.tsx: Remove useEffect with fetchProducts and interval
  - [ ] CustomerManager.tsx: Similar updates
  - [ ] AdminManager.tsx: Similar updates
  - [ ] ChannelManager.tsx: Similar updates
  - [ ] PaymentManager.tsx: Similar updates
  - [ ] SalesManager.tsx: Similar updates
- [ ] Test persistence across tab/menu changes
- [ ] Ensure no data resets when switching sections

## Dependent Files
- `frontend_posrekappenjualan/src/hooks/useData.ts`
- `frontend_posrekappenjualan/src/components/ProductManager.tsx`
- `frontend_posrekappenjualan/src/components/CustomerManager.tsx`
- `frontend_posrekappenjualan/src/components/AdminManager.tsx`
- `frontend_posrekappenjualan/src/components/ChannelManager.tsx`
- `frontend_posrekappenjualan/src/components/PaymentManager.tsx`
- `frontend_posrekappenjualan/src/components/SalesManager.tsx`
