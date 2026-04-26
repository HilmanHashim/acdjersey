## Invoice Log Controls in CRM

I’ll update the Invoice Log section inside the Invoice page with:

1. **Pagination**
   - Show only **10 invoice log rows per page**.
   - Add Previous / Next controls and a page indicator.
   - Reset back to page 1 when search results change.

2. **Search by title**
   - Add a search bar above the invoice log table.
   - Filter logs by `title` / `project_title` so you can quickly find past invoices.
   - Keep the current refresh button.

3. **Delete invoice log rows**
   - Add a Delete button per invoice log row.
   - Show a confirmation dialog before deleting.
   - Delete the row from the `invoices_log` database table, not just from the screen.
   - Refresh the table after deletion.

## Technical details

- Update `src/components/crm/InvoiceTab.tsx`:
  - Add `searchTerm`, `currentPage`, and delete-loading state.
  - Filter invoice logs by title before paginating.
  - Render only 10 rows from the filtered result.
  - Add a confirmation dialog using the existing UI components.
  - Call `.delete().eq("id", log.id)` on `invoices_log`.

- Add a database access rule for deleting invoice logs:
  - Existing table currently allows viewing and creating logs, but not deleting.
  - Add a DELETE policy matching the existing safer pattern: invoice creator, admin, or superadmin can delete invoice logs.
  - No new table columns are needed.