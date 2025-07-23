
import { Product } from '@/hooks/useProducts';

export interface MaterialForPricing {
  lebar_maksimum: number; // dalam cm
}

// Fungsi pembulatan custom ratusan
function customRounding(value: number): number {
  const ribuan = Math.floor(value / 1000) * 1000;
  const sisa = value - ribuan;
  if (sisa >= 1 && sisa <= 499) return ribuan;
  if (sisa >= 500 && sisa <= 999) return ribuan + 1000;
  return value; // Sudah bulat ribuan
}

export const calculateProductPrice = (
  product: Product,
  quantity: number,
  panjang?: number,
  lebar?: number,
  material?: MaterialForPricing
): number => {
  if (!product || quantity <= 0) return 0;

  // Jika harga dikunci (absolut)
  if (product.kunci_harga) {
    return customRounding((product.harga_jual || 0) * quantity);
  }

  // Harga relatif (butuh material dan dimensi)
  if (material && panjang && lebar) {
    // Sisi terdekat ke lebar maksimum bahan
    // sisi_terdekat = sisi order (panjang atau lebar) yang paling mendekati lebar_maksimum_bahan
    const sisiOrder = [panjang, lebar];
    const lebarMaks = material.lebar_maksimum;
    // Cari sisi order yang paling mendekati lebar maksimum bahan
    const sisiTerdekat = sisiOrder.reduce((prev, curr) => {
      return Math.abs(curr - lebarMaks) < Math.abs(prev - lebarMaks) ? curr : prev;
    });
    // Sisi satunya (bukan sisi terdekat)
    const sisiSatunya = sisiOrder.find(s => s !== sisiTerdekat) || sisiTerdekat;
    // Rumus: lebar_maksimum_bahan * sisi satunya * (harga_jual/10000) * quantity
    // (lebar_maksimum_bahan dan sisi satunya dalam cm)
    const hargaPerUnit = lebarMaks * sisiSatunya * ((product.harga_jual || 0) / 10000);
    const total = hargaPerUnit * quantity;
    const rounded = customRounding(total);
    // Validasi: jika hasil < 10.000, bulatkan ke 10.000
    return rounded < 10000 ? 10000 : rounded;
  }

  // Fallback: harga absolut jika data tidak lengkap
  return customRounding((product.harga_jual || 0) * quantity);
};

export const formatCurrency = (amount: number): string => {
  return `IDR ${amount.toLocaleString('id-ID')}`;
};
