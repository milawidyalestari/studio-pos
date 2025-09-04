import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { Save, Eye, FileText, Loader2, RefreshCw, Upload, X, Stamp } from 'lucide-react';
import { getNotaSettings, saveNotaSettings, NotaSettingsData } from '@/utils/notaSettings';
import { PaymentStamp } from '../print/PaymentStamp';

export const NotaSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotaSettingsData>(getNotaSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [previewStampStatus, setPreviewStampStatus] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const savedSettings = getNotaSettings();
      setSettings(savedSettings);
      
      // If there's a saved logo URL, set it as preview
      if (savedSettings.logo.url) {
        setLogoPreview(savedSettings.logo.url);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "File tidak valid",
          description: "Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, SVG)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 5MB",
          variant: "destructive"
        });
        return;
      }

      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setSettings(prev => ({
          ...prev,
          logo: { ...prev.logo, url: result }
        }));
      };
      reader.readAsDataURL(file);

      toast({
        title: "Logo berhasil diupload",
        description: "Logo telah berhasil diupload dan ditampilkan",
      });
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setSettings(prev => ({
      ...prev,
      logo: { ...prev.logo, url: '', enabled: false }
    }));
    
    toast({
      title: "Logo dihapus",
      description: "Logo telah dihapus dari pengaturan",
    });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would typically upload the file to your server/storage
      // and get back a permanent URL. For now, we'll save the data URL
      // In a real application, you'd want to:
      // 1. Upload the file to your server/storage (e.g., Supabase Storage, AWS S3)
      // 2. Get back a permanent URL
      // 3. Save that URL in your settings
      
      saveNotaSettings(settings);
      
      toast({
        title: "Settings saved",
        description: "Your nota settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Yakin ingin mengembalikan ke pengaturan default? Semua pengaturan kustom akan hilang.')) {
      // Clear localStorage to force default settings
      localStorage.removeItem('notaSettings');
      const defaultSettings = getNotaSettings();
      setSettings(defaultSettings);
      setLogoFile(null);
      setLogoPreview(defaultSettings.logo.url || '');
      toast({
        title: "Pengaturan direset",
        description: "Pengaturan telah dikembalikan ke default termasuk stamp settings",
      });
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const previewContent = generatePreviewReceipt();
      setPreviewData(previewContent);
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview gagal",
        description: "Terjadi kesalahan saat membuat preview",
        variant: "destructive"
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const generatePreviewReceipt = (): string => {
    const now = new Date();
    const orderNumber = `PREVIEW-${Date.now().toString().slice(-6)}`;
    
    return `
      <div style="font-family: monospace; font-size: 12px; line-height: 1.2; max-width: 300px; margin: 0 auto;">
        ${settings.logo.enabled && logoPreview ? `
        <div style="text-align: center; margin-bottom: 10px;">
          <img src="${logoPreview}" alt="${settings.logo.altText}" style="width: ${settings.logo.width}px; height: ${settings.logo.height}px; object-fit: contain;">
        </div>
        ` : ''}
        
        <div style="text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 16px;">
          ${settings.businessInfo.name || 'STUDIO POS'}
        </div>
        
        ${settings.businessInfo.address ? `
        <div style="text-align: center; font-size: 11px; margin-bottom: 5px;">
          ${settings.businessInfo.address}
        </div>
        ` : ''}
        
        ${settings.businessInfo.phone ? `
        <div style="text-align: center; font-size: 11px; margin-bottom: 5px;">
          ${settings.businessInfo.phone}
        </div>
        ` : ''}
        
        ${settings.businessInfo.website ? `
        <div style="text-align: center; font-size: 11px; margin-bottom: 15px;">
          ${settings.businessInfo.website}
        </div>
        ` : ''}
        
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        
        <div style="margin-bottom: 10px;">
          <strong>PREVIEW RECEIPT</strong><br>
          Order: ${orderNumber}<br>
          Date: ${now.toLocaleDateString('id-ID')}<br>
          Time: ${now.toLocaleTimeString('id-ID')}
        </div>
        
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Sample Item 1</span>
            <span>1 x Rp 10,000</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Sample Item 2</span>
            <span>2 x Rp 5,000</span>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Subtotal:</strong></span>
            <span><strong>Rp 20,000</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Tax (11%):</span>
            <span>Rp 2,200</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span><strong>Total:</strong></span>
            <span><strong>Rp 22,200</strong></span>
          </div>
        </div>
        
        <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
        
        ${settings.footer.enabled && settings.footer.text ? `
        <div style="text-align: center; font-size: ${settings.footer.fontSize}px; font-weight: ${settings.footer.fontWeight}; margin-top: 15px;">
          ${settings.footer.text}
        </div>
        ` : ''}
        
        <div style="text-align: center; font-size: 9px; margin-top: 5px; color: #666;">
          Powered by Studio POS
        </div>
      </div>
    `;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Memuat pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Perusahaan</CardTitle>
          <CardDescription>
            Upload logo dari komputer yang akan ditampilkan di nota
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="logoEnabled"
              checked={settings.logo.enabled}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                logo: { ...settings.logo, enabled: checked }
              })}
            />
            <Label htmlFor="logoEnabled">Tampilkan Logo</Label>
          </div>

          {settings.logo.enabled && (
            <>
              {/* Logo Upload Area */}
              <div className="space-y-4">
                {!logoPreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="logoUpload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-800 font-medium">
                          Klik untuk upload logo
                        </span>
                        <span className="text-gray-500 block text-sm mt-1">
                          atau drag & drop file gambar
                        </span>
                      </Label>
                      <Input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Format: JPG, PNG, GIF, SVG (Max: 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Logo Preview */}
                    <div className="text-center">
                      <div className="inline-block relative">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="max-w-full h-auto border rounded-lg shadow-sm"
                          style={{
                            maxWidth: `${settings.logo.width}px`,
                            maxHeight: `${settings.logo.height}px`
                          }}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Logo Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="logoWidth">Lebar (px)</Label>
                        <Input
                          id="logoWidth"
                          type="number"
                          min="20"
                          max="200"
                          value={settings.logo.width}
                          onChange={(e) => setSettings({
                            ...settings,
                            logo: { ...settings.logo, width: parseInt(e.target.value) || 80 }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logoHeight">Tinggi (px)</Label>
                        <Input
                          id="logoHeight"
                          type="number"
                          min="20"
                          max="200"
                          value={settings.logo.height}
                          onChange={(e) => setSettings({
                            ...settings,
                            logo: { ...settings.logo, height: parseInt(e.target.value) || 80 }
                          })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoAltText">Alt Text</Label>
                      <Input
                        id="logoAltText"
                        value={settings.logo.altText}
                        onChange={(e) => setSettings({
                          ...settings,
                          logo: { ...settings.logo, altText: e.target.value }
                        })}
                        placeholder="Deskripsi logo untuk accessibility"
                      />
                    </div>

                    {/* Change Logo Button */}
                    <div className="text-center">
                      <Label htmlFor="logoChange" className="cursor-pointer">
                        <Button variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Ganti Logo
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="logoChange"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Business Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Bisnis</CardTitle>
          <CardDescription>
            Informasi dasar bisnis yang akan ditampilkan di nota
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nama Bisnis *</Label>
            <Input
              id="businessName"
              value={settings.businessInfo.name}
              onChange={(e) => setSettings({
                ...settings,
                businessInfo: { ...settings.businessInfo, name: e.target.value }
              })}
              placeholder="Masukkan nama bisnis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Alamat Bisnis</Label>
            <Textarea
              id="businessAddress"
              value={settings.businessInfo.address}
              onChange={(e) => setSettings({
                ...settings,
                businessInfo: { ...settings.businessInfo, address: e.target.value }
              })}
              placeholder="Masukkan alamat lengkap bisnis"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Nomor Telepon</Label>
              <Input
                id="businessPhone"
                value={settings.businessInfo.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  businessInfo: { ...settings.businessInfo, phone: e.target.value }
                })}
                placeholder="+62 123 4567 890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessWebsite">Website</Label>
              <Input
                id="businessWebsite"
                value={settings.businessInfo.website}
                onChange={(e) => setSettings({
                  ...settings,
                  businessInfo: { ...settings.businessInfo, website: e.target.value }
                })}
                placeholder="www.bisnis.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Section */}
      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
          <CardDescription>
            Konfigurasi teks footer yang akan ditampilkan di nota
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="footerEnabled"
              checked={settings.footer.enabled}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                footer: { ...settings.footer, enabled: checked }
              })}
            />
            <Label htmlFor="footerEnabled">Tampilkan Footer</Label>
          </div>

          {settings.footer.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="footerText">Teks Footer</Label>
                <Textarea
                  id="footerText"
                  value={settings.footer.text}
                  onChange={(e) => setSettings({
                    ...settings,
                    footer: { ...settings.footer, text: e.target.value }
                  })}
                  placeholder="Teks yang ditampilkan di footer nota"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footerFontSize">Ukuran Font (px)</Label>
                  <Input
                    id="footerFontSize"
                    type="number"
                    min="8"
                    max="20"
                    value={settings.footer.fontSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      footer: { ...settings.footer, fontSize: parseInt(e.target.value) || 11 }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footerFontWeight">Ketebalan Font</Label>
                  <select
                    id="footerFontWeight"
                    value={settings.footer.fontWeight}
                    onChange={(e) => setSettings({
                      ...settings,
                      footer: { ...settings.footer, fontWeight: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="bolder">Bolder</option>
                    <option value="lighter">Lighter</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stamp Settings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Stamp className="h-5 w-5" />
            <CardTitle>Pengaturan Cap Stempel</CardTitle>
          </div>
          <CardDescription>
            Konfigurasi cap stempel otomatis untuk status pembayaran "LUNAS" dan "BELUM LUNAS"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Stamp */}
          <div className="flex items-center space-x-2">
            <Switch
              id="stampEnabled"
              checked={settings.stamp.enabled}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                stamp: { ...settings.stamp, enabled: checked }
              })}
            />
            <Label htmlFor="stampEnabled">Aktifkan Cap Stempel</Label>
          </div>

          {settings.stamp.enabled && (
            <div className="space-y-6">

              {/* Upload Image Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Gambar Stempel "Lunas"</Label>
                  <p className="text-sm text-gray-600">
                    Upload gambar stempel yang akan muncul saat nota sudah lunas
                  </p>
                </div>

                <div className="space-y-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="stampImage">Pilih File Gambar</Label>
                    <div className="flex items-center gap-4">
                      <input
                        id="stampImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file type
                            if (!file.type.startsWith('image/')) {
                              toast({
                                title: "File tidak valid",
                                description: "Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, SVG)",
                                variant: "destructive"
                              });
                              return;
                            }

                            // Validate file size (max 2MB)
                            if (file.size > 2 * 1024 * 1024) {
                              toast({
                                title: "File terlalu besar",
                                description: "Ukuran file maksimal 2MB",
                                variant: "destructive"
                              });
                              return;
                            }

                            // Create data URL
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const result = e.target?.result as string;
                              setSettings({
                                ...settings,
                                stamp: { 
                                  ...settings.stamp, 
                                  lunasImageUrl: result,
                                  useImage: true 
                                }
                              });
                              toast({
                                title: "Gambar berhasil diupload",
                                description: "Gambar stempel telah berhasil diupload",
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {settings.stamp.lunasImageUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSettings({
                              ...settings,
                              stamp: { 
                                ...settings.stamp, 
                                lunasImageUrl: '',
                                useImage: false 
                              }
                            });
                            toast({
                              title: "Gambar dihapus",
                              description: "Gambar stempel telah dihapus",
                            });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>


                </div>
              </div>

              {/* Position and Size Settings */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Pengaturan Posisi & Ukuran</Label>
                  <p className="text-sm text-gray-600">
                    Atur posisi dan ukuran stempel pada nota
                  </p>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="stampPosition">Posisi Stempel</Label>
                  <Select 
                    value={settings.stamp.position} 
                    onValueChange={(value) => setSettings({
                      ...settings,
                      stamp: { ...settings.stamp, position: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih posisi stempel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Kiri Atas</SelectItem>
                      <SelectItem value="top-right">Kanan Atas</SelectItem>
                      <SelectItem value="bottom-left">Kiri Bawah</SelectItem>
                      <SelectItem value="bottom-right">Kanan Bawah</SelectItem>
                      <SelectItem value="center">Tengah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="stampSize">Ukuran Stempel: {settings.stamp.size}px</Label>
                  <input
                    id="stampSize"
                    type="range"
                    value={settings.stamp.size}
                    onChange={(e) => setSettings({
                      ...settings,
                      stamp: { ...settings.stamp, size: parseInt(e.target.value) }
                    })}
                    max={200}
                    min={50}
                    step={10}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <Label htmlFor="stampOpacity">Transparansi: {Math.round(settings.stamp.opacity * 100)}%</Label>
                  <input
                    id="stampOpacity"
                    type="range"
                    value={settings.stamp.opacity}
                    onChange={(e) => setSettings({
                      ...settings,
                      stamp: { ...settings.stamp, opacity: parseFloat(e.target.value) }
                    })}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Preview Nota dengan Logo Perusahaan & Stempel "Lunas"</Label>
                  <p className="text-sm text-gray-600">
                    Preview nota lengkap dengan logo perusahaan dan stempel lunas
                  </p>
                </div>
                
                <div className="relative border-2 border-gray-300 rounded-lg bg-white p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                  {/* Header Perusahaan */}
                  {settings.header.enabled && (
                    <div className="text-center mb-4">
                      <div 
                        className="font-bold text-blue-600"
                        style={{
                          fontSize: `${settings.header.fontSize}px`,
                          fontWeight: settings.header.fontWeight as any
                        }}
                      >
                        {settings.header.text}
                      </div>
                    </div>
                  )}
                  
                  {/* Logo Perusahaan */}
                  {settings.logo.enabled && settings.logo.url && (
                    <div className="text-center mb-4">
                      <img
                        src={settings.logo.url}
                        alt={settings.logo.altText}
                        style={{
                          width: `${settings.logo.width}px`,
                          height: `${settings.logo.height}px`
                        }}
                        className="mx-auto mb-2"
                      />
                    </div>
                  )}
                  
                  {/* Business Info */}
                  <div className="text-center mb-4 text-sm text-gray-600">
                    <div>{settings.businessInfo.name}</div>
                    <div>{settings.businessInfo.address}</div>
                    <div>{settings.businessInfo.phone}</div>
                    <div>{settings.businessInfo.website}</div>
                  </div>
                  
                  {/* Nota Header */}
                  <div className="text-center space-y-2 mb-4">
                    <h2 className="text-xl font-bold">NOTA</h2>
                    <p className="text-lg font-semibold">NOTA-2024-001</p>
                  </div>
                  
                  {/* Order Details */}
                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Customer:</span>
                        <span className="ml-2">Contoh Customer</span>
                      </div>
                      <div>
                        <span className="font-medium">Tanggal:</span>
                        <span className="ml-2">{new Date().toLocaleDateString('id-ID')}</span>
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <span className="ml-2">{new Date().toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {/* Sample Items */}
                  <div className="space-y-3 mb-4">
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm flex-1">Spanduk Premium</div>
                        <div className="text-xs text-gray-700 ml-2">150 x 100</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          2 x Rp 200.000
                        </div>
                        <div className="text-xs font-medium">
                          Rp 400.000
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm flex-1">Kartu Nama</div>
                        <div className="text-xs text-gray-700 ml-2">9 x 5.5</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-600">
                          100 x Rp 1.000
                        </div>
                        <div className="text-xs font-medium">
                          Rp 100.000
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {/* Payment Summary */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Subtotal:</span>
                      <span>Rp 500.000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Down Payment:</span>
                      <span>Rp 500.000</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-green-600">
                      <span>Sisa:</span>
                      <span>Rp 0 (LUNAS)</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  {/* Additional Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Payment:</span>
                      <span>Cash</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Cashier:</span>
                      <span>Admin</span>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  {settings.footer.enabled && (
                    <div className="mt-4 text-center">
                      <div 
                        className="text-gray-600"
                        style={{
                          fontSize: `${settings.footer.fontSize}px`,
                          fontWeight: settings.footer.fontWeight as any
                        }}
                      >
                        {settings.footer.text.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Stempel Lunas Overlay */}
                  {settings.stamp.enabled && settings.stamp.lunasImageUrl && (
                    <PaymentStamp 
                      isLunas={true}
                      settings={settings.stamp}
                    />
                  )}
                  
                  {/* No Stamp Message */}
                  {settings.stamp.enabled && !settings.stamp.lunasImageUrl && (
                    <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs text-yellow-800">
                      📤 Upload gambar stempel untuk melihat preview
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-xs text-blue-800">
                      <div className="font-medium mb-1">Keterangan Preview:</div>
                      <ul className="space-y-1">
                        <li>• Stempel hanya muncul saat status "LUNAS" (sisa pembayaran ≤ 0)</li>
                        <li>• Preview menampilkan kombinasi logo perusahaan + stempel lunas</li>
                        <li>• Contoh nota dengan status LUNAS (sisa Rp 0)</li>
                        <li>• Upload gambar stempel untuk melihat hasil akhir</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Lihat preview nota sesuai pengaturan yang telah dikonfigurasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="previewEnabled"
              checked={settings.preview.enabled}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                preview: { ...settings.preview, enabled: checked }
              })}
            />
            <Label htmlFor="previewEnabled">Aktifkan Preview</Label>
          </div>

          <Button
            onClick={handlePreview}
            variant="outline"
            className="w-full"
            disabled={isPreviewing || !settings.preview.enabled}
          >
            {isPreviewing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {isPreviewing ? 'Membuat Preview...' : 'Preview Nota'}
          </Button>

          {/* Preview Data */}
          {previewData && (
            <div className="mt-4">
              <Label className="text-sm font-medium mb-2 block">Preview Nota:</Label>
              <div 
                className="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewData }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Default
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </div>
    </div>
  );
};
