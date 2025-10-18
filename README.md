# FlyPig AI 電商增長神器 v1.9

**FlyPig AI 電商增長神器** 是一個由 AI 驅動的專家級應用程式，旨在為電商產品提供深入的市場分析、內容策略規劃，並能一鍵生成適用於各種 AI 工具的專業提示詞 (Prompt)，以快速產出高品質的前導頁。它將專業的市場分析師、SEO 專家與內容策略師的工作流程自動化，幫助使用者快速掌握市場動態，制定致勝策略。

---
<img width="300" height="200" alt="image" src="https://github.com/user-attachments/assets/4057965e-9907-4ad9-afb4-2cf3136a96dc" />
<img width="300" height="200" alt="image" src="https://github.com/user-attachments/assets/e47da488-9fa5-4520-8029-4c82f8d17297" />
<img width="300" height="200" alt="image" src="https://github.com/user-attachments/assets/8d28ba48-3819-4d3a-bfe8-18fd12eca561" />


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

### **管理員功能 (Admin Features)**

*   **使用者管理:** 管理員登入後可進入專屬後台，查看所有註冊會員的列表。
*   **資料匯出:** 管理員可以一鍵將所有會員資料下載為 CSV 檔案，方便進行數據分析與客戶關係管理。

### **其他功能**

*   **下載報告:** 所有市場分析報告和內容策略皆可一鍵下載為 Markdown (`.md`) 檔案，方便歸檔與分享。
*   **多主題生成:** 使用者可以為所有建議的內容主題生成提示詞。

---

## 🛡️ 如何設定第一位管理員

為了安全地啟用管理員功能，您需要手動設定第一位管理員。請依照以下步驟操作：

1.  **取得您的 Firebase 使用者 UID:**
    *   首先，請使用您希望設為管理員的 Email 在應用程式上註冊一個帳號。
    *   前往您的 [Firebase Console](https://console.firebase.google.com/)。
    *   選擇您的專案 (`flypigaige`)。
    *   在左側選單中，點擊 **Authentication**。
    *   在 **Users** 分頁中，找到您剛剛註冊的帳號，並複製其 **User UID** (這是一串長長的英數混合字元)。

2.  **設定 Firebase Functions 環境變數:**
    *   請確保您已安裝 [Firebase CLI](https://firebase.google.com/docs/cli)。
    *   在您的專案根目錄（包含 `firebase.json` 的地方）打開終端機。
    *   執行以下指令，將 `YOUR_ADMIN_UID` 替換為您剛剛複製的 UID：
        ```bash
        firebase functions:config:set admin.uid="YOUR_ADMIN_UID"
        ```
    *   此指令會將您的 UID 安全地儲存在後端環境中，作為判斷「超級管理員」的依據。

3.  **部署 Cloud Function:**
    *   執行以下指令來部署更新後的後端功能：
        ```bash
        firebase deploy --only functions
        ```

4.  **指派管理員權限:**
    *   部署完成後，請用您設為「超級管理員」的帳號登入應用程式。
    *   打開瀏覽器的開發者工具（通常是按 `F12`），並切換到 **Console** (主控台)。
    *   在主控台中貼上並執行以下程式碼，將 `email_of_user_to_make_admin@example.com` 替換為您想要設為管理員的用戶 Email (可以是您自己或其他人的 Email)：
        ```javascript
        const setAdmin = firebase.functions().httpsCallable('setAdminByOwner');
        setAdmin({ email: 'email_of_user_to_make_admin@example.com' })
          .then(result => console.log(result))
          .catch(error => console.error(error));
        ```
    *   **重要提示:** 您需要將 `firebase.functions()` 替換為實際的 Firebase Functions 實例。由於此專案未將 `functions` 實例暴露於全域，您可能需要稍微修改程式碼以取得該實例，或在本地開發環境中執行此操作。
    *   執行成功後，目標用戶的權限就會被更新。該用戶重新整理頁面或重新登入後，就會在頁首看到「管理員後台」的按鈕。

---

## 🚀 如何使用 (How to Use)

1.  **輸入產品資訊:** 在首頁表單中，填寫您的產品名稱、詳細描述和目標市場。為了讓 AI 有更豐富的分析素材，建議上傳一張清晰的產品圖片。
2.  **生成市場分析:** 點擊「生成市場分析報告」按鈕。AI 會在約 30-60 秒內完成分析並呈現結果。您可以點擊「下載報告」保存這份分析。
3.  **生成內容策略:** 在分析報告下方，點擊「第二步：生成內容策略」按鈕。AI 會基於先前的分析結果，規劃出詳細的內容與 SEO 策略。同樣地，此策略也可下載保存。
4.  **生成提示詞:**
    *   從三個建議的內容主題卡片中，選擇一個您喜歡的。
    *   點擊「生成 AI Studio 提示詞」或「生成 Gamma 提示詞」。
    *   一個包含完整提示詞的視窗將會彈出，您可以直接複製並貼到對應的 AI 工具中使用。
5.  **進入後台 (僅限管理員):**
    *   若您是管理員，登入後點擊頁首的「管理員後台」按鈕。
    *   在後台可以查看所有使用者資料，或點擊「下載會員資料 (CSV)」來匯出報表。
6.  **重新開始:** 完成所有流程後，可以點擊底部的「開始新分析」按鈕，為下一個產品進行規劃。

---

## 🛠️ 技術棧 (Tech Stack)

*   **前端框架:** [React](https://react.dev/)
*   **CSS 框架:** [Tailwind CSS](https://tailwindcss.com/)
*   **後端服務:** [Firebase Functions](https://firebase.google.com/docs/functions)
*   **資料庫:** [Firestore](https://firebase.google.com/docs/firestore)
*   **使用者驗證:** [Firebase Authentication](https://firebase.google.com/docs/auth)
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

---

## 🔐 Firestore 安全規則 (Security Rules)

**為了讓使用者註冊功能正常運作，您必須設定正確的 Firestore 安全規則。** 若未設定，使用者在註冊後將無法建立對應的資料庫文件，導致註冊失敗並顯示「無法建立使用者資料庫」的錯誤。

請前往您的 [Firebase Console](https://console.firebase.google.com/) -> **Firestore Database** -> **規則 (Rules)** 分頁，並貼上以下規則：

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 允許使用者讀取和寫入他們自己的文件
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 允許已登入的使用者為他們自己建立分析日誌
    match /analysis_logs/{logId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
**重要提示：** 這些是能讓應用程式基礎功能正常運作的規則。在正式上線的產品中，您可能需要根據業務邏輯制定更詳細、更嚴格的規則。
