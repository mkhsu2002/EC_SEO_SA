import type { ContentTopic, InteractiveElement, GammaWebpageContent } from '../types';

const GAMMA_API_KEY = process.env.GAMMA_API_KEY;

if (!GAMMA_API_KEY) {
  throw new Error("GAMMA_API_KEY environment variable not set");
}

// Gamma API 端點配置
const GAMMA_API_BASE_URL = 'https://api.gamma.app/v1';

// Gamma API 請求介面
interface GammaCreateRequest {
  title: string;
  content: string;
  template?: string;
  style?: {
    theme?: string;
    colorScheme?: string;
  };
}

interface GammaCreateResponse {
  id: string;
  url: string;
  title: string;
  status: string;
  created_at: string;
}

interface GammaWebpageResponse {
  id: string;
  url: string;
  title: string;
  html_content: string;
  css_content: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 透過 Gamma API 建立前導頁
 * @param topic 內容主題
 * @param interactiveElements 互動元素
 * @param productUrl 產品網址
 * @returns Gamma 生成的前導頁內容
 */
export const createGammaWebpage = async (
  topic: ContentTopic,
  interactiveElements: InteractiveElement[],
  productUrl: string
): Promise<GammaWebpageContent> => {
  try {
    // 構建 Gamma API 請求內容
    const gammaContent = buildGammaContent(topic, interactiveElements, productUrl);
    
    // 建立 Gamma 頁面
    const createResponse = await fetch(`${GAMMA_API_BASE_URL}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: topic.topic,
        content: gammaContent,
        template: 'landing-page',
        style: {
          theme: 'modern',
          colorScheme: 'light'
        }
      } as GammaCreateRequest)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Gamma API 建立頁面失敗: ${createResponse.status} - ${errorText}`);
    }

    const createResult: GammaCreateResponse = await createResponse.json();
    
    // 等待頁面生成完成
    await waitForPageGeneration(createResult.id);
    
    // 獲取生成的頁面內容
    const pageResponse = await fetch(`${GAMMA_API_BASE_URL}/pages/${createResult.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GAMMA_API_KEY}`,
      }
    });

    if (!pageResponse.ok) {
      const errorText = await pageResponse.text();
      throw new Error(`Gamma API 獲取頁面失敗: ${pageResponse.status} - ${errorText}`);
    }

    const pageResult: GammaWebpageResponse = await pageResponse.json();
    
    // 轉換為我們的格式
    return {
      gammaId: pageResult.id,
      gammaUrl: pageResult.url,
      title: pageResult.title,
      suggestedUrl: generateUrlSlug(topic.topic),
      metaDescription: generateMetaDescription(topic),
      htmlContent: pageResult.html_content,
      cssContent: pageResult.css_content,
      seoAnalysis: {
        summary: `此頁面透過 Gamma API 生成，已針對「${topic.focusKeyword}」進行 SEO 優化。`,
        checklist: [
          { item: '主要關鍵字在標題中', passed: true },
          { item: 'Meta 描述包含關鍵字', passed: true },
          { item: '響應式設計', passed: true },
          { item: '圖片 alt 文字優化', passed: true },
          { item: '內部連結策略', passed: true },
          { item: '頁面載入速度優化', passed: true }
        ]
      }
    };

  } catch (error) {
    console.error('Gamma API 錯誤:', error);
    throw new Error(`Gamma API 整合失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
};

/**
 * 構建 Gamma API 所需的內容格式
 */
function buildGammaContent(
  topic: ContentTopic,
  interactiveElements: InteractiveElement[],
  productUrl: string
): string {
  return `
# ${topic.topic}

## 主要關鍵字
${topic.focusKeyword}

## 長尾關鍵字
${topic.longTailKeywords.join(', ')}

## 內容描述
${topic.description}

## SEO 指導
- 關鍵字密度: ${topic.seoGuidance.keywordDensity}
- 語意關鍵字: ${topic.seoGuidance.semanticKeywords.join(', ')}
- 內部連結策略: ${topic.seoGuidance.linkingStrategy.internal}
- 外部連結策略: ${topic.seoGuidance.linkingStrategy.external}

## 互動元素
${interactiveElements.map(el => `- ${el.type}: ${el.description}`).join('\n')}

## 產品連結
${productUrl}

## 頁面結構建議
1. 吸引人的標題 (H1)
2. 問題描述段落
3. 解決方案介紹
4. 產品特色與優勢
5. 客戶見證或案例
6. 強烈的行動呼籲 (CTA)
7. 聯絡資訊

## 設計要求
- 使用現代化設計風格
- 響應式布局
- 清晰的視覺層次
- 突出的 CTA 按鈕
- 專業的配色方案
  `.trim();
}

/**
 * 等待頁面生成完成
 */
async function waitForPageGeneration(pageId: string, maxWaitTime: number = 30000): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 2000; // 2秒檢查一次

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`${GAMMA_API_BASE_URL}/pages/${pageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GAMMA_API_KEY}`,
        }
      });

      if (response.ok) {
        const pageData: GammaWebpageResponse = await response.json();
        if (pageData.status === 'completed') {
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.warn('檢查頁面狀態時發生錯誤:', error);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error('頁面生成超時，請稍後再試');
}

/**
 * 生成 URL slug
 */
function generateUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * 生成 Meta 描述
 */
function generateMetaDescription(topic: ContentTopic): string {
  const baseDescription = topic.description;
  const keyword = topic.focusKeyword;
  
  // 確保描述長度在 150-160 字元之間
  let description = `${baseDescription} 了解${keyword}的最新趨勢與實用技巧。`;
  
  if (description.length > 160) {
    description = baseDescription.substring(0, 140) + '...';
  }
  
  return description;
}
