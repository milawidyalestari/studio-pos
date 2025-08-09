# Changelog

## [Unreleased] - 2024-12-19

### Added
- **CustomerInfoSection**: Menambahkan fitur untuk menampilkan tanggal pembuatan order saat dalam mode edit
  - Field `createdAt` ditambahkan ke interface `CustomerInfoSectionProps`
  - Label berubah dari "Tanggal Order" menjadi "Tanggal Dibuat" saat dalam mode edit
  - Tanggal pembuatan ditampilkan dalam format Indonesia (contoh: "19 Desember 2024")
  - Field hanya muncul saat `isEditMode` aktif dan data `createdAt` tersedia
  - Input tanggal tetap tersedia untuk order baru

### Technical Details
- Menambahkan `createdAt?: string` ke interface `CustomerInfoSectionProps`
- Menambahkan `createdAt: undefined` ke `initialFormData` di `RequestOrderModal.tsx`
- Menambahkan mapping `createdAt` dari `editingOrder.created_at` saat mengisi form data
- Menggunakan `toLocaleDateString('id-ID')` untuk format tanggal Indonesia
- Styling menggunakan background abu-abu untuk membedakan dari input yang dapat diedit

### Database
- Field `created_at` sudah tersedia di tabel `orders` (TIMESTAMP WITH TIME ZONE DEFAULT now())
- Query di `useOrders.ts` sudah menggunakan `created_at` untuk ordering
- Tipe database sudah mencakup `created_at: string | null` 