// Gemini Pro API Configuration
// To use this, you'll need to:
// 1. Get a Gemini API key from Google AI Studio (https://makersuite.google.com/app/apikey)
// 2. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key
// 3. Uncomment the API key line below

const GEMINI_CONFIG = {
    // apiKey: 'YOUR_GEMINI_API_KEY_HERE', // Uncomment and add your API key
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `You are a healthcare analytics AI assistant helping analyze patient journey data.
    You have access to detailed claims data, market access information, treatment patterns, and patient outcomes.

    Current Analysis Context:
    - Focus on providing insights about market access barriers
    - Explain payer coverage patterns and prior authorization requirements
    - Analyze treatment pathways and patient flow
    - Identify care gaps and improvement opportunities
    - Provide actionable recommendations based on data

    Keep responses concise, data-driven, and business-focused. Always reference specific metrics when available.`
};

// Healthcare-specific prompt context for better responses
const HEALTHCARE_CONTEXT = {
    'market-access': {
        context: 'Market Access Analysis for healthcare indication',
        keywords: ['payer', 'formulary', 'prior authorization', 'coverage', 'access barriers', 'reimbursement'],
        metrics: ['coverage percentage', 'authorization approval rate', 'time to approval', 'step therapy requirements']
    },
    'referral-pattern': {
        context: 'Referral Pattern Analysis showing provider networks and patient flow',
        keywords: ['referral', 'provider', 'specialist', 'primary care', 'network', 'geographic'],
        metrics: ['referral rate', 'time to specialist', 'provider concentration', 'leakage rate']
    },
    'care-gap': {
        context: 'Care Gap Analysis identifying opportunities in patient care',
        keywords: ['care gap', 'unmet need', 'screening', 'diagnosis delay', 'treatment delay'],
        metrics: ['gap percentage', 'time to diagnosis', 'screening rate', 'treatment uptake']
    },
    'treatment-pathway': {
        context: 'Treatment Pathway Analysis mapping patient treatment journeys',
        keywords: ['treatment line', 'switching', 'sequencing', 'duration', 'persistence', 'adherence'],
        metrics: ['line progression', 'switching rate', 'treatment duration', 'persistence rate']
    },
    'market-structure': {
        context: 'Market Structure Analysis of competitive landscape',
        keywords: ['market share', 'competition', 'competitive position', 'brand performance'],
        metrics: ['market share percentage', 'growth rate', 'new patient share', 'volume trends']
    },
    'persistency': {
        context: 'Treatment Persistency Analysis evaluating patient adherence',
        keywords: ['persistence', 'adherence', 'discontinuation', 'compliance', 'refill'],
        metrics: ['persistence rate', 'discontinuation rate', 'days on therapy', 'refill rate']
    }
};

class GeminiAPI {
    constructor() {
        this.apiKey = GEMINI_CONFIG.apiKey;
        this.apiUrl = GEMINI_CONFIG.apiUrl;
        this.currentContext = this.getCurrentAnalysisContext();
    }

    getCurrentAnalysisContext() {
        const analysisType = sessionStorage.getItem('selectedAnalysisType');
        const indication = sessionStorage.getItem('indicationDisplayName');
        return {
            analysisType,
            indication,
            contextData: HEALTHCARE_CONTEXT[analysisType] || HEALTHCARE_CONTEXT['market-access']
        };
    }

    async generateResponse(userMessage) {
        // If no API key is configured, return a mock response
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.log('Gemini API key not configured, using mock response');
            return this.generateMockResponse(userMessage);
        }

        try {
            const enhancedPrompt = this.buildEnhancedPrompt(userMessage);

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhancedPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: GEMINI_CONFIG.temperature,
                        maxOutputTokens: GEMINI_CONFIG.maxTokens,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return this.generateMockResponse(userMessage);
        }
    }

    buildEnhancedPrompt(userMessage) {
        const { indication, analysisType, contextData } = this.currentContext;

        return `${GEMINI_CONFIG.systemPrompt}

Current Analysis: ${contextData.context} for ${indication}
Analysis Type: ${analysisType}
Key Focus Areas: ${contextData.keywords.join(', ')}
Relevant Metrics: ${contextData.metrics.join(', ')}

User Question: ${userMessage}

Please provide a focused, data-driven response that:
1. Addresses the specific question in the context of ${indication} ${analysisType}
2. References relevant healthcare analytics concepts
3. Provides actionable insights when possible
4. Keeps the response concise and business-focused`;
    }

    generateMockResponse(userMessage) {
        const { indication, analysisType } = this.currentContext;
        const lowerMessage = userMessage.toLowerCase();

        // Enhanced mock responses based on current analysis context
        const contextResponses = {
            'market-access': {
                'payer': `For ${indication}, our analysis shows 45.2% commercial coverage with Medicare representing 32.8% of patients. Prior authorization requirements affect 78% of commercial plans, with an average approval time of 12 days. Key barriers include step therapy protocols and specialty pharmacy requirements.`,
                'coverage': `Coverage analysis for ${indication} reveals strong formulary positioning across tier 2-3 placement. However, 23% of eligible patients face access barriers, primarily due to prior authorization delays and high copayment structures in certain markets.`,
                'cost': `Cost analysis indicates average monthly treatment costs of $12,500 for ${indication}. Patient out-of-pocket costs vary significantly by payer, with commercial patients averaging $150/month vs Medicare patients at $85/month after coverage determinations.`,
                'default': `The market access landscape for ${indication} shows strong overall coverage but with notable barriers in prior authorization processes. Would you like me to dive deeper into specific payer policies or geographic variations?`
            },
            'treatment-pathway': {
                'pathway': `Treatment pathway analysis for ${indication} shows 2,847 patients initiating first-line therapy, with 64% progressing to second-line treatment. Average time between lines is 8.3 months, with switching primarily driven by progression (67%) rather than tolerability (33%).`,
                'switching': `Switching patterns in ${indication} reveal interesting trends: 35% of patients switch within the same class, while 65% move to different mechanism classes. Geographic variations show higher switching rates in academic medical centers vs community practices.`,
                'duration': `Treatment duration analysis shows median time on therapy of 14.2 months for ${indication}. First-line persistence at 12 months is 78%, significantly above industry benchmarks. Key factors influencing duration include baseline disease characteristics and comorbidity burden.`,
                'default': `The treatment pathway for ${indication} demonstrates strong persistence rates with logical progression patterns. What specific aspect of the patient journey would you like me to analyze further?`
            },
            'persistency': {
                'adherence': `Persistency analysis for ${indication} shows 78% of patients remaining on therapy at 12 months, which exceeds industry benchmarks by 15%. Key drivers of discontinuation include disease progression (45%), adverse events (28%), and access issues (17%).`,
                'discontinuation': `Discontinuation patterns in ${indication} show early drop-off is primarily due to tolerability (first 3 months), while later discontinuation is driven by efficacy concerns. Regional variations suggest provider education opportunities in certain markets.`,
                'compliance': `Treatment compliance for ${indication} is strong overall, with 85% of patients showing >80% medication possession ratio. Specialty pharmacy programs and patient support services contribute significantly to these positive persistence metrics.`,
                'default': `Persistency metrics for ${indication} are performing well above benchmarks. The data suggests effective patient support programs and appropriate patient selection. What specific persistence factors would you like to explore?`
            }
        };

        const currentResponses = contextResponses[analysisType] || contextResponses['market-access'];

        // Find best matching response
        for (const [key, response] of Object.entries(currentResponses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                return response;
            }
        }

        return currentResponses.default;
    }
}

// Export for use in dashboard
window.GeminiAPI = GeminiAPI;