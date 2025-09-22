export interface ProductCoreValue {
  mainFeatures: string[];
  coreAdvantages: string[];
  painPointsSolved: string[];
}

export interface MarketPositioning {
  culturalInsights: string;
  consumerHabits: string;
  languageNuances: string;
  searchTrends: string[];
}

export interface Competitor {
  brandName: string;
  marketingStrategy: string;
  strengths: string[];
  weaknesses: string[];
}

export interface BuyerPersona {
  personaName: string;
  demographics: string;
  interests: string[];
  painPoints: string[];
  keywords: string[];
}

export interface AnalysisResult {
  productCoreValue: ProductCoreValue;
  marketPositioning: MarketPositioning;
  competitorAnalysis: Competitor[];
  buyerPersonas: BuyerPersona[];
}

export interface ProductInfo {
  name: string;
  description: string;
  image?: {
    base64: string;
    mimeType: string;
  };
  market: string;
}

// --- SEO Enhancement Types ---
export interface SeoGuidance {
  keywordDensity: string; // e.g., "1-2%"
  semanticKeywords: string[]; // LSI keywords
  linkingStrategy: {
    internal: string; // Advice on internal links
    external: string; // Advice on external links
  };
}

export interface SeoAnalysis {
  summary: string;
  checklist: {
    item: string; // e.g., "Main keyword in H1 tag"
    passed: boolean;
  }[];
}


// --- Content Strategy Types ---

export interface ContentTopic {
  topic: string;
  description: string;
  focusKeyword: string;
  longTailKeywords: string[];
  seoGuidance: SeoGuidance;
}

export interface InteractiveElement {
  type: string;
  description: string;
}

export interface ContentStrategy {
  contentTopics: ContentTopic[];
  interactiveElements: InteractiveElement[];
  ctaSuggestions: string[];
}

// --- Webpage Content Types ---

export interface WebpageContent {
  title: string;
  suggestedUrl: string;
  metaDescription: string;
  htmlContent: string;
  seoAnalysis: SeoAnalysis;
}

// --- Gamma API Types ---

export interface GammaWebpageContent {
  gammaId: string;
  gammaUrl: string;
  title: string;
  suggestedUrl: string;
  metaDescription: string;
  htmlContent: string;
  cssContent: string;
  seoAnalysis: SeoAnalysis;
}
