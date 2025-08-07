# 設計系統使用指南

## 🎨 色彩系統

### 主要色彩
- **Primary (黃色系)**: `bg-primary-500`, `text-primary-600`
- **Secondary (灰色系)**: `bg-secondary-500`, `text-secondary-600`
- **Accent (強調色)**: `bg-accent-yellow`, `text-accent-yellow`

### 使用範例
```jsx
// 主要按鈕
<Button variant="primary">主要操作</Button>

// 次要按鈕
<Button variant="secondary">次要操作</Button>

// 強調色文字
<Text color="accent">重要訊息</Text>
```

## 📝 字體系統

### 字體家族
- **Sans**: 預設無襯線字體 `font-sans`
- **Rounded**: 圓潤字體 `font-rounded`
- **Display**: 標題字體 `font-display`

### 字體大小
- **標題**: `text-4xl`, `text-3xl`, `text-2xl`
- **內文**: `text-base`, `text-lg`
- **小字**: `text-sm`, `text-xs`

## 🔘 按鈕系統

### 變體
```jsx
<Button variant="primary">主要按鈕</Button>
<Button variant="secondary">次要按鈕</Button>
<Button variant="accent">強調按鈕</Button>
<Button variant="outline">外框按鈕</Button>
<Button variant="ghost">幽靈按鈕</Button>
```

### 尺寸
```jsx
<Button size="sm">小按鈕</Button>
<Button size="md">中按鈕</Button>
<Button size="lg">大按鈕</Button>
<Button size="xl">超大按鈕</Button>
```

## 📝 輸入框系統

```jsx
// 基本輸入框
<Input placeholder="請輸入內容" />

// 大尺寸輸入框
<Input size="lg" placeholder="大輸入框" />

// 錯誤狀態
<Input error={true} placeholder="錯誤狀態" />
```

## 🃏 卡片系統

```jsx
// 基本卡片
<Card>
  <div className="p-6">
    <Text variant="h3">卡片標題</Text>
    <Text>卡片內容</Text>
  </div>
</Card>

// 浮動效果卡片
<Card variant="floating">
  內容
</Card>

// 發光效果卡片
<Card variant="glow">
  特殊內容
</Card>
```

## 📐 間距系統

### Tailwind 間距類別
- **小間距**: `p-2`, `m-2`, `space-y-2`
- **中間距**: `p-4`, `m-4`, `space-y-4`
- **大間距**: `p-8`, `m-8`, `space-y-8`
- **自定義**: `p-18`, `m-88`, `space-y-12`

### 間距組件
```jsx
// 垂直間距
<Spacer size="md" />

// 水平間距
<Spacer size="lg" direction="horizontal" />
```

## 🎭 動畫系統

### 預設動畫
```jsx
// 淡入效果
<div className="animate-fadeIn">
  內容
</div>

// 滑入效果
<div className="animate-slideUp">
  內容
</div>

// 脈衝效果
<div className="animate-pulse">
  載入中...
</div>
```

## 📱 響應式設計

### 斷點使用
```jsx
// 響應式文字大小
<Text className="text-base md:text-lg lg:text-xl">
  響應式文字
</Text>

// 響應式間距
<div className="p-4 md:p-6 lg:p-8">
  響應式容器
</div>

// 響應式顯示/隱藏
<div className="hidden md:block">
  桌面版才顯示
</div>
```

## 🎯 最佳實踐

### 1. 組件優先
```jsx
// ✅ 推薦：使用設計系統組件
<Button variant="primary" size="lg">
  註冊
</Button>

// ❌ 避免：直接使用 Tailwind 類別
<button className="bg-yellow-500 px-8 py-4 text-xl">
  註冊
</button>
```

### 2. 一致性
```jsx
// ✅ 推薦：使用統一的色彩系統
<Text color="primary">重要文字</Text>

// ❌ 避免：使用任意顏色
<p style={{color: '#999700'}}>重要文字</p>
```

### 3. 語義化
```jsx
// ✅ 推薦：語義化的變體名稱
<Button variant="primary">主要操作</Button>
<Button variant="secondary">次要操作</Button>

// ❌ 避免：基於外觀的命名
<Button variant="yellow">操作</Button>
<Button variant="gray">操作</Button>
```

## 🔧 自定義擴展

如需添加新的設計標準，請在 `tailwind.config.js` 中擴展：

```javascript
// 添加新顏色
colors: {
  brand: {
    purple: '#6366f1',
    pink: '#ec4899',
  }
}

// 添加新間距
spacing: {
  '72': '18rem',
  '84': '21rem',
}
```