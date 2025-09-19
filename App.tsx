import React, { useState, useCallback } from 'react';
import { analyzeMarket, generateContentStrategy, generateWebpageContent } from './services/geminiService';
import type { AnalysisResult, BuyerPersona, Competitor, ProductInfo, ContentStrategy, ContentTopic, InteractiveElement, WebpageContent, SeoAnalysis } from './types';

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
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const GlobeAltIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.504 0 1.002-.023 1.493-.067M12 21c-.504 0-1.002-.023-1.493-.067M12 3c.504 0 1.002.023 1.493.067M12 3c-.504 0-1.002.023-1.493-.067M12 3a9.004 9.004 0 0 0-8.716 6.747M12 3a9.004 9.004 0 0 1 8.716 6.747m0 0H20.75m-17.5 0H3.25m17.5 0a9.004 9.004 0 0 0-8.716-6.747M3.25 0a9.004 9.004 0 0 1 8.716-6.747m0 0V3m0 18V12m0-9c.504 0 1.002.023 1.493.067M12 3c-.504 0-1.002.023-1.493-.067" /></svg>);
const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);


// --- UI Components ---

const Header: React.FC = () => (
    <header className="w-full text-center py-6 border-b border-slate-700">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">FlyPig AI 市場分析 PRO</h1>
        <p className="text-text-secondary mt-2">您的 AI 驅動專家，提供全面的市場與 SEO 分析。</p>
    </header>
);

interface InputFormProps {
    onAnalyze: (info: ProductInfo) => void;
    isLoading: boolean;
}
const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [targetMarket, setTargetMarket] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !productDescription || !targetMarket) {
            alert("請填寫所有文字欄位。");
            return;
        }
        let imagePayload: ProductInfo['image'];
        if (imageFile) {
            const base64 = await fileToBase64(imageFile);
            imagePayload = { base64, mimeType: imageFile.type };
        }
        onAnalyze({ name: productName, description: productDescription, market: targetMarket, image: imagePayload });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setFileName(file.name);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
             <div className="space-y-2">
                <label htmlFor="productName" className="font-medium text-text-secondary">產品名稱</label>
                <input id="productName" type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="例如：人體工學辦公椅" required className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 focus:ring-2 focus:ring-brand-secondary focus:outline-none transition" />
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
                 <label htmlFor="productImage" className="font-medium text-text-secondary">產品圖片 (選填)</label>
                 <label htmlFor="productImage" className="bg-slate-800 border border-slate-700 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                     <span className="text-sm text-slate-400">{fileName || "點擊以上傳圖片"}</span>
                 </label>
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
                {/* FIX: The ResultCard component requires a `children` prop. A comment-only child can be ignored by the type-checker, causing an error. Added a descriptive paragraph as a valid child. */}
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
  onGenerateWebpage: (topic: ContentTopic) => void;
  productUrl: string;
  setProductUrl: (url: string) => void;
  generatingTopic: string | null;
  generatedWebpages: Record<string, WebpageContent>;
  onViewWebpage: (topicTitle: string) => void;
}

const ContentStrategyDisplay: React.FC<ContentStrategyDisplayProps> = ({ strategy, productInfo, onGenerateWebpage, productUrl, setProductUrl, generatingTopic, generatedWebpages, onViewWebpage }) => {
    
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
                    <h4 className="text-xl font-bold text-brand-light mb-3">第三步：生成前導頁 (Landing Page)</h4>
                    <p className="text-text-secondary mb-4 text-sm">請提供產品的商店網址以用於「行動呼籲 (CTA)」連結，然後選擇下方一個主題來生成完整的前導頁。</p>
                     <div className="space-y-2">
                        <label htmlFor="productUrl" className="font-medium text-text-secondary">產品商店網址</label>
                        <input id="productUrl" type="url" value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="https://example.com/your-product" required className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 focus:ring-2 focus:ring-brand-secondary focus:outline-none transition" />
                    </div>
                </div>

                <div>
                    <h4 className="text-xl font-bold text-brand-light mb-4">選擇一個主題以生成內容</h4>
                    <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                        {strategy.contentTopics.map((topic, i) => 
                            <ContentTopicCard 
                                key={i} 
                                topic={topic}
                                onGenerate={() => onGenerateWebpage(topic)}
                                onView={() => onViewWebpage(topic.topic)}
                                isEnabled={!!productUrl}
                                isGenerating={generatingTopic === topic.topic}
                                isGenerated={!!generatedWebpages[topic.topic]}
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
    onView: () => void;
    isEnabled: boolean;
    isGenerating: boolean;
    isGenerated: boolean;
}

const ContentTopicCard: React.FC<ContentTopicCardProps> = ({ topic, onGenerate, onView, isEnabled, isGenerating, isGenerated }) => (
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
                 <p className="text-text-secondary"><strong className="text-slate-400">內部連結:</strong> {topic.seoGuidance.linkingStrategy.internal}</p>
                 <p className="text-text-secondary"><strong className="text-slate-400">外部連結:</strong> {topic.seoGuidance.linkingStrategy.external}</p>
            </div>
        </div>
        {isGenerated ? (
             <button 
                onClick={onView}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center text-sm"
            >
                <EyeIcon className="w-4 h-4 mr-2" />
                檢視頁面
            </button>
        ) : (
            <button 
                onClick={onGenerate} 
                disabled={!isEnabled || isGenerating}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
                {isGenerating ? (
                    <>
                        <div className="mr-2 border-t-transparent border-solid animate-spin rounded-full border-white border-2 h-4 w-4"></div>
                        生成中...
                    </>
                ) : (
                    <>
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        生成前導頁
                    </>
                )}
            </button>
        )}
    </div>
);

const InteractiveElementCard: React.FC<{ element: InteractiveElement }> = ({ element }) => (
     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h5 className="font-bold text-brand-secondary">{element.type}</h5>
        <p className="text-sm text-text-secondary mt-1">{element.description}</p>
    </div>
);


const WebpageContentDisplay: React.FC<{ content: WebpageContent }> = ({ content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content.htmlContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto py-8 space-y-8">
            <ResultCard title="生成的前導頁 & SEO 分析" icon={<GlobeAltIcon className="w-8 h-8" />}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 className="text-lg font-semibold text-brand-light">頁面標題</h4>
                        <p className="text-text-primary mt-1">{content.title}</p>
                    </div>
                     <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h4 className="text-lg font-semibold text-brand-light">建議的網址</h4>
                        <p className="text-text-primary mt-1 font-mono bg-slate-900 p-2 rounded-md inline-block">yourwebsite.com<span className="text-brand-secondary">{content.suggestedUrl}</span></p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 lg:col-span-3">
                        <h4 className="text-lg font-semibold text-brand-light">Meta 描述</h4>
                        <p className="text-text-secondary mt-1">{content.metaDescription}</p>
                    </div>
                </div>
            </ResultCard>

             <ResultCard title="SEO 實踐分析" icon={<CheckIcon className="w-8 h-8" />}>
                 <p className="text-text-secondary mb-4">{content.seoAnalysis.summary}</p>
                 <ul className="space-y-2">
                     {content.seoAnalysis.checklist.map((item, i) => (
                         <li key={i} className={`flex items-center p-2 rounded-md ${item.passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                             {item.passed ? <CheckIcon className="w-5 h-5 mr-3 text-green-400" /> : <XCircleIcon className="w-5 h-5 mr-3 text-red-400" />}
                             <span className={item.passed ? 'text-green-300' : 'text-red-300'}>{item.item}</span>
                         </li>
                     ))}
                 </ul>
            </ResultCard>

            <div>
                <div className="flex justify-between items-center mb-4">
                     <h4 className="text-2xl font-bold text-text-primary">內容預覽 & HTML</h4>
                     <button onClick={handleCopy} className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out text-sm inline-flex items-center">
                         {copied ? <><CheckIcon className="w-5 h-5 mr-2" /> 已複製!</> : <><ClipboardIcon className="w-5 h-5 mr-2" /> 複製 HTML</>}
                     </button>
                </div>
                <div className="bg-white text-slate-800 p-2 rounded-lg shadow-2xl">
                    <div dangerouslySetInnerHTML={{ __html: content.htmlContent }} />
                </div>
            </div>

        </div>
    )
}

// --- Main App Component ---

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

    const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
    const [strategyError, setStrategyError] = useState<string | null>(null);
    const [contentStrategy, setContentStrategy] = useState<ContentStrategy | null>(null);
    
    const [generatingTopic, setGeneratingTopic] = useState<string | null>(null);
    const [webpageError, setWebpageError] = useState<string | null>(null);
    const [generatedWebpages, setGeneratedWebpages] = useState<Record<string, WebpageContent>>({});
    const [activeWebpageTopic, setActiveWebpageTopic] = useState<string | null>(null);
    const [productUrl, setProductUrl] = useState('');

    const handleAnalyze = useCallback(async (productInfo: ProductInfo) => {
        handleStartOver(); // Reset everything before starting a new analysis
        setProductInfo(productInfo);
        setIsLoading(true);
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

     const handleGenerateWebpage = useCallback(async (topic: ContentTopic) => {
        if (!contentStrategy) return;
        setGeneratingTopic(topic.topic);
        setWebpageError(null);
        setActiveWebpageTopic(null); // Hide previous page while generating
        try {
            const result = await generateWebpageContent(topic, contentStrategy.interactiveElements, productUrl);
            setGeneratedWebpages(prev => ({...prev, [topic.topic]: result}));
            setActiveWebpageTopic(topic.topic);
        } catch (err) {
            setWebpageError(err instanceof Error ? err.message : '發生未知錯誤');
            console.error(err);
        } finally {
            setGeneratingTopic(null);
        }
    }, [contentStrategy, productUrl]);

    const handleStartOver = () => {
        setIsLoading(false);
        setError(null);
        setAnalysisResult(null);
        setProductInfo(null);
        setIsGeneratingStrategy(false);
        setStrategyError(null);
        setContentStrategy(null);
        setGeneratingTopic(null);
        setWebpageError(null);
        setGeneratedWebpages({});
        setActiveWebpageTopic(null);
        setProductUrl('');
    };
    
    const renderContent = () => {
        if (isLoading) return <Loader title="正在進行深度分析..." message="AI 正在分析市場、競爭對手與潛在客戶。" />;
        if (error) return <ErrorDisplay title="分析失敗" message={error} />;
        
        const activeWebpage = activeWebpageTopic ? generatedWebpages[activeWebpageTopic] : null;

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
                        onGenerateWebpage={handleGenerateWebpage} 
                        productUrl={productUrl} 
                        setProductUrl={setProductUrl} 
                        generatingTopic={generatingTopic}
                        generatedWebpages={generatedWebpages}
                        onViewWebpage={setActiveWebpageTopic}
                    />
                )}
                
                {generatingTopic && <Loader title="正在撰寫前導頁..." message="AI 正在產出圖文並茂的 SEO 優化頁面。" icon={<DocumentTextIcon className="w-16 h-16 mx-auto"/>} />}
                {webpageError && <ErrorDisplay title="網頁生成失敗" message={webpageError} />}

                {activeWebpage && <WebpageContentDisplay content={activeWebpage} />}
            </>
        )
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <main className="container mx-auto px-4 pb-12">
                <Header />
                <div className="mt-8">
                    {!analysisResult && !isLoading && !error && (
                        <InputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
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
        </div>
    );
}

export default App;
