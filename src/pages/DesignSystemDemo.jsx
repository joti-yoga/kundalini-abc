import React, { useState } from 'react';
import { Button, Input, Card, Text, Container, Spacer, Loading, Badge } from '../components/ui/DesignSystem';

const DesignSystemDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [hasError, setHasError] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-light py-8">
      <Container size="lg">
        <Text variant="h1" className="text-center mb-12">
          設計系統展示
        </Text>

        {/* 色彩系統展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">色彩系統</Text>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-2"></div>
                <Text variant="small">Primary 500</Text>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-500 rounded-lg mx-auto mb-2"></div>
                <Text variant="small">Secondary 500</Text>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-yellow rounded-lg mx-auto mb-2"></div>
                <Text variant="small">Accent Yellow</Text>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-gold rounded-lg mx-auto mb-2"></div>
                <Text variant="small">Accent Gold</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 按鈕系統展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">按鈕系統</Text>
            
            <div className="space-y-4">
              <div>
                <Text variant="h4" className="mb-3">按鈕變體</Text>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              
              <div>
                <Text variant="h4" className="mb-3">按鈕尺寸</Text>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 輸入框系統展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">輸入框系統</Text>
            
            <div className="space-y-4 max-w-md">
              <div>
                <Text variant="h5" className="mb-2">基本輸入框</Text>
                <Input 
                  placeholder="請輸入內容" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              
              <div>
                <Text variant="h5" className="mb-2">大尺寸輸入框</Text>
                <Input size="lg" placeholder="大輸入框" />
              </div>
              
              <div>
                <Text variant="h5" className="mb-2">錯誤狀態</Text>
                <Input 
                  error={true} 
                  placeholder="錯誤狀態輸入框" 
                  value={hasError ? '錯誤內容' : ''}
                  readOnly
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => setHasError(!hasError)}
                >
                  切換錯誤狀態
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 卡片系統展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">卡片系統</Text>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="default">
                <div className="p-4">
                  <Text variant="h5" className="mb-2">Default Card</Text>
                  <Text variant="small" color="muted">基本卡片樣式</Text>
                </div>
              </Card>
              
              <Card variant="elevated">
                <div className="p-4">
                  <Text variant="h5" className="mb-2">Elevated Card</Text>
                  <Text variant="small" color="muted">提升陰影效果</Text>
                </div>
              </Card>
              
              <Card variant="floating">
                <div className="p-4">
                  <Text variant="h5" className="mb-2">Floating Card</Text>
                  <Text variant="small" color="muted">浮動效果</Text>
                </div>
              </Card>
              
              <Card variant="glow">
                <div className="p-4">
                  <Text variant="h5" className="mb-2">Glow Card</Text>
                  <Text variant="small" color="muted">發光效果</Text>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* 文字系統展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">文字系統</Text>
            
            <div className="space-y-3">
              <Text variant="h1">標題 H1 - 最大標題</Text>
              <Text variant="h2">標題 H2 - 次級標題</Text>
              <Text variant="h3">標題 H3 - 三級標題</Text>
              <Text variant="h4">標題 H4 - 四級標題</Text>
              <Text variant="h5">標題 H5 - 五級標題</Text>
              <Text variant="h6">標題 H6 - 六級標題</Text>
              <Text variant="body">內文 - 這是正常的內文文字</Text>
              <Text variant="small" color="muted">小字 - 這是較小的文字</Text>
              <Text variant="caption" color="light">說明文字 - 這是最小的說明文字</Text>
            </div>
            
            <Spacer size="md" />
            
            <div className="space-y-2">
              <Text color="primary">主要色彩文字</Text>
              <Text color="accent">強調色彩文字</Text>
              <Text color="muted">靜音色彩文字</Text>
            </div>
          </div>
        </Card>

        {/* 徽章和載入動畫展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">徽章和載入動畫</Text>
            
            <div className="space-y-4">
              <div>
                <Text variant="h5" className="mb-3">徽章系統</Text>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                </div>
              </div>
              
              <div>
                <Text variant="h5" className="mb-3">載入動畫</Text>
                <div className="flex items-center gap-4">
                  <Loading size="sm" />
                  <Loading size="md" />
                  <Loading size="lg" />
                  <Loading size="md" color="secondary" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 動畫效果展示 */}
        <Card className="mb-8">
          <div className="p-6">
            <Text variant="h2" className="mb-6">動畫效果</Text>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="animate-fadeIn bg-primary-100 p-4 rounded-lg text-center">
                <Text variant="h5">淡入動畫</Text>
                <Text variant="small" color="muted">fadeIn</Text>
              </div>
              
              <div className="animate-slideUp bg-secondary-100 p-4 rounded-lg text-center">
                <Text variant="h5">滑入動畫</Text>
                <Text variant="small" color="muted">slideUp</Text>
              </div>
              
              <div className="animate-pulse bg-accent-yellow bg-opacity-20 p-4 rounded-lg text-center">
                <Text variant="h5">脈衝動畫</Text>
                <Text variant="small" color="muted">pulse</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* 響應式展示 */}
        <Card>
          <div className="p-6">
            <Text variant="h2" className="mb-6">響應式設計</Text>
            
            <div className="bg-gradient-to-r from-primary-100 to-secondary-100 p-4 rounded-lg">
              <Text className="text-sm md:text-base lg:text-lg xl:text-xl">
                這段文字會根據螢幕大小調整：
                <br />
                手機 (text-sm) → 平板 (text-base) → 桌面 (text-lg) → 大螢幕 (text-xl)
              </Text>
            </div>
            
            <Spacer size="md" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-primary-200 p-4 rounded-lg text-center">
                <Text variant="h6">手機：1列</Text>
              </div>
              <div className="bg-secondary-200 p-4 rounded-lg text-center">
                <Text variant="h6">平板：2列</Text>
              </div>
              <div className="bg-accent-yellow bg-opacity-30 p-4 rounded-lg text-center">
                <Text variant="h6">桌面：3列</Text>
              </div>
            </div>
          </div>
        </Card>

        <Spacer size="xl" />
        
        <div className="text-center">
          <Text variant="h3" color="primary" className="mb-4">
            🎉 設計系統配置完成！
          </Text>
          <Text color="muted">
            現在你可以使用這些組件來快速建構一致且美觀的使用者介面
          </Text>
        </div>
      </Container>
    </div>
  );
};

export default DesignSystemDemo;