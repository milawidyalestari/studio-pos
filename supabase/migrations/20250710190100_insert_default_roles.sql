-- Insert default roles
INSERT INTO roles (name, description)
VALUES
  ('Administrator', 'Akses penuh ke seluruh sistem'),
  ('Kasir', 'Akses kasir dan transaksi'),
  ('Desain', 'Akses fitur desain dan file'),
  ('Produksi', 'Akses fitur produksi dan proses cetak'),
  ('Owner', 'Akses monitoring dan laporan'),
  ('Viewer', 'Hanya bisa melihat data')
ON CONFLICT (name) DO NOTHING; 