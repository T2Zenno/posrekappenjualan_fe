# Fix Add/Post Errors in Frontend

## Tasks
- [x] Add fetchCsrfCookie function in useData.ts
- [x] Update all mutation functions to call fetchCsrfCookie before POST/PUT/DELETE
- [x] Fix Sale interface and mutations: change customer to customer_id, product to product_id, etc., shipDate to ship_date
- [x] Fix Payment interface: change desc to description, code to type
- [x] Update Payment mutations accordingly
- [x] Add 'Accept': 'application/json' header to sales and payments mutations to prevent 302 redirects
- [ ] Test add operations for all sections
