// A4F AI Service - Using fetch for API calls
const A4F_API_KEY = process.env.A4F_API_KEY || "ddc-a4f-887ebfbc7b5d4b2e9a4faa11647ec9b5";
const A4F_CHAT_COMPLETIONS_URL = "https://api.a4f.co/v1/chat/completions";

// Primary model with backups
const AI_MODELS = [
  "provider-6/gpt-oss-20b",
  "provider-6/llama-4-scout-17b-16e-instruct",
  "provider-2/deepseek-v3.1-tee"
];

const callA4FAPI = async (messages, modelIndex = 0) => {
  if (modelIndex >= AI_MODELS.length) {
    throw new Error('All AI models failed. Please try again later.');
  }

  const model = AI_MODELS[modelIndex];
  
  try {
    const response = await fetch(A4F_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${A4F_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Failed to parse error" } }));
      console.error(`A4F API Error (${model}):`, response.status, errorData);
      
      // Try backup model
      if (modelIndex < AI_MODELS.length - 1) {
        console.log(`Trying backup model: ${AI_MODELS[modelIndex + 1]}`);
        return callA4FAPI(messages, modelIndex + 1);
      }
      
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error('No response content from AI');
    }
  } catch (error) {
    console.error(`A4F API Error (${model}):`, error.message);
    
    // Try backup model on network errors too
    if (modelIndex < AI_MODELS.length - 1) {
      console.log(`Trying backup model: ${AI_MODELS[modelIndex + 1]}`);
      return callA4FAPI(messages, modelIndex + 1);
    }
    
    throw error;
  }
};

const getAIResponse = async (userMessage, roomContext) => {
  try {
    // Build detailed context from room data
    let hotelContext = "";
    if (roomContext && roomContext.rooms && roomContext.rooms.length > 0) {
      hotelContext = roomContext.rooms.map(r => 
        `Room ${r.number} is a ${r.type} for $${r.currentPrice || r.price}/night. ` +
        `Features: ${r.amenities ? r.amenities.join(", ") : 'Standard amenities'}. ` +
        `${r.description ? 'Description: ' + r.description : ''}`
      ).join("\n");
    }

    const systemPrompt = `You are the virtual concierge for NextGen HMS - a premium hotel management system.
    
Current Hotel Room Data:
${hotelContext}

Hotel Statistics:
- Total Rooms: ${roomContext?.totalRooms || 'N/A'}
- Available Rooms: ${roomContext?.availableRooms || 'N/A'}
- Occupancy Rate: ${roomContext?.occupancyRate || 'N/A'}%

Guidelines:
1. Be professional, warm, and helpful - this is a hospitality setting.
2. If a user asks about room availability, refer to the room data provided above.
3. Provide specific room recommendations based on their needs.
4. Mention room features and amenities when suggesting options.
5. Be attentive and supportive - guests may have special requests.
6. Keep responses concise but informative (2-3 sentences max).
7. Help with local recommendations, dining, and attractions.
8. Use a warm, welcoming tone appropriate for a luxury hotel.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];

    return await callA4FAPI(messages);
  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
};

// Specialized guest assistant function
const getGuestAssistantResponse = async (userMessage, guestContext) => {
  try {
    const systemPrompt = `You are a guest services assistant AI for NextGen HMS hotel management system.

Guest Context: ${JSON.stringify(guestContext || {})}

IMPORTANT GUIDELINES:
1. Be helpful with hotel-related inquiries - room service, amenities, local recommendations.
2. Provide information about hotel facilities, dining options, and nearby attractions.
3. Help with booking modifications, check-in/check-out times, and special requests.
4. Be warm, professional, and attentive to guest needs.
5. For emergencies, advise contacting the front desk or emergency services.
6. Help explain hotel services and what guests can expect during their stay.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ];

    return await callA4FAPI(messages);
  } catch (error) {
    console.error('Guest AI Service Error:', error);
    throw new Error('Guest AI service temporarily unavailable. Please try again.');
  }
};

export { getAIResponse, getGuestAssistantResponse };
