import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Eye, EyeOff } from 'lucide-react';
import { NotaSettingsData, saveNotaSettings } from '@/utils/notaSettings';

const defaultSettings: NotaSettingsData = {
  header: {
    enabled: true,
    text: 'STUDIO POS',
    fontSize: 16,
    fontWeight: 'bold'
  },
  logo: {
    enabled: true,
    url: '',
    width: 80,
    height: 80,
    altText: 'Studio POS Logo'
  },
  footer: {
    enabled: true,
    text: 'Thank you for your order!',
    fontSize: 11,
    fontWeight: 'normal'
  },
  businessInfo: {
    name: 'STUDIO POS',
    address: 'Banda Aceh',
    phone: '085223202023',
    website: 'www.studiopos.com'
  }
};

export const NotaSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotaSettingsData>(defaultSettings);
  const [previewMode, setPreviewMode] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('notaSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading nota settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      saveNotaSettings(settings);
      alert('Nota settings saved successfully!');
    } catch (error) {
      console.error('Error saving nota settings:', error);
      alert('Error saving settings');
    }
  };

  // Handle file upload for logo
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({
          ...prev,
          logo: {
            ...prev.logo,
            url: result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update settings
  const updateSettings = (section: keyof NotaSettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Update business info
  const updateBusinessInfo = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Header Settings
          </CardTitle>
          <CardDescription>
            Customize the header text and appearance for Nota prints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="header-enabled"
              checked={settings.header.enabled}
              onCheckedChange={(checked) => updateSettings('header', 'enabled', checked)}
            />
            <Label htmlFor="header-enabled">Enable Header</Label>
          </div>
          
          {settings.header.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="header-text">Header Text</Label>
                <Input
                  id="header-text"
                  value={settings.header.text}
                  onChange={(e) => updateSettings('header', 'text', e.target.value)}
                  placeholder="Enter header text"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="header-font-size">Font Size (px)</Label>
                  <Input
                    id="header-font-size"
                    type="number"
                    value={settings.header.fontSize}
                    onChange={(e) => updateSettings('header', 'fontSize', parseInt(e.target.value))}
                    min="8"
                    max="32"
                  />
                </div>
                <div>
                  <Label htmlFor="header-font-weight">Font Weight</Label>
                  <select
                    id="header-font-weight"
                    value={settings.header.fontWeight}
                    onChange={(e) => updateSettings('header', 'fontWeight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="bolder">Bolder</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Logo Settings
          </CardTitle>
          <CardDescription>
            Upload and configure the logo for Nota prints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="logo-enabled"
              checked={settings.logo.enabled}
              onCheckedChange={(checked) => updateSettings('logo', 'enabled', checked)}
            />
            <Label htmlFor="logo-enabled">Enable Logo</Label>
          </div>
          
          {settings.logo.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-upload">Upload Logo</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
              </div>
              
              {settings.logo.url && (
                <div className="flex items-center space-x-4">
                  <img
                    src={settings.logo.url}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain border border-gray-300 rounded"
                  />
                  <div className="text-sm text-gray-600">
                    Logo uploaded successfully
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo-width">Width (px)</Label>
                  <Input
                    id="logo-width"
                    type="number"
                    value={settings.logo.width}
                    onChange={(e) => updateSettings('logo', 'width', parseInt(e.target.value))}
                    min="20"
                    max="200"
                  />
                </div>
                <div>
                  <Label htmlFor="logo-height">Height (px)</Label>
                  <Input
                    id="logo-height"
                    type="number"
                    value={settings.logo.height}
                    onChange={(e) => updateSettings('logo', 'height', parseInt(e.target.value))}
                    min="20"
                    max="200"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="logo-alt-text">Alt Text</Label>
                <Input
                  id="logo-alt-text"
                  value={settings.logo.altText}
                  onChange={(e) => updateSettings('logo', 'altText', e.target.value)}
                  placeholder="Logo description"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Configure your business details for Nota prints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              value={settings.businessInfo.name}
              onChange={(e) => updateBusinessInfo('name', e.target.value)}
              placeholder="Enter business name"
            />
          </div>
          
          <div>
            <Label htmlFor="business-address">Address</Label>
            <Textarea
              id="business-address"
              value={settings.businessInfo.address}
              onChange={(e) => updateBusinessInfo('address', e.target.value)}
              placeholder="Enter business address"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business-phone">Phone</Label>
              <Input
                id="business-phone"
                value={settings.businessInfo.phone}
                onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="business-website">Website</Label>
              <Input
                id="business-website"
                value={settings.businessInfo.website}
                onChange={(e) => updateBusinessInfo('website', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Footer Settings
          </CardTitle>
          <CardDescription>
            Customize the footer text and appearance for Nota prints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="footer-enabled"
              checked={settings.footer.enabled}
              onCheckedChange={(checked) => updateSettings('footer', 'enabled', checked)}
            />
            <Label htmlFor="footer-enabled">Enable Footer</Label>
          </div>
          
          {settings.footer.enabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="footer-text">Footer Text</Label>
                <Textarea
                  id="footer-text"
                  value={settings.footer.text}
                  onChange={(e) => updateSettings('footer', 'text', e.target.value)}
                  placeholder="Enter footer text"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="footer-font-size">Font Size (px)</Label>
                  <Input
                    id="footer-font-size"
                    type="number"
                    value={settings.footer.fontSize}
                    onChange={(e) => updateSettings('footer', 'fontSize', parseInt(e.target.value))}
                    min="8"
                    max="16"
                  />
                </div>
                <div>
                  <Label htmlFor="footer-font-weight">Font Weight</Label>
                  <select
                    id="footer-font-weight"
                    value={settings.footer.fontWeight}
                    onChange={(e) => updateSettings('footer', 'fontWeight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="bolder">Bolder</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Preview how your Nota will look with current settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="text-center space-y-2">
              {/* Header */}
              {settings.header.enabled && (
                <div 
                  style={{
                    fontSize: `${settings.header.fontSize}px`,
                    fontWeight: settings.header.fontWeight as any
                  }}
                  className="text-gray-900"
                >
                  {settings.header.text}
                </div>
              )}
              
              {/* Logo */}
              {settings.logo.enabled && settings.logo.url && (
                <div className="flex justify-center">
                  <img
                    src={settings.logo.url}
                    alt={settings.logo.altText}
                    style={{
                      width: `${settings.logo.width}px`,
                      height: `${settings.logo.height}px`
                    }}
                    className="object-contain"
                  />
                </div>
              )}
              
              {/* Business Info */}
              <div className="text-sm text-gray-600 space-y-1">
                <div>{settings.businessInfo.name}</div>
                <div>{settings.businessInfo.address}</div>
                <div>{settings.businessInfo.phone}</div>
                <div>{settings.businessInfo.website}</div>
              </div>
              
              <Separator />
              
              {/* Sample Nota Content */}
              <div className="text-left space-y-2 px-80">
                <div className="font-bold">DETAIL ORDER:</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>Sample Customer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Number:</span>
                    <span>NOTA-2024-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>8/8/2025</span>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              {settings.footer.enabled && (
                <div 
                  style={{
                    fontSize: `${settings.footer.fontSize}px`,
                    fontWeight: settings.footer.fontWeight as any
                  }}
                  className="text-center text-gray-600 mt-4"
                >
                  {settings.footer.text}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};
