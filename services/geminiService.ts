import type { ProductInfo, AnalysisResult, ContentStrategy } from '../types';
import { callApi } from './firebaseService';

export const analyzeMarket = async (productInfo: ProductInfo): Promise<AnalysisResult> => {
    return callApi('analyzeMarket', productInfo);
};

export const generateContentStrategy = async (analysisResult: AnalysisResult): Promise<ContentStrategy> => {
    return callApi('generateContentStrategy', analysisResult);
};
