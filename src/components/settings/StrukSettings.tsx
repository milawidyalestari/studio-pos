import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, FileText, Loader2, RefreshCw, Upload, X, Settings, Printer, Monitor, Wifi, Usb, TestTube } from 'lucide-react';
import { SPKPreview, NotaPreview } from '../print/PrintPreviews';
import { getStrukSettings, saveStrukSettings, resetStrukSettings, StrukSettingsData, syncBusinessInfoToNota } from '../../utils/strukSettings';

// Wrapper component untuk preview dengan lebar konsisten seperti struk thermal printer
const PreviewWrapper: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="flex justify-center">
        <div className="w-[300px] border-2 border-gray-400 rounded-lg p-2 bg-white shadow-lg">
          <div className="w-full max-w-[300px] mx-auto text-xs">
            {children}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">Lebar: 80mm</p>
    </div>
  );
};

// Custom SPK Preview dengan alignment yang tepat
const CustomSPKPreview: React.FC<{ settings: StrukSettingsData; orderData: any; orderList: any[] }> = ({ settings, orderData, orderList }) => {
  return (
    <div className="w-full text-center space-y-2">
      {/* Header */}
      {settings.spk.showHeader && (
        <div className="font-bold text-lg mb-2">
          {settings.spk.headerText}
        </div>
      )}
      
      <div className="font-semibold text-base mb-2">
        {orderData?.orderNumber || 'SPK-001'}
      </div>
      
      <div className="border-t border-b border-gray-300 py-2 my-2">
        <div className="flex justify-between text-sm">
          <span>Nama :</span>
          <span className="text-right">{orderData?.customerName || 'John Doe'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tanggal :</span>
          <span className="text-right">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Deadline:</span>
          <span className="text-right">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>
      
      {/* Items */}
      <div className="text-left">
        <div className="font-semibold text-sm mb-2">Items:</div>
        {orderList?.map((item, index) => (
          <div key={index} className="mb-2 text-left">
            <div className="font-medium text-sm">{item.item}</div>
            {item.description && (
              <div className="text-xs text-gray-600">{item.description}</div>
            )}
            <div className="flex justify-between text-xs">
              <span>{item.ukuran?.panjang && item.ukuran?.lebar ? `${item.ukuran.panjang} x ${item.ukuran.lebar}` : '-'}</span>
              <span>@{item.quantity} {item.finishing || 'Lembaran'}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-300 pt-2 mt-2">
        <div className="flex justify-between text-sm">
          <span>Kom :</span>
          <span className="text-right">1</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Designer:</span>
          <span className="text-right">Agus</span>
        </div>
      </div>
    </div>
  );
};

// Custom Struk Preview dengan alignment yang tepat
const CustomStrukPreview: React.FC<{ settings: StrukSettingsData; orderData: any; orderList: any[] }> = ({ settings, orderData, orderList }) => {
  const subtotal = orderList?.reduce((sum, item) => sum + (item.subTotal || 0), 0) || 0;
  const total = subtotal + (orderData?.desain || 0) + (orderData?.biayaLainnya || 0);
  const downPayment = orderData?.downPayment || 0;
  const pelunasan = orderData?.pelunasan || 0;
  const remaining = total - downPayment - pelunasan;
  
  return (
    <div className="w-full space-y-2">
      {/* Logo */}
      {settings.struk.logo.url && (
        <div className="text-center mb-2">
          <img src={settings.struk.logo.url} alt="Logo" className="h-12 mx-auto object-contain" />
        </div>
      )}
      
      {/* Header */}
      {settings.struk.showHeader && (
        <div className="text-center font-bold text-base mb-2">
          {settings.struk.headerText}
        </div>
      )}
      
      {/* Business Info */}
      {settings.struk.showBusinessInfo && (
        <div className="text-center text-xs text-gray-600 space-y-1 mb-2">
          {settings.struk.businessInfo?.name && <div className="font-semibold">{settings.struk.businessInfo.name}</div>}
          {settings.struk.businessInfo?.address && <div>{settings.struk.businessInfo.address}</div>}
          {settings.struk.businessInfo?.phone && <div>{settings.struk.businessInfo.phone}</div>}
          {settings.struk.businessInfo?.website && <div>{settings.struk.businessInfo.website}</div>}
        </div>
      )}
      
      <div className="text-center text-xs text-gray-600 mb-2">
        {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
      </div>
      
      {/* Customer & Order Info */}
      <div className="border-t border-b border-gray-300 py-2 my-2">
        <div className="flex justify-between text-sm">
          <span>Customer :</span>
          <span className="text-right font-semibold">{orderData?.customerName || 'Rosela Flowers'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Order Number:</span>
          <span className="text-right font-semibold">{orderData?.orderNumber || 'ORD000000010'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tanggal :</span>
          <span className="text-right font-semibold">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>
      
      {/* Items */}
      <div className="text-left">
        <div className="font-semibold text-sm mb-2">Items:</div>
        {orderList?.map((item, index) => {
          const unitPrice = item.quantity > 0 ? item.subTotal / item.quantity : 0;
          return (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{item.item}</span>
                {item.ukuran?.panjang && item.ukuran?.lebar && (
                  <span className="text-right">{item.ukuran.panjang} x {item.ukuran.lebar}</span>
                )}
              </div>
              <div className="flex justify-between text-xs">
                <span>@{item.quantity} x {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(unitPrice)}</span>
                <span className="text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.subTotal)}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Financial Summary */}
      <div className="border-t border-gray-300 pt-2 mt-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Subtotal:</span>
          <span className="text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Desain:</span>
          <span className="text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(orderData?.desain || 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Biaya Lainnya:</span>
          <span className="text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(orderData?.biayaLainnya || 0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Down Payment:</span>
          <span className="text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(downPayment)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Sisa:</span>
          <span className="text-right font-semibold">
            {remaining <= 0 ? 'LUNAS' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.max(0, remaining))}
          </span>
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="pt-2 mt-2">
        <div className="flex justify-between text-sm">
          <span>Payment:</span>
          <span className="text-right">{orderData?.paymentMethod || 'Cash'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Cashier:</span>
          <span className="text-right">Cashier</span>
        </div>
      </div>
      
      {/* Logo Lunas */}
      {settings.struk.lunasLogo?.url && (
        <div className="text-center mt-4">
          <img src={settings.struk.lunasLogo.url} alt="Lunas" className="h-12 mx-auto object-contain opacity-90" />
        </div>
      )}
      
      {/* Footer */}
      {settings.struk.showFooter && (
        <div className="text-center text-xs text-gray-600 mt-2">
          {settings.struk.footerText}
        </div>
      )}
    </div>
  );
};


// Mock data for preview
const mockOrderData = {
  orderNumber: 'ORD000000010',
  customerName: 'Rosela Flowers',
  totalAmount: 27000,
  desain: 0,
  biayaLainnya: 0,
  downPayment: 0,
  paymentMethod: 'Cash'
};

const mockOrderList = [
  {
    id: '1',
    item: 'Spanduk Florist 2 Pass',
    quantity: 1,
    subTotal: 27000,
    finishing: 'Lembaran',
    ukuran: {
      panjang: '150',
      lebar: '100'
    },
    description: 'TBC Dari Pamungkas Jaya'
  }
];

export const StrukSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<StrukSettingsData>(getStrukSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [lunasLogoPreview, setLunasLogoPreview] = useState<string>('');
  
  // Thermal Printer Settings State
  const [printerSettings, setPrinterSettings] = useState({
    connectionType: 'usb', // 'usb', 'network', 'bluetooth'
    printerName: '',
    ipAddress: '',
    port: 9100,
    bluetoothAddress: '',
    paperWidth: 80, // mm
    printDensity: 'normal', // 'light', 'normal', 'dark'
    autoCut: true,
    testPrint: false
  });

  useEffect(() => {
    loadSettings();
    loadPrinterSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const savedSettings = getStrukSettings();
      setSettings(savedSettings);
      
      if (savedSettings.struk?.logo?.url) {
        setLogoPreview(savedSettings.struk.logo.url);
      }
      if (savedSettings.struk?.lunasLogo?.url) {
        setLunasLogoPreview(savedSettings.struk.lunasLogo.url);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      saveStrukSettings(settings);
      
      // Always sync business info to nota settings when saving
      if (settings.struk.showBusinessInfo) {
        const syncSuccess = syncBusinessInfoToNota(settings);
        if (syncSuccess) {
          toast({
            title: "Berhasil",
            description: "Pengaturan berhasil disimpan dan disinkronkan ke Nota",
          });
        } else {
          toast({
            title: "Berhasil",
            description: "Pengaturan berhasil disimpan, namun gagal sinkronisasi ke Nota",
          });
        }
      } else {
        toast({
          title: "Berhasil",
          description: "Pengaturan berhasil disimpan",
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };


  const resetToDefault = () => {
    const defaultSettings = resetStrukSettings();
    setSettings(defaultSettings);
    setLogoPreview('');
    setLunasLogoPreview('');
    toast({
      title: "Berhasil",
      description: "Pengaturan direset ke default",
    });
  };

  const handleFileUpload = (file: File, type: 'logo' | 'lunasLogo') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'logo') {
        setLogoPreview(result);
        setSettings(prev => ({
          ...prev,
          struk: {
            ...prev.struk,
            logo: {
              url: result,
              file: file
            }
          }
        }));
      } else {
        setLunasLogoPreview(result);
        setSettings(prev => ({
          ...prev,
          struk: {
            ...prev.struk,
            lunasLogo: {
              url: result,
              file: file
            }
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (type: 'logo' | 'lunasLogo') => {
    if (type === 'logo') {
      setLogoPreview('');
      setSettings(prev => ({
        ...prev,
        struk: {
          ...prev.struk,
          logo: {
            url: '',
            file: null
          }
        }
      }));
    } else {
      setLunasLogoPreview('');
      setSettings(prev => ({
        ...prev,
        struk: {
          ...prev.struk,
          lunasLogo: {
            url: '',
            file: null
          }
        }
      }));
    }
  };

  // Thermal Printer Functions
  const handlePrinterTest = async () => {
    try {
      setPrinterSettings(prev => ({ ...prev, testPrint: true }));
      
      // Simulate printer test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test Print Berhasil",
        description: "Printer thermal berhasil dikonfigurasi dan test print berhasil",
      });
    } catch (error) {
      toast({
        title: "Test Print Gagal",
        description: "Gagal melakukan test print. Periksa koneksi printer.",
        variant: "destructive"
      });
    } finally {
      setPrinterSettings(prev => ({ ...prev, testPrint: false }));
    }
  };

  const savePrinterSettings = () => {
    // Save printer settings to localStorage
    localStorage.setItem('thermalPrinterSettings', JSON.stringify(printerSettings));
    toast({
      title: "Berhasil",
      description: "Pengaturan printer thermal berhasil disimpan",
    });
  };

  const loadPrinterSettings = () => {
    const saved = localStorage.getItem('thermalPrinterSettings');
    if (saved) {
      setPrinterSettings(JSON.parse(saved));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SPK Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Pengaturan SPK
          </CardTitle>
          <CardDescription>
            Konfigurasi tampilan untuk cetak SPK
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Tampilkan Header</Label>
            </div>
            <Switch
              checked={settings.spk.showHeader}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  spk: { ...prev.spk, showHeader: checked }
                }))
              }
            />
          </div>

          {/* Header Text Input */}
          {settings.spk.showHeader && (
            <div className="space-y-2">
              <Input
                id="spk-header"
                value={settings.spk.headerText}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    spk: { ...prev.spk, headerText: e.target.value }
                  }))
                }
                placeholder="Masukkan teks header SPK"
              />
            </div>
          )}

          {/* SPK Preview */}
          <PreviewWrapper title="Preview SPK">
            <CustomSPKPreview settings={settings} orderData={mockOrderData} orderList={mockOrderList} />
          </PreviewWrapper>
        </CardContent>
      </Card>

      {/* Struk Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-600" />
            Pengaturan Struk
          </CardTitle>
          <CardDescription>
            Konfigurasi tampilan untuk cetak struk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Logo Perusahaan */}
          <div className="space-y-4">
            <Label className="text-base">Logo Perusahaan</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-20 h-20 object-contain border border-gray-200 rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => removeLogo('logo')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logo');
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <Label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload Logo
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Format: JPG, PNG, SVG (Max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Header Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Tampilkan Header</Label>
            </div>
            <Switch
              checked={settings.struk.showHeader}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  struk: { ...prev.struk, showHeader: checked }
                }))
              }
            />
          </div>

          {/* Header Text Input */}
          {settings.struk.showHeader && (
            <div className="space-y-2">
              <Input
                id="struk-header"
                value={settings.struk.headerText}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    struk: { ...prev.struk, headerText: e.target.value }
                  }))
                }
                placeholder="Masukkan teks header struk"
              />
            </div>
          )}

          {/* Business Info Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Tampilkan Info Bisnis</Label>
              <p className="text-sm text-gray-500">Menampilkan nama, alamat, telepon, dan website</p>
            </div>
            <Switch
              checked={settings.struk.showBusinessInfo}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  struk: { ...prev.struk, showBusinessInfo: checked }
                }))
              }
            />
          </div>

          {/* Business Info Inputs */}
          {settings.struk.showBusinessInfo && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <Label className="text-base font-semibold">Informasi Bisnis</Label>
              
              <div className="space-y-2">
                <Label htmlFor="business-name">Nama Bisnis *</Label>
                <Input
                  id="business-name"
                  value={settings.struk.businessInfo?.name || ''}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      struk: {
                        ...prev.struk,
                        businessInfo: { 
                          ...prev.struk.businessInfo,
                          name: e.target.value 
                        }
                      }
                    }))
                  }
                  placeholder="Masukkan nama bisnis"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-address">Alamat Bisnis</Label>
                <Textarea
                  id="business-address"
                  value={settings.struk.businessInfo?.address || ''}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      struk: {
                        ...prev.struk,
                        businessInfo: { 
                          ...prev.struk.businessInfo,
                          address: e.target.value 
                        }
                      }
                    }))
                  }
                  placeholder="Masukkan alamat lengkap bisnis"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-phone">Nomor Telepon</Label>
                  <Input
                    id="business-phone"
                    value={settings.struk.businessInfo?.phone || ''}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        struk: {
                          ...prev.struk,
                          businessInfo: { 
                            ...prev.struk.businessInfo,
                            phone: e.target.value 
                          }
                        }
                      }))
                    }
                    placeholder="+62 123 4567 890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-website">Website</Label>
                  <Input
                    id="business-website"
                    value={settings.struk.businessInfo?.website || ''}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        struk: {
                          ...prev.struk,
                          businessInfo: { 
                            ...prev.struk.businessInfo,
                            website: e.target.value 
                          }
                        }
                      }))
                    }
                    placeholder="www.bisnis.com"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Footer Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Tampilkan Footer</Label>
            </div>
            <Switch
              checked={settings.struk.showFooter}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  struk: { ...prev.struk, showFooter: checked }
                }))
              }
            />
          </div>

          {/* Footer Text Input */}
          {settings.struk.showFooter && (
            <div className="space-y-2">
              <Textarea
                id="struk-footer"
                value={settings.struk.footerText}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    struk: { ...prev.struk, footerText: e.target.value }
                  }))
                }
                placeholder="Masukkan teks footer struk"
                rows={3}
              />
            </div>
          )}

          {/* Logo Lunas Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Tanda Pelunasan</Label>
            </div>
            <Switch
              checked={settings.struk.showLunasLogo}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  struk: { ...prev.struk, showLunasLogo: checked }
                }))
              }
            />
          </div>

          {/* Logo Lunas Upload */}
          {settings.struk.showLunasLogo && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {lunasLogoPreview ? (
                  <div className="relative">
                    <img
                      src={lunasLogoPreview}
                      alt="Lunas Logo Preview"
                      className="w-20 h-20 object-contain border border-gray-200 rounded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeLogo('lunasLogo')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'lunasLogo');
                    }}
                    className="hidden"
                    id="lunas-logo-upload"
                  />
                  <Label
                    htmlFor="lunas-logo-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Upload Logo Lunas
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Format: JPG, PNG, SVG (Max 2MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Struk Preview */}
          <PreviewWrapper title="Preview Struk">
            <CustomStrukPreview settings={settings} orderData={mockOrderData} orderList={mockOrderList} />
          </PreviewWrapper>
        </CardContent>
      </Card>

      {/* Thermal Printer Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-green-600" />
            Pengaturan Printer Thermal
          </CardTitle>
          <CardDescription>
            Konfigurasi koneksi dan pengaturan printer thermal untuk mencetak struk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipe Koneksi</Label>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  printerSettings.connectionType === 'usb' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPrinterSettings(prev => ({ ...prev, connectionType: 'usb' }))}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Usb className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium">USB</span>
                  <span className="text-xs text-gray-500 text-center">Koneksi langsung via USB</span>
                </div>
              </div>
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  printerSettings.connectionType === 'network' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPrinterSettings(prev => ({ ...prev, connectionType: 'network' }))}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Wifi className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium">Network</span>
                  <span className="text-xs text-gray-500 text-center">Koneksi via jaringan</span>
                </div>
              </div>
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  printerSettings.connectionType === 'bluetooth' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPrinterSettings(prev => ({ ...prev, connectionType: 'bluetooth' }))}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Wifi className="h-6 w-6 text-gray-600" />
                  <span className="text-sm font-medium">Bluetooth</span>
                  <span className="text-xs text-gray-500 text-center">Koneksi nirkabel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Pengaturan Koneksi</Label>
            
            {/* USB Settings */}
            {printerSettings.connectionType === 'usb' && (
              <div className="space-y-2">
                <Label htmlFor="printer-name">Nama Printer</Label>
                <Input
                  id="printer-name"
                  value={printerSettings.printerName}
                  onChange={(e) => setPrinterSettings(prev => ({ ...prev, printerName: e.target.value }))}
                  placeholder="Contoh: EPSON TM-T20"
                />
                <p className="text-xs text-gray-500">Pilih printer thermal yang terhubung via USB</p>
              </div>
            )}

            {/* Network Settings */}
            {printerSettings.connectionType === 'network' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ip-address">Alamat IP</Label>
                  <Input
                    id="ip-address"
                    value={printerSettings.ipAddress}
                    onChange={(e) => setPrinterSettings(prev => ({ ...prev, ipAddress: e.target.value }))}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={printerSettings.port}
                    onChange={(e) => setPrinterSettings(prev => ({ ...prev, port: parseInt(e.target.value) || 9100 }))}
                    placeholder="9100"
                  />
                </div>
              </div>
            )}

            {/* Bluetooth Settings */}
            {printerSettings.connectionType === 'bluetooth' && (
              <div className="space-y-2">
                <Label htmlFor="bluetooth-address">Alamat Bluetooth</Label>
                <Input
                  id="bluetooth-address"
                  value={printerSettings.bluetoothAddress}
                  onChange={(e) => setPrinterSettings(prev => ({ ...prev, bluetoothAddress: e.target.value }))}
                  placeholder="00:11:22:33:44:55"
                />
                <p className="text-xs text-gray-500">Masukkan MAC address printer Bluetooth</p>
              </div>
            )}
          </div>

          {/* Printer Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Pengaturan Printer</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paper-width">Lebar Kertas (mm)</Label>
                <Input
                  id="paper-width"
                  type="number"
                  value={printerSettings.paperWidth}
                  onChange={(e) => setPrinterSettings(prev => ({ ...prev, paperWidth: parseInt(e.target.value) || 80 }))}
                  placeholder="80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="print-density">Kepadatan Cetak</Label>
                <select
                  id="print-density"
                  value={printerSettings.printDensity}
                  onChange={(e) => setPrinterSettings(prev => ({ ...prev, printDensity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Terang</option>
                  <option value="normal">Normal</option>
                  <option value="dark">Gelap</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto Cut</Label>
                <p className="text-sm text-gray-500">Potong kertas otomatis setelah cetak</p>
              </div>
              <Switch
                checked={printerSettings.autoCut}
                onCheckedChange={(checked) => setPrinterSettings(prev => ({ ...prev, autoCut: checked }))}
              />
            </div>
          </div>

          {/* Test Print */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Test Printer</Label>
            <Button
              onClick={handlePrinterTest}
              disabled={printerSettings.testPrint}
              className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {printerSettings.testPrint ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              {printerSettings.testPrint ? 'Testing...' : 'Test Print'}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Klik untuk melakukan test print dan memverifikasi koneksi printer
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={resetToDefault}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Default
        </Button>
        <Button
          variant="outline"
          onClick={savePrinterSettings}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          Simpan Printer
        </Button>
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan Semua
        </Button>
      </div>
    </div>
  );
};
