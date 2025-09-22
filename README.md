# FlyPig AI 市場分析 PRO v1.8

![App Screenshot](https://i.imgur.com/your-screenshot.png) <!-- 建議您截一張 APP 的圖片並替換此連結 -->

**FlyPig AI 市場分析 PRO** 是一個由 AI 驅動的專家級應用程式，旨在為電商產品提供深入的市場分析、SEO 優化建議、內容策略規劃，並能一鍵生成高品質的前導頁 (Landing Page)。它將專業的市場分析師、SEO 專家與文案寫手的工作流程自動化，幫助使用者快速掌握市場動態，制定致勝策略。

## 🆕 v1.8 版本更新

### **重大功能更新**
- **🎨 Gamma API 整合**：新增 Gamma 專業設計平台整合，提供雙重前導頁生成選項
- **🔧 雙重生成模式**：每個內容主題現在支援 Gemini AI 和 Gamma API 兩種生成方式
- **📱 增強的檢視體驗**：新增預覽、HTML、CSS 三種檢視模式
- **🌐 Gamma 平台整合**：一鍵開啟 Gamma 平台進行專業編輯
- **💾 完整程式碼支援**：支援 HTML 和 CSS 程式碼的獨立複製

### **技術改進**
- 完整的 TypeScript 型別定義
- 獨立的錯誤處理機制
- 增強的狀態管理
- 環境變數配置優化

---

## ✨ 核心功能

本應用程式採用三階段的漸進式工作流程，引導使用者從宏觀市場分析到具體的內容產出。

### **第一階段：深度市場分析 (Market Analysis)**

只需輸入產品名稱、描述、目標市場，並可選上傳一張圖片，AI 將會生成一份全面的市場分析報告，內容包含：

*   **產品核心價值 (Product Core Value):** 提煉產品的主要特色、核心優勢，以及解決了使用者哪些關鍵痛點。
*   **目標市場定位 (Market Positioning):** 深入分析目標市場的文化洞察、消費習慣、語言特性及網路搜尋趨勢。
*   **競爭對手分析 (Competitor Analysis):** 自動識別 3 個主要競爭對手，並分析其行銷策略、優勢與劣勢。
*   **潛在客戶描繪 (Buyer Personas):** 創建 3 個詳細的潛在客戶畫像，包含其基本資料、興趣、痛點，以及他們可能會使用的搜尋關鍵字。

### **第二階段：內容與互動策略 (Content & SEO Strategy)**

基於第一階段的分析報告，AI 將自動生成一份專業的內容與 SEO 策略，包含：

*   **三大內容主題 (Content Topics):** 建議 3 個能吸引目標客群的非銷售性質內容主題。
*   **專業 SEO 指導 (SEO Guidance):** 針對每個主題，提供精準的 SEO 建議，包括：
    *   **關鍵字密度 (Keyword Density):** 建議主要關鍵字的最適密度。
    *   **語意關鍵字 (Semantic Keywords):** 提供 LSI (Latent Semantic Indexing) 關鍵字，以建立主題權威性。
    *   **連結策略 (Linking Strategy):** 規劃有效的內部與外部連結策略。
*   **互動元素建議 (Interactive Elements):** 提出可增加使用者參與度的互動元素點子，如小測驗、計算機等。
*   **行動呼籲文案 (CTA Suggestions):** 提供多個自然且具說服力的 CTA (Call-to-Action) 文案範例。

### **第三階段：一鍵生成前導頁 (Landing Page Generation)**

使用者可以從第二階段建議的三個主題中，選擇任一主題，並選擇使用 **Gemini AI** 或 **Gamma API** 來生成前導頁：

#### **Gemini AI 生成方式:**
*   **高品質 HTML 內容:** 生成結構完整、採用 Tailwind CSS 美化的 HTML 程式碼。
*   **SEO 完全優化:** 頁面標題、Meta 描述、URL 結構、圖片 `alt` 文字等皆已根據 SEO 最佳實踐進行優化。
*   **響應式設計:** 確保在桌面和行動裝置上都有良好的瀏覽體驗。
*   **即時預覽與程式碼複製:** 可直接在應用程式內預覽生成的頁面，並一鍵複製所有 HTML 程式碼，方便快速部署。
*   **SEO 自我分析:** AI 會提供一份詳細的清單，說明在生成頁面時採取了哪些 SEO 優化措施。

#### **Gamma API 生成方式 (新增功能):**
*   **專業設計平台整合:** 透過 Gamma 的專業設計平台生成高品質前導頁。
*   **Gamma 平台託管:** 生成的頁面會自動在 Gamma 平台上建立，並提供專屬網址。
*   **完整 CSS 樣式:** 除了 HTML 內容外，還提供完整的 CSS 樣式檔案。
*   **多種檢視模式:** 支援預覽、HTML 程式碼、CSS 樣式三種檢視模式。
*   **一鍵開啟 Gamma:** 可直接在 Gamma 平台上檢視和編輯生成的頁面。
*   **專業級設計:** 利用 Gamma 的設計系統，確保頁面具有專業級的外觀和體驗。

### **其他功能**

*   **下載報告:** 所有市場分析報告和內容策略皆可一鍵下載為 Markdown (`.md`) 檔案，方便歸檔與分享。
*   **多主題生成:** 使用者可以為所有建議的內容主題生成前導頁，並在不同頁面之間輕鬆切換預覽，無需重新分析。

---

## 🚀 如何使用 (How to Use)

1.  **輸入產品資訊:** 在首頁表單中，填寫您的產品名稱、詳細描述和目標市場。為了讓 AI 有更豐富的分析素材，建議上傳一張清晰的產品圖片。
2.  **生成市場分析:** 點擊「生成市場分析報告」按鈕。AI 會在約 30-60 秒內完成分析並呈現結果。您可以點擊「下載報告」保存這份分析。
3.  **生成內容策略:** 在分析報告下方，點擊「第二步：生成內容策略」按鈕。AI 會基於先前的分析結果，規劃出詳細的內容與 SEO 策略。同樣地，此策略也可下載保存。
4.  **生成前導頁:**
    *   在內容策略區塊，首先填寫您的「產品商店網址」，此網址將被用於頁面中的所有 CTA 按鈕。
    *   從三個建議的內容主題卡片中，選擇一個您喜歡的，然後選擇生成方式：
        *   **Gemini 生成前導頁:** 使用 Gemini AI 生成 HTML 程式碼
        *   **Gamma 生成前導頁:** 使用 Gamma API 生成專業設計頁面
    *   AI 將開始生成頁面，完成後會自動顯示預覽及 SEO 分析結果。
    *   **Gemini 生成:** 您可以點擊「複製 HTML」按鈕，將程式碼貼到您的網站專案中使用。
    *   **Gamma 生成:** 您可以點擊「在 Gamma 中檢視」按鈕，直接在 Gamma 平台上檢視和編輯頁面，或複製 HTML/CSS 程式碼。
    *   您可以返回並為其他主題生成頁面，並透過「檢視頁面」按鈕切換查看。
5.  **重新開始:** 完成所有流程後，可以點擊底部的「開始新分析」按鈕，為下一個產品進行規劃。

---

## 🛠️ 技術棧 (Tech Stack)

*   **前端框架:** [React](https://react.dev/)
*   **CSS 框架:** [Tailwind CSS](https://tailwindcss.com/)
*   **AI 模型:** [Google Gemini API](https://ai.google.dev/)
*   **設計平台:** [Gamma API](https://gamma.app/zh-cn/products/api)
*   **語言:** TypeScript
*   **建置工具:** [Vite](https://vitejs.dev/)

---

## ⚙️ 本地運行 (Local Setup)

若要在您自己的電腦上運行此專案，請遵循以下步驟：

1.  **複製專案:**
    ```bash
    git clone https://github.com/your-username/flypig-ai-pro.git
    cd flypig-ai-pro
    ```
2.  **安裝依賴:**
    由於此專案使用 CDN 引入 React，因此無需 `npm install`。所有依賴項已在 `index.html` 中配置。

3.  **設定 API 金鑰:**
    此專案需要兩個 API 金鑰才能完整運作：
    
    *   **Google Gemini API 金鑰:** 用於市場分析和內容策略生成
        - 從 [Google AI Studio](https://ai.google.dev/) 獲取
        - 設定為環境變數 `GEMINI_API_KEY`
    
    *   **Gamma API 金鑰:** 用於生成專業的前導頁
        - 從 [Gamma API](https://gamma.app/zh-cn/products/api) 獲取
        - 設定為環境變數 `GAMMA_API_KEY`

    *   **重要提示:** 前端程式碼中的 `process.env.API_KEY` 和 `process.env.GAMMA_API_KEY` 是佔位符。在實際部署或本地開發時，您需要透過伺服器或構建工具（如 Vite, Webpack）的環境變數功能來注入此金鑰，以避免將其直接暴露在客戶端程式碼中。
    
    *   **環境變數設定範例:**
        ```bash
        # 在專案根目錄建立 .env 檔案
        GEMINI_API_KEY=your_gemini_api_key_here
        GAMMA_API_KEY=your_gamma_api_key_here
        ```

4.  **啟動開發伺服器:**
    您可以使用任何支援靜態檔案的伺服器來運行此專案。一個簡單的方式是使用 VS Code 的 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 擴充功能。

    *   在 VS Code 中打開專案資料夾。
    *   右鍵點擊 `index.html` 檔案，選擇 `Open with Live Server`。

應用程式將在您的瀏覽器中打開，您現在可以開始使用了。

---

## 📝 版本歷史

### v1.8.0 (2024-12-19)
- 🎨 新增 Gamma API 整合
- 🔧 雙重前導頁生成模式
- 📱 增強的檢視體驗（預覽/HTML/CSS）
- 🌐 Gamma 平台一鍵開啟功能
- 💾 完整程式碼複製支援
- 🔧 技術架構優化

### v1.5.0 (2024-12-18)
- 🚀 初始版本發布
- 📊 市場分析功能
- 📝 內容策略生成
- 🎯 SEO 優化建議
- 📄 前導頁生成功能

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來幫助改進這個專案！

## 📄 授權

此專案採用 MIT 授權條款。

---

## 🔗 相關連結

- [Google Gemini API](https://ai.google.dev/)
- [Gamma API](https://gamma.app/zh-cn/products/api)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
