import http from './http'

export const aiService = {
  async enhanceMessage(message: string, style: string, customPrompt = ''): Promise<string> {
    const response = await http.post('/api/ai/enhance-message', { message, style, customPrompt }, { withCredentials: true })
    return response.data.message
  },

  async generateSmartReply(message: string, context: Record<string, unknown>[] = []): Promise<string[]> {
    const response = await http.post('/api/ai/smart-reply', { message, context }, { withCredentials: true })
    return response.data.suggestions || []
  },

  async analyzeConversation(messages: Record<string, unknown>[]): Promise<string> {
    const response = await http.post('/api/ai/analyze-conversation', { messages }, { withCredentials: true })
    return response.data.analysis
  },

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const response = await http.post('/api/ai/translate', { text, targetLanguage }, { withCredentials: true })
    return response.data.translatedText
  },
}

export default aiService
