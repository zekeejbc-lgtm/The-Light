
// REMOVED EXTERNAL API DEPENDENCIES FOR ZERO COST OPERATION

export const chatWithGemini = async (message: string, history: { role: string, parts: { text: string }[] }[], context: string) => {
  // Simulate thinking delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const lowerMsg = message.toLowerCase().trim();
  
  // 1. Basic Greetings
  if (lowerMsg.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! I am Lumen, your offline archivist. I can help you find information contained within The Light's published articles. What are you looking for?";
  }

  // 2. Parse Context (The Knowledge Base)
  // The context string contains articles formatted with metadata. We'll do a simple search.
  const articles = context.split('---').filter(a => a.trim().length > 0);
  
  // Find articles that contain the keywords
  const matchingArticles = articles.filter(articleSection => {
      const contentLine = articleSection.toLowerCase();
      // simple inclusion check
      return contentLine.includes(lowerMsg);
  });

  if (matchingArticles.length > 0) {
      // Extract titles from matches
      const titles = matchingArticles.map(a => {
          const titleMatch = a.match(/TITLE: (.*)/);
          return titleMatch ? titleMatch[1] : 'Unknown Article';
      }).slice(0, 3); // Limit to 3

      return `I found information related to "${message}" in the following articles:\n\n- ${titles.join('\n- ')}\n\nYou can read these articles to learn more. Is there a specific detail you need?`;
  }

  // 3. Fallback
  return "I searched The Light's archives but couldn't find any articles matching your query. Please try searching for specific topics like 'sports', 'campus', or 'science'.";
};

export const researchTopic = async (query: string) => {
  // Mock response to replace paid API call
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    text: `### Offline Mode Active\n\nExternal AI research tools are currently disabled to keep this service free of cost.\n\n**Topic:** ${query}\n\nTo research this topic, please utilize:\n1. The School Library\n2. Verified academic databases\n3. Interviews with subject matter experts`,
    groundingChunks: []
  };
};
