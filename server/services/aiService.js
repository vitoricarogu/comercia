import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../config/supabase.js';

class AIService {
  constructor() {
    this.providers = {
      chatgpt: {
        baseURL: 'https://api.openai.com/v1',
        models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
      },
      gemini: {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro']
      },
      huggingface: {
        baseURL: 'https://api-inference.huggingface.co/models',
        models: ['microsoft/DialoGPT-large', 'facebook/blenderbot-400M-distill']
      }
    };
  }

  async sendMessage(provider, model, message, systemPrompt, temperature = 0.7, maxTokens = 1000, customApiKey = null) {
    try {
      switch (provider) {
        case 'chatgpt':
          return await this.callOpenAI(model, message, systemPrompt, temperature, maxTokens, customApiKey);
        case 'gemini':
          return await this.callGemini(model, message, systemPrompt, temperature, maxTokens, customApiKey);
        case 'huggingface':
          return await this.callHuggingFace(model, message, systemPrompt, temperature, maxTokens, customApiKey);
        default:
          throw new Error(`Provedor não suportado: ${provider}`);
      }
    } catch (error) {
      console.error(`Erro na IA ${provider}:`, error);
      throw error;
    }
  }

  async callOpenAI(model, message, systemPrompt, temperature, maxTokens, customApiKey = null) {
    const apiKey = customApiKey || await db.globalConfigs.get('openai_api_key');
    
    if (!apiKey) {
      throw new Error('OpenAI API Key não configurada. Configure no painel administrativo.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt || 'Você é um assistente útil.' },
          { role: 'user', content: message }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Erro na API OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callGemini(model, message, systemPrompt, temperature, maxTokens, customApiKey = null) {
    const apiKey = customApiKey || await db.globalConfigs.get('gemini_api_key');
    
    if (!apiKey) {
      throw new Error('Google Gemini API Key não configurada. Configure no painel administrativo.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

    const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;
    
    const result = await geminiModel.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    });

    const response = await result.response;
    return response.text();
  }

  async callHuggingFace(model, message, systemPrompt, temperature, maxTokens, customApiKey = null) {
    const apiKey = customApiKey || await db.globalConfigs.get('huggingface_api_key');
    
    if (!apiKey) {
      throw new Error('Hugging Face API Key não configurada. Configure no painel administrativo.');
    }

    const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}\nAssistant:` : `User: ${message}\nAssistant:`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${model || 'microsoft/DialoGPT-large'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: maxTokens,
          temperature,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erro na API Hugging Face');
    }

    const data = await response.json();
    const result = data[0]?.generated_text || data.generated_text || '';
    return result.replace(prompt, '').trim();
  }

  // Construir prompt do agente
  buildAgentPrompt(agent, basePrompt) {
    let fullPrompt = basePrompt || 'Você é um assistente útil.';
    
    if (agent.description) {
      fullPrompt += `\n\nDescrição: ${agent.description}`;
    }
    
    if (agent.objective) {
      fullPrompt += `\n\nObjetivo: ${agent.objective}`;
    }
    
    if (agent.personality) {
      const personalityMap = {
        'professional': 'Mantenha um tom profissional e formal em suas respostas.',
        'friendly': 'Seja amigável, caloroso e acolhedor em suas interações.',
        'casual': 'Use um tom descontraído e informal, como uma conversa entre amigos.',
        'formal': 'Mantenha extrema formalidade e cortesia em todas as respostas.'
      };
      
      const personalityInstruction = personalityMap[agent.personality] || personalityMap['professional'];
      fullPrompt += `\n\nPersonalidade: ${personalityInstruction}`;
    }
    
    return fullPrompt;
  }

  async generateWithRAG(userId, provider, model, message, agent, temperature, maxTokens, customApiKey = null) {
    try {
      // Construir prompt completo com configurações do agente
      const enhancedPrompt = this.buildAgentPrompt(agent, agent.system_prompt);

      return await this.sendMessage(provider, model, message, enhancedPrompt, temperature, maxTokens, customApiKey);
    } catch (error) {
      console.error('Erro no RAG:', error);
      // Fallback para resposta sem RAG
      const fallbackPrompt = this.buildAgentPrompt(agent, agent.system_prompt);
      return await this.sendMessage(provider, model, message, fallbackPrompt, temperature, maxTokens, customApiKey);
    }
  }
}

export default new AIService();