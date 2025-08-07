# VS Code CSS 警告修復指南

本專案使用 Tailwind CSS v4，VS Code 內建的 CSS 語言功能可能會顯示「Unknown at rule」警告。以下是三種解決方案：

## 方法 1：全域 VS Code 設定 (推薦)

1. 在 VS Code 中按 `Cmd+Shift+P` (Mac) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 搜尋並選擇「Preferences: Open User Settings (JSON)」
3. 在設定檔案中添加以下內容：

```json
{
  "css.lint.unknownAtRules": "ignore",
  "css.validate": false,
  "tailwindCSS.experimental.configFile": "tailwind.config.js"
}
```

## 方法 2：工作區設定 (已自動配置)

本專案已在 `.vscode/settings.json` 中配置了相同設定，僅對此專案生效。

## 方法 3：安裝 Tailwind CSS 擴展

1. 在 VS Code 擴展市場搜尋「Tailwind CSS IntelliSense」
2. 安裝由 Tailwind Labs 開發的官方擴展
3. 重新載入 VS Code

## 重要說明

- 這些警告**不影響應用程式運行**
- Tailwind CSS 功能完全正常
- 構建和部署過程不受影響
- 建議使用方法 1 以獲得最佳開發體驗

## 驗證修復

修復後，`index.css` 中的以下 at-rules 應該不再顯示警告：
- `@tailwind`
- `@theme`
- `@apply`
- `@custom-variant`