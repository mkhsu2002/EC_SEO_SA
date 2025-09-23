import type { ProductInfo, AnalysisResult, ContentTopic, GammaGenerationResult } from '../types';

const GAMMA_API_URL = 'https://public-api.gamma.app/v0.2/generations';

// In a real-world scenario, use a secure method to handle API keys instead of hardcoding.
const GAMMA_API_KEY = 'sk-gamma-VNp5x2VOUlFLI9cuAPOyK1c4foYfJcesD24zKIrNA';

const createDocumentText = (productInfo: ProductInfo, analysis: AnalysisResult, topic: ContentTopic): string => {
    let text = `# ${topic.topic}\n\n`;
    text += `*${productInfo.name} - A detailed guide and solution.*\n\n`;
    text += `---\n`;

    const personaSummary = analysis.buyerPersonas.map(p => p.personaName).join(', ');
    text += `# Is This You? Understanding Our Audience\n\n`;
    text += `This document is for **${personaSummary}**. We understand you're facing specific challenges.\n\n`;
    analysis.buyerPersonas.forEach(p => {
        text += `*   **${p.personaName} (${p.demographics})**: Often struggles with: *${p.painPoints.join(', ')}*. \n`;
    });
    text += `---\n`;

    text += `# The Challenge: Identifying the Core Problem\n\n`;
    text += `Based on our research, the main obstacles our audience faces are:\n`;
    analysis.productCoreValue.painPointsSolved.forEach(p => {
        text += `* ${p}\n`;
    });
    text += `These issues can be frustrating and time-consuming.\n`;
    text += `---\n`;
    
    text += `# The Solution: Introducing ${productInfo.name}\n\n`;
    text += `We've designed the ultimate solution to address these exact problems.\n\n`;
    text += `**Core Advantages of Our Approach:**\n`;
     analysis.productCoreValue.coreAdvantages.forEach(p => {
        text += `* ${p}\n`;
    });
    text += `---\n`;

    text += `# How It Works: A Look at the Key Features\n\n`;
    analysis.productCoreValue.mainFeatures.forEach(p => {
        const parts = p.split(':');
        const feature = parts[0];
        const description = parts.slice(1).join(':').trim();
        text += `* **${feature}**: ${description}\n`;
    });
    text += `---\n`;

    if (analysis.competitorAnalysis.length > 0) {
        text += `# How We Stand Out from the Competition\n\n`;
        const competitor = analysis.competitorAnalysis[0];
        text += `While other solutions like **${competitor.brandName}** exist, our unique focus on solving your core needs sets us apart. We provide tangible benefits where others fall short.\n`;
        text += `---\n`;
    }

    text += `# Ready to Overcome Your Challenges?\n\n`;
    text += `Take the next step. Discover how **${productInfo.name}** can make a difference for you today.\n\n`;

    if (productInfo.url) {
      text += `Visit our official website for more details: ${productInfo.url}`;
    }
    
    return text;
};


export const startGammaGeneration = async (productInfo: ProductInfo, analysis: AnalysisResult, topic: ContentTopic): Promise<{ id: string }> => {
    if (!GAMMA_API_KEY) {
        throw new Error("Gamma API Key is not configured. Please set the GAMMA_API_KEY environment variable.");
    }
    
    const inputText = createDocumentText(productInfo, analysis, topic);

    const response = await fetch(GAMMA_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': GAMMA_API_KEY,
        },
        body: JSON.stringify({
            inputText,
            textMode: 'generate',
            format: 'document',
            cardSplit: 'inputTextBreaks',
            additionalInstructions: `Create a visually appealing and professional single-page document, suitable for a web landing page. Use high-quality, relevant stock images. The tone should be inspiring, professional, and persuasive. The target audience is ${analysis.marketPositioning.consumerHabits}. Structure it clearly with headers and sections.`,
            imageOptions: {
                source: 'webAllImages',
            },
            cardOptions: {
                dimensions: 'pageless'
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to start Gamma generation and could not parse error response.' }));
        console.error('Gamma API Error:', errorData);
        throw new Error(errorData.message || 'Failed to start Gamma generation.');
    }

    const data = await response.json();
    return { id: data.generationId };
};

export const checkGammaGenerationStatus = async (id: string): Promise<GammaGenerationResult> => {
    if (!GAMMA_API_KEY) {
        throw new Error("Gamma API Key is not configured.");
    }

    const response = await fetch(`${GAMMA_API_URL}/${id}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-API-KEY': GAMMA_API_KEY,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to check Gamma status and could not parse error response.' }));
        console.error('Gamma API Error:', errorData);
        throw new Error(errorData.message || 'Failed to check Gamma generation status.');
    }

    const data = await response.json();
    return data.generation as GammaGenerationResult; 
};