import React, { useState } from 'react';
import { geminiModel } from '../firebase-config';

function MultimodalInputComponent() {
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim() && !imageFile) return;
    
    setLoading(true);
    try {
      let content = [];
      
      if (textInput.trim()) {
        content.push({ text: textInput });
      }
      
      if (imageFile) {
        // Convert image to proper format for Vertex AI
        const imageData = await fileToGenerativePart(imageFile);
        content.push(imageData);
      }
      
      const result = await geminiModel.generateContent(content);
      setResponse(result.response.text());
    } catch (error) {
      console.error('Error generating content:', error);
      setResponse('Sorry, there was an error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to format expected by Vertex AI
  const fileToGenerativePart = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1],
            mimeType: file.type
          }
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    
      
        {response && (
          
            {response}
          
        )}
      
      
      
        <input
          type="text"
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Describe or ask about the image..."
          disabled={loading}
        />
      
      
        
          
          {imagePreview && (
            
              
            
          )}
        
      
      
      
        {loading ? 'Processing...' : 'Generate Response'}
      
    
  );
}

export default MultimodalInputComponent;