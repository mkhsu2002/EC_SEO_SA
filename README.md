# FlyPig AI 電商增長神器 v1.9

![App Screenshot](https://i.imgur.com/your-screenshot.png) <!-- 建議您截一張 APP 的圖片並替換此連結 -->

**FlyPig AI 電商增長神器** 是一個由 AI 驅動的專家級應用程式，旨在為電商產品提供深入的市場分析、內容策略規劃，並能一鍵生成適用於各種 AI 工具的專業提示詞 (Prompt)，以快速產出高品質的前導頁。它將專業的市場分析師、SEO 專家與內容策略師的工作流程自動化，幫助使用者快速掌握市場動態，制定致勝策略。

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
*   **專業 SEO 指導 (SEO Guidance):** 針對每個主題，提供精準的 SEO 建議，包括關鍵字密度、語意關鍵字與連結策略。
*   **互動元素建議 (Interactive Elements):** 提出可增加使用者參與度的互動元素點子，如小測驗、計算機等。
*   **行動呼籲文案 (CTA Suggestions):** 提供多個自然且具說服力的 CTA (Call-to-Action) 文案範例。

### **第三階段：生成專業前導頁與提示詞 (Landing Page Generation & Prompts)**

使用者可以從第二階段建議的三個主題中，選擇任一主題，應用程式將提供以下選項：

*   **生成 AI Studio 提示詞 (Generate AI Studio Prompt):** **[新功能]** 一鍵生成為 Google AI Studio 或其他 AI 程式碼助理量身打造的詳細提示詞。開發者可以直接使用此提示詞，快速生成一個包含 React 和 Tailwind CSS 的完整 landing page 程式碼。
*   **生成 Gamma 提示詞 (Generate Gamma Prompt):** 生成適用於 Gamma 平台的提示詞，方便使用者手動在 Gamma 中創建專業簡報或文件。
*   **呼叫 Gamma API (即將推出):** 此功能將允許使用者直接呼叫 Gamma API，自動生成一個結構完整、內容豐富的專業文件，適合作為網頁前導頁的內容基礎。

### **其他功能**

*   **下載報告:** 所有市場分析報告和內容策略皆可一鍵下載為 Markdown (`.md`) 檔案，方便歸檔與分享。
*   **多主題生成:** 使用者可以為所有建議的內容主題生成提示詞。

---

## 🔖 版本紀錄 (Changelog)

### **v1.9**
*   **品牌重塑:** 應用程式正式更名為「FlyPig AI 電商增長神器」，以更精準地反映其核心價值。
*   **新增功能簡介:** 在首頁右上角新增「功能簡介」按鈕，點擊後會彈出詳細的功能說明與使用指南，幫助新使用者快速上手。
*   **版本標記:** 在應用程式主畫面上明確標示版本號 v1.9。

---

## 🚀 如何使用 (How to Use)

1.  **輸入產品資訊:** 在首頁表單中，填寫您的產品名稱、詳細描述和目標市場。為了讓 AI 有更豐富的分析素材，建議上傳一張清晰的產品圖片。
2.  **生成市場分析:** 點擊「生成市場分析報告」按鈕。AI 會在約 30-60 秒內完成分析並呈現結果。您可以點擊「下載報告」保存這份分析。
3.  **生成內容策略:** 在分析報告下方，點擊「第二步：生成內容策略」按鈕。AI 會基於先前的分析結果，規劃出詳細的內容與 SEO 策略。同樣地，此策略也可下載保存。
4.  **生成提示詞:**
    *   從三個建議的內容主題卡片中，選擇一個您喜歡的。
    *   點擊「生成 AI Studio 提示詞」或「生成 Gamma 提示詞」。
    *   一個包含完整提示詞的視窗將會彈出，您可以直接複製並貼到對應的 AI 工具中使用。
5.  **重新開始:** 完成所有流程後，可以點擊底部的「開始新分析」按鈕，為下一個產品進行規劃。

---

## 🛠️ 技術棧 (Tech Stack)

*   **前端框架:** [React](https://react.dev/)
*   **CSS 框架:** [Tailwind CSS](https://tailwindcss.com/)
*   **AI 模型:** [Google Gemini API](https://ai.google.dev/)
*   **文件生成:** [Gamma API](https://gamma.app/docs/api) (整合中)
*   **語言:** TypeScript

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
    此專案需要 Google Gemini API 金鑰以及 Gamma API 金鑰才能運作。您需要將您的金鑰設定為環境變數。

    *   `API_KEY`: 您的 Google Gemini API 金鑰。
    *   `GAMMA_API_KEY`: 您的 Gamma API 金鑰。
    *   **重要提示:** 前端程式碼中的 `process.env.API_KEY` 和 `process.env.GAMMA_API_KEY` 是佔位符。在實際部署或本地開發時，您需要透過伺服器或構建工具（如 Vite, Webpack）的環境變數功能來注入此金鑰，以避免將其直接暴露在客戶端程式碼中。

4.  **啟動開發伺服器:**
    您可以使用任何支援靜態檔案的伺服器來運行此專案。一個簡單的方式是使用 VS Code 的 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 擴充功能。

    *   在 VS Code 中打開專案資料夾。
    *   右鍵點擊 `index.html` 檔案，選擇 `Open with Live Server`。

應用程式將在您的瀏覽器中打開，您現在可以開始使用了。