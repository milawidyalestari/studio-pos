import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useTransparentWindow } from '../hooks/useTransparentWindow';
import { Monitor, Eye, EyeOff, Square, Maximize2, Minimize2 } from 'lucide-react';

interface TransparentWindowControlsProps {
  className?: string;
}

export const TransparentWindowControls: React.FC<TransparentWindowControlsProps> = ({ className }) => {
  const {
    windowInfo,
    isTransparent,
    isFrameless,
    setTransparent,
    setFrameless,
    setTitleBarStyle,
    setVibrancy,
    refreshWindowInfo,
    loading,
    error,
  } = useTransparentWindow();

  const handleTransparentToggle = async (checked: boolean) => {
    await setTransparent(checked);
  };

  const handleFramelessToggle = async (checked: boolean) => {
    await setFrameless(checked);
  };

  const handleTitleBarStyleChange = async (value: string) => {
    await setTitleBarStyle(value as any);
  };

  const handleVibrancyChange = async (value: string) => {
    await setVibrancy(value);
  };

  const vibrancyOptions = [
    { value: 'under-window', label: 'Under Window' },
    { value: 'under-page', label: 'Under Page' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'header', label: 'Header' },
    { value: 'selection', label: 'Selection' },
    { value: 'menu', label: 'Menu' },
    { value: 'popover', label: 'Popover' },
    { value: 'fullscreen-ui', label: 'Fullscreen UI' },
    { value: 'hud-window', label: 'HUD Window' },
    { value: 'titlebar', label: 'Title Bar' },
    { value: 'tooltip', label: 'Tooltip' },
    { value: 'content', label: 'Content' },
    { value: 'window', label: 'Window' },
    { value: 'disabled', label: 'Disabled' },
  ];

  const titleBarStyles = [
    { value: 'default', label: 'Default' },
    { value: 'hidden', label: 'Hidden' },
    { value: 'hiddenInset', label: 'Hidden Inset' },
    { value: 'customButtonsOnHover', label: 'Custom Buttons on Hover' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Window Controls
          {windowInfo?.platform === 'darwin' && (
            <Badge variant="secondary" className="ml-2">macOS</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Window Info */}
        {windowInfo && (
          <div className="p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm mb-2">Window Information</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Size: {windowInfo.width} × {windowInfo.height}</div>
              <div>Position: {windowInfo.x}, {windowInfo.y}</div>
              <div>Maximized: {windowInfo.isMaximized ? 'Yes' : 'No'}</div>
              <div>Minimized: {windowInfo.isMinimized ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* Transparent Window */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="transparent" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Transparent Window
            </Label>
            <p className="text-xs text-gray-500">
              Make the window background transparent
            </p>
          </div>
          <Switch
            id="transparent"
            checked={isTransparent}
            onCheckedChange={handleTransparentToggle}
            disabled={loading}
          />
        </div>

        {/* Frameless Window */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="frameless" className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              Frameless Window
            </Label>
            <p className="text-xs text-gray-500">
              Remove window frame and borders
            </p>
          </div>
          <Switch
            id="frameless"
            checked={isFrameless}
            onCheckedChange={handleFramelessToggle}
            disabled={loading}
          />
        </div>

        {/* Title Bar Style */}
        <div className="space-y-2">
          <Label htmlFor="titleBarStyle">Title Bar Style</Label>
          <Select
            value={windowInfo?.platform === 'darwin' ? 'hidden' : 'default'}
            onValueChange={handleTitleBarStyleChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select title bar style" />
            </SelectTrigger>
            <SelectContent>
              {titleBarStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vibrancy (macOS only) */}
        {windowInfo?.platform === 'darwin' && (
          <div className="space-y-2">
            <Label htmlFor="vibrancy">Vibrancy Effect (macOS)</Label>
            <Select
              value="under-window"
              onValueChange={handleVibrancyChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vibrancy effect" />
              </SelectTrigger>
              <SelectContent>
                {vibrancyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={refreshWindowInfo}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Loading...' : 'Refresh Window Info'}
        </Button>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label>Quick Actions</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransparent(true)}
              disabled={loading}
            >
              <Eye className="w-4 h-4 mr-1" />
              Enable Transparency
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTransparent(false)}
              disabled={loading}
            >
              <EyeOff className="w-4 h-4 mr-1" />
              Disable Transparency
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

