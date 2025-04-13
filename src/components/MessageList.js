// src/components/MessageList.js
import React from 'react';

function MessageList({ messages }) {
  return (
    <>

      {messages.map((message) => (

        { message.content }

      ))}

    </>
  );
}

export default MessageList;