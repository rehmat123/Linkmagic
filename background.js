// Replace this URL with your actual API endpoint
const API_ENDPOINT = 'http://localhost:3006/api/linkedin/auto-reply';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateComment') {
        generateComment(request.postContent, request.existingComment)
            .then(comment => {
                console.log('Generated comment:', comment);
                sendResponse({ comment });
            })
            .catch(error => {
                console.error('Error in message handler:', error);
                sendResponse({ error: error.message || 'Failed to generate comment' });
            });
        return true; // Will respond asynchronously
    }
});

async function generateComment(postContent, existingComment = '') {
    try {
        // Get user context and system prompt from storage
        const {systemPrompt } = await chrome.storage.sync.get(['systemPrompt']);
        
        const requestBody = {
            post: postContent,
            type: existingComment.trim() ? 'linkedin_comment_format' : 'linkedin_comment_generate',
            reply: existingComment.trim() ? existingComment.trim() : undefined,
            systemPrompt: systemPrompt || ''
        };

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('API response:', data);
        
        if (!data.reply) {
            throw new Error('No reply in API response');
        }
        
        return data.reply;
    } catch (error) {
        console.error('Error in generateComment:', error);
        throw error;
    }
} 