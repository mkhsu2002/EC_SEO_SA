
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";
import fetch from "node-fetch";
import * as crypto from "crypto";

// Initialize Firebase Admin SDK
admin.initializeApp();
// Enable CORS for all origins
const corsHandler = cors({ origin: true });

// --- Securely access API keys from Firebase environment configuration ---
const GEMINI_API_KEY = functions.config().gemini.key;
const GAMMA_API_KEY = functions.config().gamma.key;
const ECPAY_MERCHANT_ID = functions.config().ecpay.merchant_id;
const ECPAY_HASH_KEY = functions.config().ecpay.hash_key;
const ECPAY_HASH_IV = functions.config().ecpay.hash_iv;
const ECPAY_CALLBACK_URL = functions.config().ecpay.callback_url;
const ADMIN_UID = functions.config().admin.uid;


// --- Initialize External APIs ---
if (!GEMINI_API_KEY) {
  console.error("FATAL: Gemini API Key is not set in Firebase Functions config.");
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });


// --- Type definitions (mirrored from frontend for consistency) ---
interface ProductInfo {
  name: string;
  description: string;
  url?: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  market: string;
}

interface ProductCoreValue {
  mainFeatures: string[];
  coreAdvantages: string[];
  painPointsSolved: string[];
}

interface MarketPositioning {
  culturalInsights: string;
  consumerHabits: string;
  languageNuances: string;
  searchTrends: string[];
}

interface Competitor {
  brandName: string;
  marketingStrategy: string;
  strengths: string[];
  weaknesses: string[];
}

interface BuyerPersona {
  personaName: string;
  demographics: string;
  interests: string[];
  painPoints: string[];
  keywords: string[];
}

interface AnalysisResult {
  productCoreValue: ProductCoreValue;
  marketPositioning: MarketPositioning;
  competitorAnalysis: Competitor[];
  buyerPersonas: BuyerPersona[];
}

interface SeoGuidance {
  keywordDensity: string;
  semanticKeywords: string[];
  linkingStrategy: {
    internal: string;
    external: string;
  };
}

interface ContentTopic {
  topic: string;
  description: string;
  focusKeyword: string;
  longTailKeywords: string[];
  seoGuidance: SeoGuidance;
}

interface InteractiveElement {
  type: string;
  description: string;
}

interface ContentStrategy {
  contentTopics: ContentTopic[];
  interactiveElements: InteractiveElement[];
  ctaSuggestions: string[];
}

interface GammaGenerationResult {
  id: string;
  status: "completed" | "pending" | "failed" | "processing";
  gammaUrl: string;
  pdfUrl?: string;
  pptxUrl?: string;
}

interface AuthContext {
    uid: string;
    token: admin.auth.DecodedIdToken;
}

// --- Main API Cloud Function ---
export const api = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send({ message: "Method Not Allowed" });
      return;
    }

    try {
      const { action, payload } = req.body;

      if (!action || !payload) {
        res.status(400).send({ message: "Bad Request: Missing action or payload." });
        return;
      }
      
      const authHeader = req.headers.authorization || "";
      let authContext: AuthContext | null = null;
      if (authHeader.startsWith("Bearer ")) {
          const idToken = authHeader.split("Bearer ")[1];
          try {
              const decodedToken = await admin.auth().verifyIdToken(idToken);
              authContext = { uid: decodedToken.uid, token: decodedToken };
          } catch (error) {
               console.error("Error verifying token:", error);
               res.status(401).send({ message: "Unauthorized: Invalid token." });
               return;
          }
      }

      const verifyIsAdmin = () => {
          if (!authContext?.token.admin) {
              throw new functions.https.HttpsError("permission-denied", "You must be an admin to perform this action.");
          }
      };
      
      let result;
      switch (action) {
        case "analyzeMarket":
          result = await handleAnalyzeMarket(payload);
          break;
        case "generateContentStrategy":
          result = await handleGenerateContentStrategy(payload);
          break;
        case "startGammaGeneration":
          result = await handleStartGamma(payload.productInfo, payload.analysis, payload.topic);
          break;
        case "checkGammaGenerationStatus":
          result = await handleCheckGamma(payload.id);
          break;
        case "createEcpayOrder":
          if (!authContext) {
            res.status(401).send({ message: "Unauthorized." });
            return;
          }
          result = await handleCreateEcpayOrder(authContext.uid);
          break;
        case "getUsers":
            verifyIsAdmin();
            result = await handleGetUsers();
            break;
        case "downloadUsersCsv":
            verifyIsAdmin();
            result = await handleDownloadUsersCsv();
            break;
        default:
          res.status(400).send({ message: "Bad Request: Unknown action." });
          return;
      }
      res.status(200).json(result);

    } catch (error: any) {
      console.error(`Error executing action: ${req.body.action}`, error);
      const code = error.code === 'permission-denied' ? 403 : 500;
      res.status(code).json({ message: error.message || "An internal server error occurred." });
    }
  });
});


// --- Gemini Logic Handlers ---

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        productCoreValue: {
            type: Type.OBJECT,
            properties: {
                mainFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
                coreAdvantages: { type: Type.ARRAY, items: { type: Type.STRING } },
                painPointsSolved: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["mainFeatures", "coreAdvantages", "painPointsSolved"],
        },
        marketPositioning: {
            type: Type.OBJECT,
            properties: {
                culturalInsights: { type: Type.STRING },
                consumerHabits: { type: Type.STRING },
                languageNuances: { type: Type.STRING },
                searchTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["culturalInsights", "consumerHabits", "languageNuances", "searchTrends"],
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
                required: ["brandName", "marketingStrategy", "strengths", "weaknesses"],
            },
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
                required: ["personaName", "demographics", "interests", "painPoints", "keywords"],
            },
        },
    },
    required: ["productCoreValue", "marketPositioning", "competitorAnalysis", "buyerPersonas"],
};

const contentStrategySchema = {
    type: Type.OBJECT,
    properties: {
        contentTopics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    description: { type: Type.STRING },
                    focusKeyword: { type: Type.STRING },
                    longTailKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    seoGuidance: {
                        type: Type.OBJECT,
                        properties: {
                            keywordDensity: { type: Type.STRING },
                            semanticKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            linkingStrategy: {
                                type: Type.OBJECT,
                                properties: {
                                    internal: { type: Type.STRING },
                                    external: { type: Type.STRING },
                                },
                                required: ["internal", "external"],
                            },
                        },
                        required: ["keywordDensity", "semanticKeywords", "linkingStrategy"],
                    },
                },
                required: ["topic", "description", "focusKeyword", "longTailKeywords", "seoGuidance"],
            },
        },
        interactiveElements: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ["type", "description"],
            },
        },
        ctaSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
    },
    required: ["contentTopics", "interactiveElements", "ctaSuggestions"],
};

async function handleAnalyzeMarket(productInfo: ProductInfo): Promise<AnalysisResult> {
  let imageDescription = "No image provided.";
  if (productInfo.image) {
    try {
      const imagePart = { inlineData: { mimeType: productInfo.image.mimeType, data: productInfo.image.base64 } };
      const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart, { text: "Describe the key visual features of the product in this image for a marketing analysis. Respond in Traditional Chinese." }] } });
      imageDescription = result.text ?? "無法分析提供的圖片。";
    } catch (error) {
      console.error("Error analyzing image:", error);
      imageDescription = "無法分析提供的圖片。";
    }
  }

  const prompt = `
    You are a professional market analyst for an e-commerce agency. Your task is to conduct a comprehensive market analysis based on the provided product information and target market.
    **Product Information:**
    - Name: ${productInfo.name}
    - URL: ${productInfo.url || 'Not provided.'}
    - Description & Features: ${productInfo.description}
    - Visual Analysis from Image: ${imageDescription}
    **Target Market:** ${productInfo.market}
    Return the entire analysis in a single, valid JSON object that strictly adheres to the provided schema. Analyze deeply and provide insightful, actionable results. The content within the JSON MUST be in Traditional Chinese (繁體中文).
  `;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: analysisSchema },
  });
  
  if (!result.text) {
      throw new Error("Received an empty response from Gemini API for market analysis.");
  }
  return JSON.parse(result.text.trim());
}

async function handleGenerateContentStrategy(analysisResult: AnalysisResult): Promise<ContentStrategy> {
    const prompt = `
        You are a senior content strategist and SEO expert. Based on the detailed market analysis provided, create a comprehensive content and interaction strategy for the product.
        **Market Analysis Context:**
        - Product Core Value: Features: ${analysisResult.productCoreValue.mainFeatures.join(", ")}, Advantages: ${analysisResult.productCoreValue.coreAdvantages.join(", ")}, Pain Points Solved: ${analysisResult.productCoreValue.painPointsSolved.join(", ")}
        - Buyer Personas: ${analysisResult.buyerPersonas.map((p) => p.personaName).join(", ")}
        - Target Market: ${analysisResult.marketPositioning.culturalInsights}
        Return the entire strategy in a single, valid JSON object that strictly adheres to the provided schema. The strategy should be creative, actionable, and tailored to the analysis. The content within the JSON MUST be in Traditional Chinese (繁體中文).
    `;
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: contentStrategySchema },
    });

    if (!result.text) {
        throw new Error("Received an empty response from Gemini API for content strategy.");
    }
    return JSON.parse(result.text.trim());
}

// --- Gamma Logic Handlers ---
const GAMMA_API_URL = 'https://public-api.gamma.app/v0.2/generations';

const createDocumentText = (productInfo: ProductInfo, analysis: AnalysisResult, topic: ContentTopic): string => {
    return `# ${topic.topic}
## 產品: ${productInfo.name}
${analysis.productCoreValue.mainFeatures.join(" ")}
${topic.description}
    `;
};

async function handleStartGamma(productInfo: ProductInfo, analysis: AnalysisResult, topic: ContentTopic) {
    if (!GAMMA_API_KEY) throw new Error("Gamma API Key is not configured.");
    
    const inputText = createDocumentText(productInfo, analysis, topic);

    const response = await fetch(GAMMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-KEY': GAMMA_API_KEY },
        body: JSON.stringify({
            inputText,
            textMode: 'generate',
            format: 'document',
            model: 'pro',
            language: 'zh-TW',
            layout: 'professional',
            style: 'default',
        }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gamma API Error: ${errorData.message || response.statusText}`);
    }
    const data: any = await response.json();
    return { id: data.generationId };
}

async function handleCheckGamma(id: string) {
    if (!GAMMA_API_KEY) throw new Error("Gamma API Key is not configured.");
    
    const response = await fetch(`${GAMMA_API_URL}/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'X-API-KEY': GAMMA_API_KEY },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gamma API Error: ${errorData.message || response.statusText}`);
    }
    const data: any = await response.json();
    return data.generation as GammaGenerationResult;
}

// --- ECPay Logic ---

const generateCheckMacValue = (params: Record<string, any>, hashKey: string, hashIV: string): string => {
    const sortedParams = Object.keys(params)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((key) => `${key}=${params[key]}`)
        .join("&");

    const checkString = `HashKey=${hashKey}&${sortedParams}&HashIV=${hashIV}`;
    const encodedString = encodeURIComponent(checkString).toLowerCase();
    
    const hash = crypto.createHash("sha256").update(encodedString).digest("hex");
    return hash.toUpperCase();
};

async function handleCreateEcpayOrder(uid: string) {
    if (!ECPAY_MERCHANT_ID || !ECPAY_HASH_KEY || !ECPAY_HASH_IV || !ECPAY_CALLBACK_URL) {
        throw new Error("ECPay credentials are not configured on the backend.");
    }
    
    const ecpayActionUrl = "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"; // ECPay testing environment
    const merchantTradeNo = `FP${Date.now()}`;
    const merchantTradeDate = new Date().toLocaleString("zh-TW", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false,
    }).replace(/-/g, "/");

    const baseParams = {
        MerchantID: ECPAY_MERCHANT_ID,
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: merchantTradeDate,
        PaymentType: "aio",
        TotalAmount: 300,
        TradeDesc: "FlyPig AI 電商增長神器 - 升級專業版",
        ItemName: "FlyPig AI Pro Access x 1",
        ReturnURL: "https://flypigaige.web.app/", // Client-side return URL
        OrderResultURL: ECPAY_CALLBACK_URL, // Server-to-server callback
        ChoosePayment: "Credit",
        EncryptType: 1,
        CustomField1: uid,
    };

    const checkMacValue = generateCheckMacValue(baseParams, ECPAY_HASH_KEY, ECPAY_HASH_IV);

    return {
        ...baseParams,
        CheckMacValue: checkMacValue,
        actionUrl: ecpayActionUrl,
    };
}

export const ecpayCallback = functions.https.onRequest(async (req, res) => {
    const paymentResult = req.body;
    console.log("Received ECPay callback:", paymentResult);

    try {
        const { CheckMacValue, ...restOfParams } = paymentResult;
        const generatedCheckMac = generateCheckMacValue(restOfParams, ECPAY_HASH_KEY, ECPAY_HASH_IV);

        if (CheckMacValue !== generatedCheckMac) {
            console.error("ECPay CheckMacValue verification failed.");
            res.status(400).send("CheckMacValue mismatch.");
            return;
        }

        const uid = paymentResult.CustomField1;
        const tradeStatus = paymentResult.RtnCode; // '1' means success

        if (tradeStatus === "1") {
            if (!uid) {
                 console.error("ECPay callback missing UID in CustomField1.");
                 res.status(200).send("1|OK");
                 return;
            }
            const userDocRef = admin.firestore().collection("users").doc(uid);
            await userDocRef.update({
                isPaid: true,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                analysisCount: 0, // Reset analysis count upon successful payment
            });
            console.log(`Successfully updated user ${uid} to paid status.`);
        } else {
             console.log(`Payment for user ${uid} was not successful. Status: ${tradeStatus}`);
        }
        
        res.status(200).send("1|OK");

    } catch (error) {
        console.error("Error processing ECPay callback:", error);
        res.status(500).send("0|Error");
    }
});

// --- Admin Logic ---

async function getAllUsersFromFirestore() {
    const usersSnapshot = await admin.firestore().collection("users").get();
    const firestoreUsers: Record<string, any> = {};
    usersSnapshot.forEach((doc) => {
        firestoreUsers[doc.id] = {
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        };
    });
    return firestoreUsers;
}

async function handleGetUsers() {
    const listUsersResult = await admin.auth().listUsers();
    const firestoreUsers = await getAllUsersFromFirestore();

    const combinedUsers = listUsersResult.users.map((userRecord) => {
        const firestoreData = firestoreUsers[userRecord.uid] || {};
        return {
            uid: userRecord.uid,
            email: userRecord.email,
            createdAt: userRecord.metadata.creationTime,
            analysisCount: firestoreData.analysisCount || 0,
            isPaid: firestoreData.isPaid || false,
        };
    });

    return combinedUsers;
}

async function handleDownloadUsersCsv() {
    const users = await handleGetUsers();
    
    let csvData = "UID,Email,Created At,Analysis Count,Is Paid\n";

    users.forEach((user) => {
        csvData += `${user.uid},${user.email || ""},${user.createdAt},${user.analysisCount},${user.isPaid}\n`;
    });

    return { csvData };
}

export const setAdminByOwner = functions.https.onCall(async (data, context) => {
    if (context.auth?.uid !== ADMIN_UID) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only the project owner can set admins.",
        );
    }

    const email = data.email;
    if (!email) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with an 'email' argument.",
        );
    }

    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        return { message: `Success! ${email} has been made an admin.` };
    } catch (error) {
        console.error("Error setting admin claim:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while setting admin claim.");
    }
});
