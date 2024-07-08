// src/services/functions.js

const axios = require('axios');

// Function Declarations
const fetchRoomOptionsDeclaration = {
  name: "fetchRoomOptions",
  description: "If the user asks for a room to stay or book, get them the room details with its name, description, and price, and ask user which one they want to book."
};

const bookRoomDeclaration = {
  name: "bookRoom",
  description: "If the user asks for a room to stay or book, get them the room details with its name, description, and price, and ask user which one they want to book.",
  parameters: {
    type: "OBJECT",
    description: "parameters needed to book a room",
    properties: {
      roomId: {
        type: "NUMBER",
        description: "ID of the room to book.",
      },
      fullName: {
        type: "STRING",
        description: "Full name of the person booking the room.",
      },
      email: {
        type: "STRING",
        description: "Email address of the person booking the room.",
      },
      nights: {
        type: "NUMBER",
        description: "Number of nights to book the room for.",
      },
    },
    required: ["roomId", "fullName", "email", "nights"],
  },
};

// Actual Functions
const fetchRoomOptions = async () => {
    const response = await axios.get('https://bot9assignement.deno.dev/rooms');
    console.log("Fetched rooms:", response.data);
    const data = 
    response.data.map(room => ({
      id: room.id,
      name: room.name,
      description: room.description,
      price: room.price
    }));
    // console.log("Formatted rooms:", data);
    return {
        rooms: data
    };
    };

const bookRoom = async ({ roomId, fullName, email, nights }) => {
    console.log(roomId, fullName, email, nights);
  const response = await axios.post('https://bot9assignement.deno.dev/book', {
    roomId,
    fullName,
    email,
    nights,
  });
  return response.data;
};

  

module.exports = {
  fetchRoomOptionsDeclaration,
  bookRoomDeclaration,
  fetchRoomOptions,
  bookRoom,
};
