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
    setResponse(''); // Clear previous response
    try {
      let parts = [];

      // Convert image to generative part if it exists
      if (imageFile) {
        const imageData = await fileToGenerativePart(imageFile);
        parts.push(imageData);
      }

      // Add text part if it exists
      if (textInput.trim()) {
        parts.push({ text: textInput });
      }

      console.log('Sending to Gemini:', parts); // Debugging

      // Ensure you have parts before calling the model
      if (parts.length > 0) {
        const result = await geminiModel.generateContent({ parts }); // Pass parts in the correct structure
        setResponse(result.response.text());
      } else {
        setResponse('Please provide text or an image.');
      }

    } catch (error) {
      console.error('Error generating content:', error);
      setResponse('Sorry, there was an error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to format expected by Vertex AI
  const fileToGenerativePart = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contains the base64 string prefixed with data:mime/type;base64,
        // We need to extract just the base64 part.
        const base64Data = reader.result.split(',')[1];
        if (base64Data) {
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          });
        } else {
          reject(new Error('Failed to read file data.'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      }
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="multimodal-input-component"> 
      {/* Response Display Area */}
      {response && (
        <div className="response-area" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', background: '#f9f9f9' }}>
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Text Input */}
        <input
          type="text"
          value={textInput} // Control the input value
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Describe or ask about the image..."
          disabled={loading}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        {/* File Input & Image Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            disabled={loading}
          />
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ height: '50px', width: 'auto', border: '1px solid #ddd' }}
            />
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading || (!textInput.trim() && !imageFile)} style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Processing...' : 'Generate Response'}
        </button>
      </form>
    </div>
  );
}

export default MultimodalInputComponent;
