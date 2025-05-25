// Replace this URL with your actual API endpoint
const API_ENDPOINT = 'http://localhost:3006/linkedin/auto-reply';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateComment') {
        console.log('request', request);
        generateComment(request.postContent)
            .then(comment => sendResponse({ comment }))
            .catch(error => {
                console.error('Error:', error);
                sendResponse({ error: error.message });
            });
        return true; // Will respond asynchronously
    }
});

async function generateComment(postContent) {
    console.log('postContent', postContent);
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any required API keys or authentication headers here
            },
            body: JSON.stringify({
                post: postContent,
                type: 'linkedin_comment'
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        console.log('data', data);
        return data.reply; // Adjust this based on your API response structure
    } catch (error) {
        console.error('Error generating comment:', error);
        throw error;
    }
} 