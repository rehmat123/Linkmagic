document.addEventListener('DOMContentLoaded', () => {
    const userContextInput = document.getElementById('userContext');
    const saveButton = document.getElementById('saveContext');
    const statusDiv = document.getElementById('status');
    const exampleContextLink = document.getElementById('exampleContext');

    const exampleContext = `My name is XYZ. I am a Senior Software Engineer with 8+ years of experience in full-stack development, specializing in JavaScript/TypeScript, React, and Node.js. I have a strong background in building scalable web applications and microservices architecture. I'm passionate about clean code, software design patterns, and mentoring junior developers. I frequently engage in tech communities and contribute to open-source projects. Use Web Search always when some post ask question and you dont know much about that.`;

    // Load saved context when popup opens
    chrome.storage.sync.get(['userContext', 'systemPrompt'], (result) => {
        if (result.userContext) {
            userContextInput.value = result.userContext;
        }
    });

    // Add click handler for example context
    exampleContextLink.addEventListener('click', () => {
        userContextInput.value = exampleContext;
    });

    // Save context when button is clicked
    saveButton.addEventListener('click', async () => {
        const context = userContextInput.value.trim();
        
        try {
            // Show loading state
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
            statusDiv.textContent = 'Generating system prompt...';
            statusDiv.style.color = '#666';

            // Call API to get system prompt
            const response = await fetch('https://linkedin-auto-reply.vercel.app/api/linkedin/system-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context })
            });

            if (!response.ok) {
                throw new Error('Failed to generate system prompt');
            }

            const data = await response.json();
            
            // Save both context and system prompt
            await chrome.storage.sync.set({ 
                userContext: context,
                systemPrompt: data.systemPrompt 
            });

            // Show success message
            statusDiv.textContent = 'Context and system prompt saved successfully!';
            statusDiv.style.color = '#057642';
            
        } catch (error) {
            console.error('Error:', error);
            statusDiv.textContent = 'Error: ' + error.message;
            statusDiv.style.color = '#d11124';
        } finally {
            // Reset button state
            saveButton.disabled = false;
            saveButton.textContent = 'Save Context';
            
            // Clear status message after 3 seconds
            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        }
    });
}); 