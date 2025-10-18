import type { ProductInfo, AnalysisResult, ContentTopic, GammaGenerationResult } from '../types';
import { callApi } from './firebaseService';

export const startGammaGeneration = async (productInfo: ProductInfo, analysis: AnalysisResult, topic: ContentTopic): Promise<{ id: string }> => {
    return callApi('startGammaGeneration', { productInfo, analysis, topic });
};

export const checkGammaGenerationStatus = async (id: string): Promise<GammaGenerationResult> => {
    return callApi('checkGammaGenerationStatus', { id });
};
