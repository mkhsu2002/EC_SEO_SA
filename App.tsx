import React, { useState, useCallback, useEffect } from 'react';
import { analyzeMarket, generateContentStrategy } from './services/geminiService';
import { startGammaGeneration, checkGammaGenerationStatus } from './services/gammaService';
import type { AnalysisResult, BuyerPersona, Competitor, ProductInfo, ContentStrategy, ContentTopic, InteractiveElement, GammaGenerationResult } from './types';

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

// --- SVG Icon Components ---
const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>);
const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023.994-2.131 1.253-3.284A3 3 0 0 0 11.25 9.75v-1.5a3 3 0 0 0-3.75-2.632m3.75 0-1.007-1.007a3 3 0 0 0-4.243 0M3.75 19.125A9.094 9.094 0 0 1 7.5 18a9.094 9.094 0 0 1 3.75 1.125m-3.75 0a3 3 0 0 0-3.75 2.632A3 3 0 0 0 7.5 19.125m6-6.375a3 3 0 0 0-3-3m3 3a3 3 0 0 0 3 3m-3-3V1.5m-3 5.25v1.5a3 3 0 0 0 3 3m3-3a3 3 0 0 0-3-3" /></svg>);
const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a6.01 6.01 0 0 0 4.5 0m-8.625-1.401a6.01 6.01 0 0 1 4.5 0m-4.5 0a3.75 3.75 0 0 0-3.75 3.75H3a3.75 3.75 0 0 0 3.75-3.75m6.75-3a3.75 3.75 0 0 0 3.75-3.75V3a3.75 3.75 0 0 0-3.75-3.75S9 3 9 3v6.75a3.75 3.75 0 0 0 3.75 3.75Z" /></svg>);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>);
const ArrowPathIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-3.181-4.991-3.181-3.183a8.25 8.25 0 0 0-11.667 0L2.985 14.651" /></svg>);
const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 15" /></svg>);


// --- UI Components ---

const Header: React.FC = () => (
    <header className="w-full text-center py-6 border-b border-slate-700">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">FlyPig AI 電商增長神器 v2.0</h1>
        <p className="text-text-secondary mt-2">從市場洞察到前導頁生成，一站式 AI 解決方案。</p>
    </header>
);

interface InputFormProps {
    onAnalyze: (info: ProductInfo) => void;
    isLoading: boolean;
}
const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
    const [productName, setProductName] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [targetMarket, setTargetMarket] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !productDescription || !targetMarket) {
            alert("請填寫所有必要的文字欄位。");
            return;
        }
        let imagePayload: ProductInfo['image'];
        if (imageFile) {
            const base64 = await fileToBase64(imageFile);
            imagePayload = { base64, mimeType: imageFile.type };
        }
        onAnalyze({ name: productName, url: productUrl, description: productDescription, market: targetMarket, image: imagePayload });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setFileName(file.name);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
             <div className="space-y-2">
                <label htmlFor="productName" className="font-medium text-text-secondary">產品名稱</label>
                <input id="productName" type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="例如：人體工學辦公椅" required className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-brand-secondary focus:outline-none transition" />
            </div>
            <div className="space-y-2">
                <label htmlFor="productUrl" className="font-medium text-text-secondary">產品連結網址 (選填)</label>
                <input id="productUrl" type="url" value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="https://example.com/product-page" className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-brand-secondary focus:outline-none transition" />
            </div>
            <div className="space-y-2">
                <label htmlFor="productDescription" className="font-medium text-text-secondary">產品描述與特色</label>
                <textarea id="productDescription" value={productDescription} onChange={e => setProductDescription(e.target.value)} placeholder="在此貼上產品詳細資訊、規格與主要賣點..." required rows={6} className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-brand-secondary focus:outline-none transition resize-y" />
            </div>
            <div className="space-y-2">
                <label htmlFor="targetMarket" className="font-medium text-text-secondary">目標市場</label>
                <input id="targetMarket" type="text" value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="例如：台灣、美國加州或日本東京" required className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-brand-secondary focus:outline-none transition" />
            </div>
            <div className="space-y-2">
                <span className="font-medium text-text-secondary">產品圖片 (選填)</span>
                <label htmlFor="productImage" className="mt-1 group block cursor-pointer">
                    <div className={`flex justify-center items-center w-full min-h-[12rem] px-6 py-4 border-2 ${previewUrl ? 'border-slate-700' : 'border-dashed border-slate-600'} rounded-lg bg-slate-800/50 hover:border-brand-secondary transition-colors`}>
                        {previewUrl ? (
                            <div className="text-center relative">
                                <img src={previewUrl} alt="產品預覽" className="max-h-56 w-auto rounded-md shadow-lg" />
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                    <span className="text-white text-lg font-semibold">更換圖片</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0L22.5 12.75" /></svg>
                                <div className="mt-4 flex text-sm justify-center leading-6 text-slate-400">
                                    <p>
                                        <span className="font-semibold text-brand-secondary">點擊以上傳</span>
                                        <span className="pl-1">或拖曳圖片至此</span>
                                    </p>
                                </div>
                                <p className="text-xs leading-5 text-slate-500">PNG, JPG, GIF 等格式</p>
                            </div>
                        )}
                    </div>
                </label>
                {fileName && <p className="text-sm text-slate-400 mt-2 text-center">已選取檔案：{fileName}</p>}
                <input id="productImage" type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-secondary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center">
                 {isLoading ? '分析中...' : '生成市場分析報告'}
                 {isLoading && <div className="ml-3 border-t-transparent border-solid animate-spin rounded-full border-white border-2 h-5 w-5"></div>}
            </button>
        </form>
    );
};

const Loader: React.FC<{title: string; message: string; icon?: React.ReactNode}> = ({title, message, icon}) => (
    <div className="text-center py-20 space-y-4 animate-fade-in">
        <div className="animate-pulse-fast text-brand-secondary">
            {icon || <ChartBarIcon className="w-16 h-16 mx-auto" />}
        </div>
        <p className="text-xl font-semibold text-text-primary">{title}</p>
        <p className="text-text-secondary">{message}</p>
    </div>
);

const ErrorDisplay: React.FC<{ title: string; message: string; }> = ({ title, message }) => (
    <div className="text-center my-10 p-6 text-red-400 bg-red-900/20 border border-red-500 rounded-md max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p>{message}</p>
    </div>
);

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string, titleAction?: React.ReactNode }> = ({ title, icon, children, className = '', titleAction }) => (
    <div className={`bg-surface rounded-lg shadow-lg p-6 border border-slate-700 animate-slide-in-up ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <div className="p-2 bg-brand-primary/20 rounded-md mr-4 text-brand-secondary">{icon}</div>
                <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
            </div>
            {titleAction}
        </div>
        {children}
    </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-brand-dark text-brand-light text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">{children}</span>
);

const AnalysisResultDisplay: React.FC<{ result: AnalysisResult; productInfo: ProductInfo | null }> = ({ result, productInfo }) => {
    const { productCoreValue, marketPositioning, competitorAnalysis, buyerPersonas } = result;

    const handleDownload = () => {
        if (!productInfo) return;

        const generateMarkdownReport = () => {
            let report = `# ${productInfo.name} - 市場分析報告\n\n`;
            if (productInfo.url) {
                report += `**產品連結:** [${productInfo.url}](${productInfo.url})\n\n`;
            }

            report += `## 產品核心價值\n\n`;
            report += `### 主要特色\n${productCoreValue.mainFeatures.map(f => `- ${f}`).join('\n')}\n\n`;
            report += `### 核心優勢\n${productCoreValue.coreAdvantages.map(a => `- ${a}`).join('\n')}\n\n`;
            report += `### 解決的痛點\n${productCoreValue.painPointsSolved.map(p => `- ${p}`).join('\n')}\n\n`;

            report += `## 目標市場定位\n\n`;
            report += `**文化洞察:** ${marketPositioning.culturalInsights}\n\n`;
            report += `**消費習慣:** ${marketPositioning.consumerHabits}\n\n`;
            report += `**語言特性:** ${marketPositioning.languageNuances}\n\n`;
            report += `**搜尋趨勢:**\n${marketPositioning.searchTrends.map(t => `- \`${t}\``).join('\n')}\n\n`;

            report += `## 競爭對手分析\n\n`;
            competitorAnalysis.forEach(c => {
                report += `### ${c.brandName}\n`;
                report += `**行銷策略:** ${c.marketingStrategy}\n\n`;
                report += `**優勢:**\n${c.strengths.map(s => `  - ${s}`).join('\n')}\n\n`;
                report += `**劣勢:**\n${c.weaknesses.map(w => `  - ${w}`).join('\n')}\n\n`;
            });

            report += `## 潛在客戶描繪\n\n`;
            buyerPersonas.forEach(p => {
                report += `### ${p.personaName}\n`;
                report += `**基本資料:** ${p.demographics}\n\n`;
                report += `**興趣:** ${p.interests.join(', ')}\n\n`;
                report += `**痛點:**\n${p.painPoints.map(pp => `  - ${pp}`).join('\n')}\n\n`;
                report += `**他們會搜尋的關鍵字:**\n${p.keywords.map(k => `- \`${k}\``).join('\n')}\n\n`;
            });

            return report;
        };
        
        const markdownContent = generateMarkdownReport();
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `市場分析報告-${productInfo.name.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 py-8 animate-fade-in">
             <ResultCard 
                title="分析報告" 
                icon={<ChartBarIcon className="w-8 h-8"/>}
                titleAction={
                     <button 
                        onClick={handleDownload} 
                        disabled={!productInfo}
                        className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out text-sm inline-flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        下載報告
                    </button>
                }
             >
                <p className="text-text-secondary">以下是根據您提供的產品資訊生成的綜合市場分析報告。</p>
             </ResultCard>

            <ResultCard title="產品核心價值" icon={<LightBulbIcon className="w-8 h-8"/>}>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2 text-brand-light">主要特色</h4>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">{productCoreValue.mainFeatures.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg mb-2 text-brand-light">核心優勢</h4>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">{productCoreValue.coreAdvantages.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg mb-2 text-brand-light">解決的痛點</h4>
                        <ul className="list-disc list-inside space-y-1 text-text-secondary">{productCoreValue.painPointsSolved.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                </div>
            </ResultCard>
            <ResultCard title="目標市場定位" icon={<ChartBarIcon className="w-8 h-8" />}>
                 <div className="space-y-4">
                    <p><strong className="text-brand-light">文化洞察:</strong> <span className="text-text-secondary">{marketPositioning.culturalInsights}</span></p>
                    <p><strong className="text-brand-light">消費習慣:</strong> <span className="text-text-secondary">{marketPositioning.consumerHabits}</span></p>
                    <p><strong className="text-brand-light">語言特性:</strong> <span className="text-text-secondary">{marketPositioning.languageNuances}</span></p>
                    <div>
                        <h4 className="font-semibold text-lg mb-2 text-brand-light">搜尋趨勢</h4>
                        <div className="flex flex-wrap">{marketPositioning.searchTrends.map((trend, i) => <Tag key={i}>{trend}</Tag>)}</div>
                    </div>
                </div>
            </ResultCard>
            <ResultCard title="競爭對手分析" icon={<DocumentTextIcon className="w-8 h-8" />}>
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">{competitorAnalysis.map((c, i) => <CompetitorCard key={i} competitor={c} />)}</div>
            </ResultCard>
            <ResultCard title="潛在客戶描繪" icon={<UserGroupIcon className="w-8 h-8" />}>
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">{buyerPersonas.map((p, i) => <PersonaCard key={i} persona={p} />)}</div>
            </ResultCard>
        </div>
    );
};

const CompetitorCard: React.FC<{ competitor: Competitor }> = ({ competitor }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
        <h4 className="text-xl font-bold text-brand-secondary">{competitor.brandName}</h4>
        <p className="text-sm text-text-secondary italic">{competitor.marketingStrategy}</p>
        <div>
            <h5 className="font-semibold text-green-400">優勢</h5>
            <ul className="list-disc list-inside text-sm text-text-secondary">{competitor.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
        <div>
            <h5 className="font-semibold text-red-400">劣勢</h5>
            <ul className="list-disc list-inside text-sm text-text-secondary">{competitor.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
    </div>
);

const PersonaCard: React.FC<{ persona: BuyerPersona }> = ({ persona }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
        <h4 className="text-xl font-bold text-brand-secondary">{persona.personaName}</h4>
        <p className="text-sm font-medium bg-slate-700 p-2 rounded">{persona.demographics}</p>
        <div>
            <h5 className="font-semibold text-brand-light">興趣</h5>
            <p className="text-sm text-text-secondary">{persona.interests.join(', ')}</p>
        </div>
         <div>
            <h5 className="font-semibold text-brand-light">痛點</h5>
             <ul className="list-disc list-inside text-sm text-text-secondary">{persona.painPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div>
            <h5 className="font-semibold text-brand-light">他們會搜尋的關鍵字</h5>
            <div className="flex flex-wrap pt-2">{persona.keywords.map((keyword, i) => <Tag key={i}>{keyword}</Tag>)}</div>
        </div>
    </div>
);

interface ContentStrategyDisplayProps {
  strategy: ContentStrategy;
  productInfo: ProductInfo | null;
  analysisResult: AnalysisResult | null;
  onGenerateDocument: (topic: ContentTopic) => void;
  onGenerateGammaPrompt: (topic: ContentTopic) => void;
  onGenerateAIStudioPrompt: (topic: ContentTopic) => void;
  generatingTopic: string | null;
  generatedDocuments: Record<string, GammaGenerationResult>;
}

const ContentStrategyDisplay: React.FC<ContentStrategyDisplayProps> = ({ strategy, productInfo, analysisResult, onGenerateDocument, onGenerateGammaPrompt, onGenerateAIStudioPrompt, generatingTopic, generatedDocuments }) => {
    
    const handleDownload = () => {
        if (!productInfo) return;

        const generateMarkdownReport = () => {
            let report = `# ${productInfo.name} - 內容與互動策略\n\n`;
            
            report += "## 內容主題\n\n";
            strategy.contentTopics.forEach(topic => {
                report += `### 主題: ${topic.topic}\n`;
                report += `**描述:** ${topic.description}\n`;
                report += `**主要關鍵字:** \`${topic.focusKeyword}\`\n`;
                report += `**長尾關鍵字:** ${topic.longTailKeywords.map(k => `\`${k}\``).join(', ')}\n`;
                report += `**SEO 指導:**\n`;
                report += `  - **關鍵字密度:** ${topic.seoGuidance.keywordDensity}\n`;
                report += `  - **語意關鍵字:** ${topic.seoGuidance.semanticKeywords.join(', ')}\n`;
                report += `  - **內部連結策略:** ${topic.seoGuidance.linkingStrategy.internal}\n`;
                report += `  - **外部連結策略:** ${topic.seoGuidance.linkingStrategy.external}\n\n`;
            });

            report += "## 互動元素建議\n\n";
            strategy.interactiveElements.forEach(el => {
                report += `### ${el.type}\n`;
                report += `${el.description}\n\n`;
            });

            report += "## 行動呼籲 (CTA) 文案建議\n\n";
            strategy.ctaSuggestions.forEach(cta => {
                report += `- "${cta}"\n`;
            });

            return report;
        };
        
        const markdownContent = generateMarkdownReport();
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `內容策略-${productInfo.name.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
    <div className="w-full max-w-6xl mx-auto py-8">
        <ResultCard 
            title="內容與互動策略" 
            icon={<SparklesIcon className="w-8 h-8" />}
            titleAction={
                 <button 
                    onClick={handleDownload} 
                    disabled={!productInfo}
                    className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out text-sm inline-flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    下載策略
                </button>
            }
        >
            <div className="space-y-8">
                 <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-xl font-bold text-brand-light mb-3">第三步：生成前導頁與提示詞</h4>
                    <p className="text-text-secondary mb-4 text-sm">選擇下方一個主題，使用 Gamma API 自動生成文件，或生成適用於其他平台的提示詞。</p>
                </div>

                <div>
                    <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                        {strategy.contentTopics.map((topic, i) => 
                            <ContentTopicCard 
                                key={i} 
                                topic={topic}
                                onGenerate={() => onGenerateDocument(topic)}
                                onGenerateGammaPrompt={() => onGenerateGammaPrompt(topic)}
                                onGenerateAIStudioPrompt={() => onGenerateAIStudioPrompt(topic)}
                                isGenerating={generatingTopic === topic.topic}
                                generatedDocument={generatedDocuments[topic.topic]}
                            />
                        )}
                    </div>
                </div>
                 <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-slate-700">
                    <div>
                        <h4 className="text-xl font-bold text-brand-light mb-4">建議的互動元素</h4>
                        <div className="space-y-4">
                            {strategy.interactiveElements.map((el, i) => <InteractiveElementCard key={i} element={el} />)}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-brand-light mb-4">建議的行動呼籲 (CTA) 文案</h4>
                        <div className="space-y-4">
                            {strategy.ctaSuggestions.map((cta, i) => (
                                <blockquote key={i} className="border-l-4 border-brand-secondary bg-slate-800 p-4 rounded-r-lg">
                                    <p className="italic text-text-secondary">"{cta}"</p>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ResultCard>
    </div>
)};

interface ContentTopicCardProps {
    topic: ContentTopic;
    onGenerate: () => void;
    onGenerateGammaPrompt: () => void;
    onGenerateAIStudioPrompt: () => void;
    isGenerating: boolean;
    generatedDocument: GammaGenerationResult | undefined;
}

const ContentTopicCard: React.FC<ContentTopicCardProps> = ({ topic, onGenerate, onGenerateGammaPrompt, onGenerateAIStudioPrompt, isGenerating, generatedDocument }) => {
    const isGenerated = generatedDocument && generatedDocument.status === 'completed';

    return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3 flex flex-col justify-between">
        <div>
            <h5 className="text-lg font-bold text-brand-secondary">{topic.topic}</h5>
            <p className="text-sm text-text-secondary mt-2 mb-4">{topic.description}</p>
            
            <div className="space-y-3 text-sm border-t border-slate-700 pt-3">
                 <h6 className="font-semibold text-brand-light">SEO 指導方針</h6>
                 <p className="text-text-secondary"><strong className="text-slate-400">關鍵字密度:</strong> {topic.seoGuidance.keywordDensity}</p>
                 <div>
                    <strong className="text-slate-400">語意相關關鍵字:</strong>
                    <div className="flex flex-wrap pt-1">
                        {topic.seoGuidance.semanticKeywords.map((kw, i) => <Tag key={i}>{kw}</Tag>)}
                    </div>
                 </div>
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <button
                disabled={isGenerating || isGenerated}
                onClick={onGenerate}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center text-sm transition"
            >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                {isGenerating ? '生成中...' : (isGenerated ? '已生成' : '呼叫 Gamma API 生成文件')}
            </button>
            {isGenerated && (
                <a href={generatedDocument.gammaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 hover:text-green-300 inline-flex items-center justify-center w-full py-1 bg-green-900/20 rounded-md hover:bg-green-900/40 transition">
                    <EyeIcon className="w-4 h-4 mr-1" /> 查看已生成的文件
                </a>
            )}
             <button 
                onClick={onGenerateAIStudioPrompt} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center text-sm"
            >
                <SparklesIcon className="w-4 h-4 mr-2" />
                生成 AI Studio 提示詞
            </button>
            <button 
                onClick={onGenerateGammaPrompt} 
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center text-sm"
            >
                <CodeBracketIcon className="w-4 h-4 mr-2" />
                生成 Gamma 提示詞
            </button>
        </div>
    </div>
)};

const InteractiveElementCard: React.FC<{ element: InteractiveElement }> = ({ element }) => (
     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h5 className="font-bold text-brand-secondary">{element.type}</h5>
        <p className="text-sm text-text-secondary mt-1">{element.description}</p>
    </div>
);

const PromptModal: React.FC<{ prompt: string; onClose: () => void; title: string; }> = ({ prompt, onClose, title }) => {
    const [isCopied, setIsCopied] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleCopy = () => {
        if (textareaRef.current) {
            navigator.clipboard.writeText(textareaRef.current.value);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    
    // Close modal on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-lg shadow-xl w-full max-w-3xl border border-slate-700 flex flex-col max-h-full"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="p-5 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-5 overflow-y-auto">
                    <p className="text-text-secondary mb-4 text-sm">
                        請複製以下提示詞，並將其貼到對應的 AI 工具中以生成高品質內容。
                    </p>
                    <textarea 
                        ref={textareaRef}
                        readOnly 
                        value={prompt} 
                        className="w-full h-96 bg-slate-800 border border-slate-600 rounded-md p-3 text-sm text-slate-300 resize-none focus:ring-2 focus:ring-brand-secondary focus:outline-none" 
                    />
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end flex-shrink-0 bg-slate-800/50 rounded-b-lg">
                    <button 
                        onClick={handleCopy}
                        className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-5 rounded-md transition duration-300 ease-in-out inline-flex items-center"
                    >
                        {isCopied ? '已複製！' : '複製提示詞'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoModal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void; }> = ({ title, children, onClose }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-3xl border border-slate-700 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto text-text-secondary space-y-4">
                    {children}
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end flex-shrink-0 bg-slate-800/50 rounded-b-lg">
                    <button onClick={onClose} className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-5 rounded-md transition">
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

const FeatureIntroductionContent: React.FC = () => (
    <>
        <p className="mb-6">「FlyPig AI 電商增長神器」是一個從市場策略、內容規劃到技術實現的全流程加速器，旨在為您的電商事業節省大量時間與人力成本，實現更快速、更智慧的業務增長。</p>
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-brand-light mb-2">🚀 全方位市場深度透視</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>**智慧產品分析：** 只需提供產品資訊，AI 就能自動拆解其核心賣點，更可上傳圖片進行視覺分析。</li>
                    <li>**精準市場定位：** 深入剖析目標市場的文化、消費習慣和熱門趨勢。</li>
                    <li>**競爭格局掃描：** 自動識別主要競爭對手，並透視其行銷策略與優劣勢。</li>
                    <li>**清晰用戶畫像：** 為您描繪出最真實的潛在客戶樣貌 (Buyer Persona)，包含興趣、痛點與搜尋關鍵字。</li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-brand-light mb-2">✍️ 自動化內容與 SEO 策略規劃</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                     <li>**高價值內容主題生成：** AI 自動規劃最能吸引目標客群的內容主題。</li>
                     <li>**專業 SEO 佈局建議：** 為每個主題提供完整的 SEO 策略，協助網站獲得更高排名。</li>
                     <li>**高轉換率文案點子：** 提供多組具說服力的行動呼籲 (CTA) 文案。</li>
                </ul>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-brand-light mb-2">💻 一鍵生成行銷素材與程式碼</h3>
                 <ul className="list-disc list-inside space-y-1 pl-2">
                     <li>**Gamma API 自動化文件生成：** 直接串接 Gamma API，全自動生成圖文並茂的專業文件。</li>
                     <li>**AI Studio 前導頁程式碼生成：** 一鍵生成專業提示詞，讓 AI 程式碼助理（如 Google AI Studio）在幾秒內產出高品質的 React 前導頁程式碼。</li>
                     <li>**專業簡報/文件提示詞生成：** 為 Gamma 等 AI 簡報工具生成專用提示詞，快速創建專業簡報。</li>
                 </ul>
            </div>
        </div>
         <h3 className="text-lg font-semibold text-brand-light mt-8 mb-2">💡 如何使用</h3>
         <ol className="list-decimal list-inside space-y-2 pl-2">
             <li>**第一步：輸入產品資訊** - 填寫產品資料並點擊「生成市場分析報告」。</li>
             <li>**第二步：生成內容策略** - 報告產出後，點擊「生成內容策略」按鈕，AI 將規劃出詳細的內容與 SEO 策略。</li>
             <li>**第三步：生成前導頁與提示詞** - 從建議的內容主題中，點擊「呼叫 Gamma API 生成文件」即可全自動生成，或點擊「生成 AI Studio/Gamma 提示詞」來手動操作。</li>
         </ol>
    </>
);


// --- Main App Component ---

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
    const [formKey, setFormKey] = useState(0);

    const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
    const [strategyError, setStrategyError] = useState<string | null>(null);
    const [contentStrategy, setContentStrategy] = useState<ContentStrategy | null>(null);
    
    const [generatingTopic, setGeneratingTopic] = useState<string | null>(null);
    const [gammaError, setGammaError] = useState<string | null>(null);
    const [generatedDocuments, setGeneratedDocuments] = useState<Record<string, GammaGenerationResult>>({});
    const [gammaStatusMessage, setGammaStatusMessage] = useState<string | null>(null);
    
    const [promptModalContent, setPromptModalContent] = useState<string | null>(null);
    const [promptModalTitle, setPromptModalTitle] = useState('');
    
    const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);


    const pollingRefs = React.useRef<Record<string, boolean>>({});

    const handleAnalyze = useCallback(async (productInfo: ProductInfo) => {
        setProductInfo(productInfo);
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeMarket(productInfo);
            setAnalysisResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : '發生未知錯誤');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleGenerateStrategy = useCallback(async () => {
        if (!analysisResult) return;
        setIsGeneratingStrategy(true);
        setStrategyError(null);
        setContentStrategy(null);
        try {
            const result = await generateContentStrategy(analysisResult);
            setContentStrategy(result);
        } catch (err) {
            setStrategyError(err instanceof Error ? err.message : '發生未知錯誤');
            console.error(err);
        } finally {
            setIsGeneratingStrategy(false);
        }
    }, [analysisResult]);

    const handleGenerateGammaPrompt = useCallback((topic: ContentTopic) => {
        if (!productInfo || !analysisResult || !contentStrategy) return;

        const personaDetails = analysisResult.buyerPersonas.map(p => 
            `- **${p.personaName} (${p.demographics}):**\n   - **興趣:** ${p.interests.join(', ')}\n   - **痛點:** ${p.painPoints.join(', ')}\n   - **搜尋關鍵字:** ${p.keywords.join(', ')}`
        ).join('\n\n');

        const prompt = `**任務目標：** 根據以下詳細的市場分析，為產品「${productInfo.name}」創建一篇具吸引力、SEO 優化的專業前導頁文章。

---

**1. 文章主標題 (請直接使用)：**
"${topic.topic}"

---

**2. 核心推廣產品資訊：**
*   **產品名稱：** ${productInfo.name}
*   **產品描述：** ${productInfo.description}
*   **產品參考連結 (用於連結與內容參考)：** ${productInfo.url || '無'}

---

**3. 目標受眾深度剖析 (請以此為基礎進行撰寫)：**
您正在為以下這些人物撰寫，請直接解決他們的需求與痛點：
${personaDetails}

---

**4. 關鍵訊息與價值主張 (文章必須強調)：**
*   **主要特色：** ${analysisResult.productCoreValue.mainFeatures.join('; ')}
*   **核心優勢 (獨特賣點)：** ${analysisResult.productCoreValue.coreAdvantages.join('; ')}
*   **解決的痛點：** ${analysisResult.productCoreValue.painPointsSolved.join('; ')}

---

**5. 內容與 SEO 要求：**
*   **主要關鍵字 (Focus Keyword)：** \`${topic.focusKeyword}\` (請確保在標題、副標題和內文中自然地出現)
*   **長尾關鍵字 (Long-tail Keywords)：** 請在文章中自然地融入以下詞組：${topic.longTailKeywords.join(', ')}
*   **語意關鍵字 (Semantic Keywords)：** 為了建立主題權威，請使用相關概念詞：${topic.seoGuidance.semanticKeywords.join(', ')}
*   **建議文章結構：**
    1.  **開頭：** 使用一個引人入勝的引言，提及目標受眾的一個共同痛點，引起共鳴。
    2.  **發展：** 詳細闡述該問題，讓讀者感覺「你懂我」。
    3.  **解決方案：** 順勢引出「${productInfo.name}」作為理想的解決方案。自然地介紹其特色與優勢如何解決前述痛點。
    4.  **差異化：** (如果適用) 可以簡短提及與市場上其他方案（例如 ${analysisResult.competitorAnalysis.length > 0 ? analysisResult.competitorAnalysis[0].brandName : '傳統方法'}）的不同之處，突顯我們的獨特性。
    5.  **結尾：** 用一個強而有力的總結收尾，並搭配明確的行動呼籲 (CTA)。
*   **寫作語氣：** 針對 **${productInfo.market}** 市場，語氣應專業、具說服力，並對用戶的問題表示同理心。參考語言特性：${analysisResult.marketPositioning.languageNuances}。

---

**6. 行動呼籲 (Call to Action - CTA)：**
請在文章結尾處，自然地整合以下至少一個 CTA 文案：
${contentStrategy.ctaSuggestions.map(cta => `- "${cta}"`).join('\n')}

---

**7. 視覺要求：**
請選擇與產品、目標市場和受眾形象相關的高品質、專業庫存圖片。例如，展示符合人物誌形象的人們從產品中受益的場景。
`.trim();
        setPromptModalTitle('Gamma 生成提示詞');
        setPromptModalContent(prompt);

    }, [productInfo, analysisResult, contentStrategy]);

    const handleGenerateAIStudioPrompt = useCallback((topic: ContentTopic) => {
        if (!productInfo || !analysisResult || !contentStrategy) return;

        const prompt = `
You are an expert frontend developer specializing in creating high-conversion landing pages with React and Tailwind CSS.
Your task is to generate the complete React application code to be placed inside the \`<script type="module">\` tag of the provided HTML boilerplate.

**Boilerplate (DO NOT repeat this structure in your output, only provide the JavaScript code for the script tag):**
\`\`\`html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${productInfo.name} - Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client"
      }
    }
    </script>
</head>
<body class="bg-slate-900 text-slate-50">
    <div id="root"></div>
    <script type="module">
        // YOUR REACT CODE GOES HERE
    </script>
</body>
</html>
\`\`\`

**Instructions for the React Code:**
1.  **Imports:** Start your code by importing React and ReactDOM. This is mandatory.
    \`\`\`javascript
    import React, { useState, useEffect, useCallback } from 'react';
    import ReactDOM from 'react-dom/client';
    \`\`\`
2.  **Single Component Structure:** Create a main \`App\` component that contains the entire landing page structure.
3.  **Render the App:** Use \`ReactDOM.createRoot(document.getElementById('root')).render(<App />);\` to render your main component.
4.  **Design & UX:**
    *   The design must be modern, clean, professional, and fully responsive using Tailwind CSS.
    *   Use a color palette based on: Primary: #3b82f6 (blue-500), Surface: #1e293b (slate-800), Text: #f8fafc (slate-50). The body background is already set to a dark slate.
    *   Incorporate subtle animations (e.g., fade-in on scroll) for a premium feel.
    *   Use high-quality placeholder images from \`https://picsum.photos/seed/{seed}/width/height\` for visuals.
5.  **Content & SEO:**
    *   The main headline of the page must be: "${topic.topic}".
    *   The content should be persuasive and directly address the target audience's needs.
    *   Integrate the following SEO keywords naturally:
        *   **Focus Keyword:** ${topic.focusKeyword}
        *   **Long-tail Keywords:** ${topic.longTailKeywords.join(', ')}
        *   **Semantic Keywords:** ${topic.seoGuidance.semanticKeywords.join(', ')}
6.  **Page Structure:** The landing page should include the following sections in order:
    *   **Header:** With the product name and a primary CTA button.
    *   **Hero Section:** A compelling headline ("${topic.topic}"), a brief, engaging subheading, and a visually appealing image.
    *   **Pain Points Section:** A section titled "是否這就是您遇到的困擾？" or similar, listing the key pain points solved by the product: "${analysisResult.productCoreValue.painPointsSolved.join('", "')}". Speak directly to the user's problems.
    *   **Solution/Features Section:** Introduce "${productInfo.name}" as the solution. Detail its main features: "${analysisResult.productCoreValue.mainFeatures.join('", "')}". Highlight the core advantages: "${analysisResult.productCoreValue.coreAdvantages.join('", "')}".
    *   **Testimonials Section:** Create a section with 2-3 brief, fictional testimonials. Each testimonial should represent one of the buyer personas:
        ${analysisResult.buyerPersonas.map(p => `- ${p.personaName} (${p.demographics})`).join('\n        ')}
    *   **Final Call-to-Action (CTA) Section:** A strong, clear CTA section. Use one of these suggested CTA texts: "${contentStrategy.ctaSuggestions.join('" or "')}".

**START OF CONTEXT DATA:**
---
*   **Product Name:** ${productInfo.name}
*   **Product Description:** ${productInfo.description}
*   **Target Market:** ${productInfo.market}
*   **Headline/Topic:** ${topic.topic}
*   **Description for Topic:** ${topic.description}
---
**END OF CONTEXT DATA.**

Now, generate ONLY the complete JavaScript code for the React application to be placed inside the \`<script type="module">\` tag.
        `.trim();

        setPromptModalTitle('AI Studio 生成提示詞');
        setPromptModalContent(prompt);
    }, [productInfo, analysisResult, contentStrategy]);


    const handleGenerateDocument = useCallback(async (topic: ContentTopic) => {
        if (!productInfo || !analysisResult) return;
        
        const topicTitle = topic.topic;
        setGeneratingTopic(topicTitle);
        setGammaError(null);
        setGammaStatusMessage('正在向 Gamma 提交請求...');

        try {
            const { id } = await startGammaGeneration(productInfo, analysisResult, topic);
            pollingRefs.current[topicTitle] = true;
            
            const poll = async (retries = 24) => { // Poll for 2 minutes max (24 * 5s)
                if (!pollingRefs.current[topicTitle]) return; // Stop if cancelled
                if (retries <= 0) {
                    setGammaError('Gamma 文件生成超時。');
                    setGeneratingTopic(null);
                    setGammaStatusMessage(null);
                    delete pollingRefs.current[topicTitle];
                    return;
                }

                try {
                    const result = await checkGammaGenerationStatus(id);
                    setGammaStatusMessage(`生成狀態：${result.status}...`);

                    if (result.status === 'completed') {
                        setGeneratedDocuments(prev => ({...prev, [topicTitle]: result}));
                        setGeneratingTopic(null);
                        setGammaStatusMessage(null);
                        delete pollingRefs.current[topicTitle];
                    } else if (result.status === 'failed') {
                        setGammaError('Gamma 文件生成失敗。');
                        setGeneratingTopic(null);
                        setGammaStatusMessage(null);
                        delete pollingRefs.current[topicTitle];
                    } else {
                        setTimeout(() => poll(retries - 1), 5000); // Poll every 5 seconds
                    }
                } catch(err) {
                     setGammaError(err instanceof Error ? err.message : '輪詢 Gamma 狀態時發生錯誤。');
                     setGeneratingTopic(null);
                     setGammaStatusMessage(null);
                     delete pollingRefs.current[topicTitle];
                }
            };

            poll();

        } catch (err) {
            setGammaError(err instanceof Error ? err.message : '啟動 Gamma 文件生成時發生錯誤。');
            setGeneratingTopic(null);
            setGammaStatusMessage(null);
        }
    }, [productInfo, analysisResult]);


    const handleStartOver = () => {
        setIsLoading(false);
        setError(null);
        setAnalysisResult(null);
        setProductInfo(null);
        setIsGeneratingStrategy(false);
        setStrategyError(null);
        setContentStrategy(null);
        setGeneratingTopic(null);
        setGammaError(null);
        setGeneratedDocuments({});
        setGammaStatusMessage(null);
        setPromptModalContent(null);
        pollingRefs.current = {};
        setFormKey(prevKey => prevKey + 1);
    };
    
    const renderContent = () => {
        if (isLoading) return <Loader title="正在進行深度分析..." message="AI 正在分析市場、競爭對手與潛在客戶。" />;
        if (error) return <ErrorDisplay title="分析失敗" message={error} />;

        return (
            <>
                {analysisResult && <AnalysisResultDisplay result={analysisResult} productInfo={productInfo}/>}
                
                {analysisResult && !contentStrategy && !isGeneratingStrategy && (
                    <div className="w-full text-center mt-4">
                         <button onClick={handleGenerateStrategy} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center">
                             <SparklesIcon className="w-5 h-5 mr-2" />
                             第二步：生成內容策略
                         </button>
                    </div>
                )}
                
                {isGeneratingStrategy && <Loader title="正在構思內容點子..." message="AI 策略師正在規劃主題與互動要素。" icon={<SparklesIcon className="w-16 h-16 mx-auto"/>}/>}
                {strategyError && <ErrorDisplay title="策略生成失敗" message={strategyError} />}
                
                {contentStrategy && (
                    <ContentStrategyDisplay 
                        strategy={contentStrategy} 
                        productInfo={productInfo}
                        analysisResult={analysisResult}
                        onGenerateDocument={handleGenerateDocument} 
                        onGenerateGammaPrompt={handleGenerateGammaPrompt}
                        onGenerateAIStudioPrompt={handleGenerateAIStudioPrompt}
                        generatingTopic={generatingTopic}
                        generatedDocuments={generatedDocuments}
                    />
                )}
                
                {generatingTopic && <Loader title="正在生成 Gamma 前導頁..." message={gammaStatusMessage || "請稍候..."} icon={<DocumentTextIcon className="w-16 h-16 mx-auto"/>} />}
                {gammaError && <ErrorDisplay title="前導頁生成失敗" message={gammaError} />}
            </>
        )
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <main className="container mx-auto px-4 pb-12 relative">
                <button 
                    onClick={() => setIsIntroModalOpen(true)}
                    className="absolute top-6 right-4 sm:right-6 md:right-8 bg-slate-800 hover:bg-slate-700 text-text-secondary font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out text-sm z-10 border border-slate-600"
                >
                    功能簡介
                </button>
                <Header />
                <div className="mt-8">
                    {!analysisResult && !isLoading && !error && (
                        <InputForm key={formKey} onAnalyze={handleAnalyze} isLoading={isLoading} />
                    )}

                    {renderContent()}
                    
                    {(analysisResult || error) && !isLoading && !isGeneratingStrategy && (
                         <div className="w-full max-w-6xl mx-auto text-center mt-12">
                             <button onClick={handleStartOver} className="text-sm text-slate-400 hover:text-white transition duration-300 inline-flex items-center">
                                 <ArrowPathIcon className="w-4 h-4 mr-2" />
                                 開始新分析
                             </button>
                         </div>
                    )}
                </div>
            </main>
            {promptModalContent && (
                <PromptModal prompt={promptModalContent} title={promptModalTitle} onClose={() => setPromptModalContent(null)} />
            )}
            {isIntroModalOpen && (
                 <InfoModal title="🚀 FlyPig AI 電商增長神器：功能簡介" onClose={() => setIsIntroModalOpen(false)}>
                    <FeatureIntroductionContent />
                 </InfoModal>
            )}
        </div>
    );
}

export default App;