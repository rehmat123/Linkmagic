// Track the last focused comment box
let lastFocusedCommentBox = null;

// Add a global focus listener to track comment boxes
document.addEventListener('focusin', (event) => {
    const target = event.target;
    // Check if the focused element is a comment box
    if (target.matches('.ql-editor[contenteditable="true"]') || 
        target.matches('[data-placeholder="Add a comment…"]') ||
        target.closest('.ql-editor[contenteditable="true"]')) {
        lastFocusedCommentBox = target;
    }
});

function getLinkedInPostContent(commentBox) {    
    // First try to find the post content in the modal view
    const modalContent = document.querySelector('.feed-shared-update-detail-viewer__content');
    if (modalContent) {
        const postContent = modalContent.querySelector('.feed-shared-inline-show-more-text');
        if (postContent) {
            const text = postContent.innerText.replace(/…more/g, '').trim();
            if (text) return text;
        }
    }
    
    // If not in modal view, try the regular feed view
    const postContainer = commentBox.closest('.feed-shared-update-v2, .feed-shared-article, .feed-shared-external-v2');
    
    if (postContainer) {
        // Try different selectors for post content
        const contentSelectors = [
            '.feed-shared-update-v2__description',
            '.feed-shared-text',
            '.feed-shared-article__description',
            '.feed-shared-external-v2__description',
            '.feed-shared-text-view',
            '.feed-shared-inline-show-more-text'
        ];
        
        
        for (const selector of contentSelectors) {
            const postContent = postContainer.querySelector(selector);
            
            if (postContent) {
                // Get the text content and clean it up
                let text = postContent.innerText;
                
                // Remove any "see more" text if present
                text = text.replace(/…more/g, '').trim();
                if (text) {
                    return text;
                }
            }
        }
        
        // If no specific content found, try to get any text content from the post
        console.log('No specific content found, trying to get all text from post container');
        const allText = postContainer.innerText;
        console.log('All text from post container:', allText);
        
        if (allText) {
            const cleanedText = allText.replace(/…more/g, '').trim();
            console.log('Returning cleaned all text:', cleanedText);
            return cleanedText;
        }
    }
    
    console.log('No post content found');
    return null;
}

function findCommentBox() {
    // First check if we have a tracked comment box
    if (lastFocusedCommentBox) {
        // Verify it's still in the document and visible
        if (document.contains(lastFocusedCommentBox) && lastFocusedCommentBox.offsetParent !== null) {
            console.log('Using tracked comment box:', lastFocusedCommentBox);
            return lastFocusedCommentBox;
        }
    }

    // Fallback to searching for comment boxes
    const selectors = [
        '.ql-editor[contenteditable="true"]',
        '[data-placeholder="Add a comment…"]'
    ];
    
    // Try each selector
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        
        // Check each element
        for (const element of elements) {
            // Check if element is visible and editable
            const isVisible = element.offsetParent !== null;
            const isEditable = element.isContentEditable || element.getAttribute('contenteditable') === 'true';
            
            if (isVisible && isEditable) {
                console.log('Found visible comment box:', element);
                return element;
            }
        }
    }
    
    return null;
}

function createButton() {
    const button = document.createElement('button');
    button.className = 'enhance-button';
    button.innerHTML = '✨';
    button.title = 'Generate LinkedIn comment';
    
    // Position the button on the right side of the page
    button.style.position = 'fixed';
    button.style.right = '20px';
    button.style.top = '50%';
    button.style.transform = 'translateY(-50%)';
    
    // Add click event listener
    button.addEventListener('click', async () => {
        // Check if we're on LinkedIn
        if (!window.location.hostname.includes('linkedin.com')) {
            alert('This extension only works on LinkedIn!');
            return;
        }

        // Find the comment box
        const commentBox = findCommentBox();
        
        if (!commentBox) {
            alert('Please click into a comment box first! Make sure you\'ve clicked the "Comment" button and the comment box is visible.');
            return;
        }

        // Get the post content
        const postContent = getLinkedInPostContent(commentBox);
        
        if (!postContent) {
            alert('Could not find the associated post content. Please make sure you\'re in a comment box!');
            return;
        }

        try {
            // Send post content and any existing comment text
            const response = await chrome.runtime.sendMessage({
                action: 'generateComment',
                postContent: postContent,
                existingComment: commentBox.innerText.trim()
            });
            
            if (response && response.comment) {
                // Update the comment editor
                commentBox.innerHTML = `<p>${response.comment}</p>`;
                
                // Trigger input event to ensure LinkedIn's editor updates properly
                commentBox.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } catch (error) {
            console.error('Error generating comment:', error);
            alert('Error generating comment. Please try again.');
        }
    });
    
    document.body.appendChild(button);
    return button;
}

// Initialize the extension
if (window.location.hostname.includes('linkedin.com')) {
    // Wait for the page to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createButton);
    } else {
        createButton();
    }
} 