require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Conversation } = require('../database/models');
const {
  fetchRoomOptionsDeclaration,
  bookRoomDeclaration,
  fetchRoomOptions,
  bookRoom
} = require('../services/functions');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: {
    functionDeclarations: [fetchRoomOptionsDeclaration, bookRoomDeclaration],
  },
  systemInstruction: `You are a hotel booking agent.
            Chat structure:
            - Greet the user
            - The user will ask for the list of rooms.
            - then you will fetch ad=nd show the roos details using function calling
            - The user will select one rooms 
            -  After user select one rooms , you will then ask for the full name, email, and number of nights to book the room.
            - After user will provide the details, 
            then you will ask for confirmation of the booking. by showing selected room detail
            - If the user accept the booking by saying yes , then you will book the room using function calling and show the booking details to user.
            - If no, then reject the booking.`,
  toolConfig: {
    functionCallingConfig: {
      mode: 'ANY',
      allowedFunctionNames: ['fetchRoomOptions', 'bookRoom']
    }
  },
});


const functions = {
    fetchRoomOptions,
    bookRoom
};


const chat = model.startChat();
app.post('/chat', async (req, res) => {
    try {
        const message = req.body.message;
        const sessionId = req.headers['session-id'] || req.query.sessionId || req.body.sessionId;
    
        if (!sessionId) {
        res.status(400).json({ error: 'Session ID is required' });
        }

        const result = await chat.sendMessage(message);
        const functionCalls = result.response.functionCalls();
        // console.log(`function name: ${functionCalls[0].name}`);
    
        if (functionCalls && functionCalls.length > 0 ) {
            // console.log(functionCalls);
            for( let i = 0; i < functionCalls.length; i++){
                const functionCall = functionCalls[i];
                const { name, args } = functionCall;
                const functionToCall = functions[name];
                // console.log(functionToCall);
                if (functionToCall) {
                    // Call the function with arguments
                    const functionResponse = args ? await functionToCall(args) : await functionToCall();
                    console.log(functionResponse);
                    // Send the function response back to the model to get a formatted reply
                    const secondResult = await chat.sendMessage([
                        {functionResponse : 
                            { name, response: functionResponse } 
                        }
                    ]);
    
                    const finalText = secondResult.response.text();
                    console.log(finalText);
                    await Conversation.create({ sessionId, role: 'user', text: message });
                    await Conversation.create({ sessionId, role: 'model', text: finalText });
            
                    res.json({ response: finalText });
                } else {
                    const text = result.response.text();
                        
                    await Conversation.create({ sessionId, role: 'user', text: message });
                    await Conversation.create({ sessionId, role: 'model', text });
    
                    res.json({ response: text });
                }
            }
        }else {
            const text = result.response.text();
                
            await Conversation.create({ sessionId, role: 'user', text: message });
            await Conversation.create({ sessionId, role: 'model', text });

            res.json({ response: text });
        }
    } catch (error) {
        console.error('Error handling chat:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }    
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});