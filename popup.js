document.addEventListener('DOMContentLoaded', () => {
    const userContextInput = document.getElementById('userContext');
    const saveButton = document.getElementById('saveContext');
    const statusDiv = document.getElementById('status');

    // Load saved context when popup opens
    chrome.storage.sync.get(['userContext', 'systemPrompt'], (result) => {
        if (result.userContext) {
            userContextInput.value = result.userContext;
        }
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
            const response = await fetch('http://localhost:3006/api/linkedin/system-prompt', {
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