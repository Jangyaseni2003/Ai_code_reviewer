const aiService = require('../services/ai.services');

exports.getReview = async (req, res) => {
    try {
        console.log('🔍 Processing review request...');
        console.log('📝 Request headers:', req.headers);
        console.log('📝 Request body keys:', Object.keys(req.body));
        
        const { prompt } = req.body;
        
        // Validate input
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            console.log('❌ Invalid input:', { prompt: prompt ? typeof prompt : 'undefined' });
            return res.status(400).json({ 
                error: 'Code prompt is required and must be a non-empty string',
                review: null 
            });
        }

        // Check prompt length
        if (prompt.length > 10000) {
            console.log('❌ Prompt too long:', prompt.length, 'characters');
            return res.status(400).json({
                error: 'Code prompt is too long. Maximum 10,000 characters allowed.',
                review: null
            });
        }
        
        console.log(`✅ Processing review request for code (${prompt.length} characters)`);
        
        const result = await aiService.generateContent(prompt);
        
        if (!result) {
            throw new Error('No response generated from AI service');
        }
        
        console.log('✅ Review generated successfully, length:', result.length, 'characters');
        res.json({ 
            review: result,
            timestamp: new Date().toISOString(),
            promptLength: prompt.length,
            reviewLength: result.length
        });
        
    } catch (error) {
        console.error('❌ Controller error:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Handle specific error types
        if (error.message.includes('API key') || error.message.includes('GOOGLE_GEMINI_API_KEY')) {
            return res.status(500).json({ 
                error: 'AI service configuration error. Please check API key in .env file.',
                review: null 
            });
        }
        
        if (error.message.includes('rate limit')) {
            return res.status(429).json({ 
                error: 'AI service rate limit exceeded. Please try again later.',
                review: null 
            });
        }
        
        if (error.message.includes('timeout')) {
            return res.status(408).json({ 
                error: 'AI service request timeout. Please try again.',
                review: null 
            });
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
            return res.status(503).json({ 
                error: 'AI service network error. Please check your internet connection.',
                review: null 
            });
        }
        
        res.status(500).json({ 
            error: 'Error generating AI response',
            details: error.message,
            review: null 
        });
    }
};
    