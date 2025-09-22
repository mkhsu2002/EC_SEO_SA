# 更新日誌

所有此專案的重要變更都會記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
且此專案遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

## [1.8.0] - 2024-12-19

### 新增
- 🎨 Gamma API 整合，提供專業設計平台的前導頁生成
- 🔧 雙重生成模式：每個內容主題支援 Gemini AI 和 Gamma API 兩種生成方式
- 📱 增強的檢視體驗：新增預覽、HTML、CSS 三種檢視模式
- 🌐 Gamma 平台一鍵開啟功能，可直接在 Gamma 平台檢視和編輯
- 💾 完整程式碼支援：支援 HTML 和 CSS 程式碼的獨立複製
- 📊 Gamma 頁面資訊顯示：包含頁面 ID 和專屬網址

### 改進
- 🔧 完整的 TypeScript 型別定義，提升開發體驗
- 🛡️ 獨立的錯誤處理機制，更好的錯誤追蹤
- 📈 增強的狀態管理，支援雙重生成模式
- ⚙️ 環境變數配置優化，支援 Gamma API 金鑰

### 技術變更
- 新增 `services/gammaService.ts` 服務層
- 新增 `GammaWebpageContent` 型別定義
- 更新 `WebpageContentDisplay` 組件支援多種檢視模式
- 更新 `ContentTopicCard` 組件支援雙重生成按鈕
- 更新主應用程式狀態管理

## [1.5.0] - 2024-12-18

### 新增
- 🚀 初始版本發布
- 📊 深度市場分析功能
- 📝 內容策略生成
- 🎯 SEO 優化建議
- 📄 前導頁生成功能
- 💾 報告下載功能

### 技術架構
- React + TypeScript 前端架構
- Tailwind CSS 樣式系統
- Google Gemini API 整合
- Vite 建置工具
- 響應式設計

