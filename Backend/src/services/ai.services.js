const fetch = require('node-fetch');

async function generateContent(prompt) {
  try {
    console.log('🚀 Starting Gemini API request...');
    
    // Check if API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('❌ GOOGLE_GEMINI_API_KEY is not configured in environment variables');
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured in environment variables');
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY.trim();
    if (apiKey.length < 10) {
      console.error('❌ API key seems too short:', apiKey.length, 'characters');
      throw new Error('Invalid API key format');
    }

    console.log('✅ API key configured, length:', apiKey.length, 'characters');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout after 30 seconds');
      controller.abort();
    }, 30000); // 30 second timeout

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{
            text: `You are an expert AI code reviewer specializing in development best practices. 
Your job is to carefully review the provided code and respond in the following **structured format**:

---
## ❌ Problems Found:
- Clearly list each problem, starting with ❌.  
- Mention **where** it occurs (line number, function, variable, etc.).  
- Explain **why** it's a problem (impact or potential bug).  

## 💡 Suggestions for Improvement:
- Give actionable suggestions for fixing the above problems.  
- Suggest **better coding practices** for maintainability.  

## ⚡ Optimized Code:
\`\`\`javascript
// Provide fully optimized, clean, and readable code here.
\`\`\`

## 📝 Additional Notes:
- Include tips, alternative approaches, or extra improvements the developer could consider.
---

**Rules for Output:**
- Always use Markdown formatting.
- Always include the above 4 sections.
- Keep explanations clear but detailed enough for a junior developer to understand.
- If no problems are found, still provide the structure with "No major problems found" in the Problems section.

Now please review this code:

${prompt}`
          }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40
      }
    };

    console.log('📤 Sending request to Gemini API...');
    console.log('📝 Request payload size:', JSON.stringify(requestBody).length, 'characters');

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('📡 Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error Response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key for Google Gemini service');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded for Google Gemini service');
      } else if (response.status >= 500) {
        throw new Error('Google Gemini service is temporarily unavailable');
      } else {
        throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Gemini API response received');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Unexpected API response structure:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response structure from Gemini API');
    }
    
    const reviewText = data.candidates[0].content.parts[0].text;
    
    if (!reviewText || reviewText.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }
    
    console.log('✅ Review text extracted, length:', reviewText.length, 'characters');
    return reviewText;
    
  } catch (error) {
    console.error("❌ Error in generateContent:", error);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: AI service took too long to respond');
    }
    
    if (error.message.includes('fetch')) {
      throw new Error('Network error: Cannot connect to AI service');
    }
    
    // Re-throw the error with context
    throw error;
  }
}

module.exports = { generateContent };
