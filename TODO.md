# Refactor Data Fetching to React Query

## Tasks
- [ ] Refactor useData.ts to use React Query hooks
  - [ ] Replace useState with useQuery for data fetching (customers, products, channels, payments, admins, sales)
  - [ ] Replace manual fetch functions with useQuery fetchers
  - [ ] Replace CRUD operations with useMutation hooks
  - [ ] Remove useEffect that fetches all data on mount
  - [ ] Update query invalidation for mutations
- [ ] Test data persistence across menu/tab changes
- [ ] Verify CRUD operations work with React Query
