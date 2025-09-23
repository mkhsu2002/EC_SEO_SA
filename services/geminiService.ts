import { GoogleGenAI, Type } from "@google/genai";
import type { ProductInfo, AnalysisResult, ContentStrategy } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    productCoreValue: {
      type: Type.OBJECT,
      properties: {
        mainFeatures: { type: Type.ARRAY, items: { type: Type.STRING, description: "Key feature of the product." } },
        coreAdvantages: { type: Type.ARRAY, items: { type: Type.STRING, description: "Unique selling proposition or advantage." } },
        painPointsSolved: { type: Type.ARRAY, items: { type: Type.STRING, description: "A specific user problem this product solves." } },
      },
      required: ["mainFeatures", "coreAdvantages", "painPointsSolved"]
    },
    marketPositioning: {
      type: Type.OBJECT,
      properties: {
        culturalInsights: { type: Type.STRING, description: "Cultural factors in the target market relevant to the product." },
        consumerHabits: { type: Type.STRING, description: "Typical buying behaviors and preferences of consumers in the market." },
        languageNuances: { type: Type.STRING, description: "Specific language or slang used by the target audience." },
        searchTrends: { type: Type.ARRAY, items: { type: Type.STRING, description: "A popular search trend or keyword phrase." } },
      },
      required: ["culturalInsights", "consumerHabits", "languageNuances", "searchTrends"]
    },
    competitorAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          brandName: { type: Type.STRING },
          marketingStrategy: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["brandName", "marketingStrategy", "strengths", "weaknesses"]
      }
    },
    buyerPersonas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          personaName: { type: Type.STRING },
          demographics: { type: Type.STRING },
          interests: { type: Type.ARRAY, items: { type: Type.STRING } },
          painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["personaName", "demographics", "interests", "painPoints", "keywords"]
      }
    }
  },
  required: ["productCoreValue", "marketPositioning", "competitorAnalysis", "buyerPersonas"]
};

const contentStrategySchema = {
    type: Type.OBJECT,
    properties: {
        contentTopics: {
            type: Type.ARRAY,
            description: "A list of engaging, non-promotional content topics.",
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "The catchy headline or title of the content piece." },
                    description: { type: Type.STRING, description: "A brief explanation of what the content will cover and why it's valuable to the audience." },
                    focusKeyword: { type: Type.STRING, description: "The primary SEO keyword for this topic." },
                    longTailKeywords: { type: Type.ARRAY, items: { type: Type.STRING, description: "A related long-tail keyword." } },
                    seoGuidance: {
                        type: Type.OBJECT,
                        properties: {
                            keywordDensity: { type: Type.STRING, description: "Suggested keyword density for the focus keyword, e.g., '1-2%'." },
                            semanticKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of LSI or semantically related keywords." },
                            linkingStrategy: {
                                type: Type.OBJECT,
                                properties: {
                                    internal: { type: Type.STRING, description: "Advice on internal linking." },
                                    external: { type: Type.STRING, description: "Advice on external linking." }
                                },
                                required: ["internal", "external"]
                            }
                        },
                        required: ["keywordDensity", "semanticKeywords", "linkingStrategy"]
                    }
                },
                required: ["topic", "description", "focusKeyword", "longTailKeywords", "seoGuidance"]
            }
        },
        interactiveElements: {
            type: Type.ARRAY,
            description: "A list of ideas for interactive elements to include on the webpage.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "The type of interactive element (e.g., 'Quiz', 'Calculator')." },
                    description: { type: Type.STRING, description: "A detailed description of the interactive element." }
                },
                required: ["type", "description"]
            }
        },
        ctaSuggestions: {
            type: Type.ARRAY,
            description: "A list of natural, non-intrusive call-to-action copy suggestions.",
            items: { type: Type.STRING }
        }
    },
    required: ["contentTopics", "interactiveElements", "ctaSuggestions"]
};


export const analyzeMarket = async (productInfo: ProductInfo): Promise<AnalysisResult> => {
  let imageDescription = "No image provided.";
  if (productInfo.image) {
    try {
      const imagePart = {
        inlineData: {
          mimeType: productInfo.image.mimeType,
          data: productInfo.image.base64,
        },
      };
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: "Describe the key visual features of the product in this image for a marketing analysis. Respond in Traditional Chinese." }] },
      });
      imageDescription = result.text;
    } catch (error) {
      console.error("Error analyzing image:", error);
      imageDescription = "無法分析提供的圖片。";
    }
  }

  const prompt = `
    You are a professional market analyst and SEO expert. Based on the following product information and target market, provide a comprehensive market analysis.

    **Product Information:**
    - Name: ${productInfo.name}
    - URL: ${productInfo.url || 'Not provided. Analyze based on description.'}
    - Description & Features: ${productInfo.description}
    - Visual Analysis from Image: ${imageDescription}

    **Target Market:** ${productInfo.market}
    
    **Instructions:**
    If a product URL is provided, use it as the primary source of truth and context for the product's features, branding, and value proposition. Synthesize the information from the URL with the provided description. If you cannot access URLs, use the provided text information and the URL as a strong contextual reference.

    **Task:**
    1.  **Product Core Value:** Distill the main features, core advantages, and the user pain points it solves.
    2.  **Target Market Positioning:** Analyze local culture, consumer habits, language, and search trends for the specified market.
    3.  **Competitor Analysis:** Identify 3 major competitors. Analyze their marketing, strengths, and weaknesses.
    4.  **Buyer Personas:** Create 3 detailed buyer personas, including their demographics, interests, pain points, and keywords they would search for.

    Return the entire analysis in a single, valid JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting outside of the JSON object. The content within the JSON MUST be in Traditional Chinese (繁體中文).
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonString = result.text.trim();
    try {
        const parsedResult: AnalysisResult = JSON.parse(jsonString);
        return parsedResult;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString);
        throw new Error("模型回傳的資料格式錯誤，無法解析。請稍後再試。");
    }
  } catch (error) {
    console.error("Error generating market analysis:", error);
    throw new Error("生成市場分析時發生錯誤。請檢查您的網路連線或稍後再試。");
  }
};

export const generateContentStrategy = async (analysisResult: AnalysisResult): Promise<ContentStrategy> => {
    const prompt = `
        You are a senior content strategist and SEO expert. Based on the detailed market analysis provided below, create a content and engagement strategy for a webpage.

        **Market Analysis Context:**
        - **Product Core Value:** Main Features: ${analysisResult.productCoreValue.mainFeatures.join(', ')}; Core Advantages: ${analysisResult.productCoreValue.coreAdvantages.join(', ')}; Pain Points Solved: ${analysisResult.productCoreValue.painPointsSolved.join(', ')}.
        - **Target Audience (Personas):** 
            ${analysisResult.buyerPersonas.map(p => `- ${p.personaName} (${p.demographics}): Interested in ${p.interests.join(', ')}. Searches for keywords like: ${p.keywords.join(', ')}.`).join('\n')}

        **Your Task:**
        1.  **Content Topics:** Brainstorm 3 distinct, non-promotional content topics that address the audience's pain points and interests. For each topic, provide a catchy title, a brief description, a primary focus keyword, and 5-7 related long-tail keywords.
        2.  **SEO Guidance (for each topic):**
            -   **Keyword Density:** Suggest an optimal keyword density for the focus keyword (e.g., "1-2%").
            -   **Semantic Keywords:** List 5-7 semantically related keywords (LSI keywords) to build topical authority.
            -   **Linking Strategy:** Briefly describe a smart internal linking (e.g., "Link to the main product page") and external linking strategy (e.g., "Link to a high-authority study on the topic").
        3.  **Interactive Elements:** Propose 2-3 engaging interactive elements for the webpage (e.g., quizzes, calculators). Describe each one.
        4.  **Call-to-Action (CTA) Copy:** Write 3 natural, non-intrusive CTA copy examples.

        Return the entire strategy in a single, valid JSON object that strictly adheres to the provided schema. Do not include any text or markdown formatting outside of the JSON object. The content within the JSON MUST be in Traditional Chinese (繁體中文).
    `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: contentStrategySchema,
            },
        });

        const jsonString = result.text.trim();
        try {
            const parsedResult: ContentStrategy = JSON.parse(jsonString);
            return parsedResult;
        } catch (e) {
            console.error("Failed to parse JSON response:", jsonString);
            throw new Error("模型回傳的資料格式錯誤，無法解析。請稍後再試。");
        }
    } catch (error) {
        console.error("Error generating content strategy:", error);
        throw new Error("生成內容策略時發生錯誤。請檢查您的網路連線或稍後再試。");
    }
};