// Replace this URL with your actual API endpoint
const API_ENDPOINT = 'https://linkedin-auto-reply.vercel.app/api/linkedin/auto-reply';
const COMMENT_REPLY_ENDPOINT = 'https://linkedin-auto-reply.vercel.app/api/linkedin/comment/auto-reply';

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
    } else if (request.action === 'generateReply') {
        generateReply(request.comments, request.postContent, request.existingReply)
            .then(reply => {
                console.log('Generated reply:', reply);
                sendResponse({ reply });
            })
            .catch(error => {
                console.error('Error in message handler:', error);
                sendResponse({ error: error.message || 'Failed to generate reply' });
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

async function generateReply(comments, postContent, existingReply = '') {
    try {
        // Get user context and system prompt from storage
        const {systemPrompt } = await chrome.storage.sync.get(['systemPrompt']);
        
        const requestBody = {
            comments,
            post: postContent,
            type: existingReply.trim() ? 'linkedin_reply_format' : 'linkedin_reply_generate',
            reply: existingReply.trim() ? existingReply.trim() : undefined,
            systemPrompt: systemPrompt || ''
        };

        const response = await fetch(COMMENT_REPLY_ENDPOINT, {
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
        
        if (!data.reply) {
            throw new Error('No reply in API response');
        }
        
        return data.reply;
    } catch (error) {
        console.error('Error in generateReply:', error);
        throw error;
    }
} 