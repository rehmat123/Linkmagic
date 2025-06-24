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

// Function to get comment content
function getCommentContent(commentElement) {
    console.log('Getting comment content from:', commentElement);
    
    // Try different selectors for comment content
    const contentSelectors = [
        '.comments-comment-item__main-content',
        '.feed-shared-inline-show-more-text',
        '.comments-comment-item__content',
        '.comments-comment-item__text',
        '.comments-comment-item__inline-show-more-text'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
        contentElement = commentElement.querySelector(selector);
        if (contentElement) break;
    }
    
    if (!contentElement) {
        console.log('No content element found');
        return null;
    }
    
    // Get the text content and clean it up
    let text = contentElement.textContent.trim();
    
    // Remove any mentions (they appear as links in the text)
    text = text.replace(/@\w+/g, '').trim();
    
    // Remove "see more" text if present
    text = text.replace(/…more/g, '').trim();
    
    console.log('Found comment content:', text);
    return text;
}

// Function to find the closest comment element
function findClosestComment(commentBox) {
    console.log('Finding closest comment to:', commentBox);
    let current = commentBox;
    while (current && !current.classList.contains('comments-comment-entity')) {
        current = current.parentElement;
    }
    console.log('Found closest comment:', current);
    return current;
}

// Function to get the comment being replied to
function getCommentBeingRepliedTo(commentBox) {
    console.log('Getting comment being replied to for:', commentBox);
    const commentElement = findClosestComment(commentBox);
    if (!commentElement) {
        console.log('No comment element found');
        return null;
    }
    return getCommentContent(commentElement);
}

// Function to get post content for a comment
function getPostContentForComment(commentBox) {
    console.log('Getting post content for comment:', commentBox);
    // First try to find the post content in the modal view
    const modalContent = document.querySelector('.feed-shared-update-detail-viewer__content');
    if (modalContent) {
        const postContent = modalContent.querySelector('.feed-shared-inline-show-more-text');
        if (postContent) {
            const text = postContent.innerText.replace(/…more/g, '').trim();
            if (text) return text;
        }
    }
    
    // If not in modal view, try to find the post container
    const postContainer = commentBox.closest('.feed-shared-update-v2, .feed-shared-article, .feed-shared-external-v2');
    if (!postContainer) {
        console.log('No post container found');
        return null;
    }

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
            const text = postContent.innerText.replace(/…more/g, '').trim();
            if (text) {
                console.log('Found post content:', text);
                return text;
            }
        }
    }
    
    // If no specific content found, try to get any text content from the post
    const allText = postContainer.innerText.replace(/…more/g, '').trim();
    console.log('Using all text from post container:', allText);
    return allText;
}

// Function to find comment box
function findCommentBox() {
    // First check if we have a tracked comment box
    if (lastFocusedCommentBox && document.contains(lastFocusedCommentBox)) {
        console.log('Using tracked comment box');
        return lastFocusedCommentBox;
    }

    // Look for visible and editable comment boxes
    const commentBoxes = document.querySelectorAll('.ql-editor[contenteditable="true"], [data-placeholder="Add a comment…"], [data-placeholder="Add a reply…"]');
    console.log('Found comment boxes:', commentBoxes.length);
    
    for (const box of commentBoxes) {
        if (isElementVisible(box)) {
            console.log('Found visible comment box:', box);
            return box;
        }
    }
    
    console.log('No visible comment box found');
    return null;
}

// Function to check if an element is visible
function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
}

// Function to get all comments in the thread
function getAllCommentsInThread(commentBox) {
    console.log('Getting all comments in thread for:', commentBox);
    
    // Find the parent article element
    const parentArticle = commentBox.closest('article.comments-comment-entity');
    if (!parentArticle) {
        console.log('No parent article found');
        return [];
    }

    // Get the parent comment content
    const parentContent = getCommentContent(parentArticle);
    if (!parentContent) {
        console.log('No parent comment content found');
        return [];
    }

    // Initialize comments array with parent comment
    const comments = [parentContent];
    console.log('Added parent comment:', parentContent);

    // Find all comments in the thread
    const threadEntities = parentArticle.querySelectorAll('.comments-thread-entity');
    console.log('Found thread entities:', threadEntities.length);

    for (const threadEntity of threadEntities) {
        // Find all comment entities in this thread
        const commentElements = threadEntity.querySelectorAll('.comments-comment-entity');
        console.log('Found comment elements in thread:', commentElements.length);

        for (const element of commentElements) {
            // Skip the parent comment as we already have it
            if (element === parentArticle) continue;

            const content = getCommentContent(element);
            if (content) {
                comments.push(content);
                console.log('Added comment:', content);
            }
        }
    }

    console.log('Final comments array:', comments);
    return comments;
}

// Function to add magic button to comment box
function addMagicButtonToCommentBox(commentBox) {
    console.log('Adding magic button to comment box:', commentBox);
    if (!commentBox || commentBox.closest('.comments-comment-box__form').querySelector('.magic-button')) {
        console.log('Comment box already has magic button or is invalid');
        return;
    }

    const button = document.createElement('button');
    button.className = 'magic-button';
    button.innerHTML = '✨';
    button.title = 'Generate AI response';
    button.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        font-size: 25px;
        padding: 5px;
        z-index: 1000;
        vertical-align: middle;
    `;

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Magic button clicked');

        try {
            // Find the comment box by looking up from the button
            const button = e.target;
            const container = button.closest('.editor-container');
            const commentBox = container ? container.querySelector('.ql-editor[contenteditable="true"]') : null;
            
            if (!commentBox) {
                console.log('No comment box found in container:', container);
                return;
            }

            console.log('Found comment box:', commentBox);

            // Get the post content first (needed for both comments and replies)
            const postContent = getPostContentForComment(commentBox);
            if (!postContent) {
                console.log('Could not find post content');
                return;
            }

            // Check if this is a reply box
            const isReplyBox = commentBox.closest('.comments-comment-box--reply') !== null;
            console.log('Is reply box:', isReplyBox);

            let response;
            if (isReplyBox) {
                // Get all comments in the thread
                const comments = getAllCommentsInThread(commentBox);
                if (comments.length === 0) {
                    console.log('No comments found in thread');
                    return;
                }

                // Get existing reply text if any
                const existingReply = commentBox.textContent.trim();
                console.log('Existing reply:', existingReply);

                console.log('Sending generateReply request with:', {
                    comments,
                    postContent,
                    existingReply
                });

                // Generate reply
                response = await chrome.runtime.sendMessage({
                    action: 'generateReply',
                    comments,
                    postContent,
                    existingReply
                });

                console.log('Received reply response:', response);
            } else {
                // Get existing comment text if any
                const existingComment = commentBox.textContent.trim();

                if(!existingComment) {
                    commentBox.innerHTML = `<p> Generating... </p>`;
                }

                // Generate comment
                response = await chrome.runtime.sendMessage({
                    action: 'generateComment',
                    postContent,
                    existingComment
                });
            }

            if (response.error) {
                console.error('Error generating response:', response.error);
                return;
            }

            // Insert the generated text
            const generatedText = isReplyBox ? response.reply : response.comment;
            console.log('Inserting generated text:', generatedText);
            commentBox.innerHTML = `<p>${generatedText}</p>`;
            
            // Trigger input event to ensure LinkedIn's editor updates properly
            commentBox.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (error) {
            console.error('Error in magic button click handler:', error);
        }
    });

    // Find the comment form and the submit button
    const form = commentBox.closest('.comments-comment-box__form');
    if (form) {
        const submitButton = form.querySelector('.comments-comment-box__submit-button--cr');
        if (submitButton) {
            // Insert the magic button right before the submit button
            submitButton.parentNode.insertBefore(button, submitButton);
            console.log('Magic button added beside Comment button');
            return;
        }
    }
    // Fallback: add to container as before
    const container = commentBox.closest('.editor-container') || commentBox.parentElement;
    container.style.position = 'relative';
    container.appendChild(button);
    console.log('Magic button added to comment box (fallback)');
}

// Function to initialize the extension
function initializeExtension() {
    console.log('Initializing extension');
    
    // Add magic button to any existing comment boxes
    const commentBoxes = document.querySelectorAll('.ql-editor[contenteditable="true"], [data-placeholder="Add a comment…"], [data-placeholder="Add a reply…"]');
    
    for (const box of commentBoxes) {
        if (isElementVisible(box)) {
            console.log('Adding magic button to visible comment box:', box);
            addMagicButtonToCommentBox(box);
        }
    }

    // Set up a mutation observer to watch for new comment boxes
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check for new comment boxes
                    const commentBoxes = node.querySelectorAll('.ql-editor[contenteditable="true"], [data-placeholder="Add a comment…"], [data-placeholder="Add a reply…"]');
                    console.log('Found new comment boxes:', commentBoxes.length);
                    for (const box of commentBoxes) {
                        if (isElementVisible(box)) {
                            console.log('Adding magic button to new visible comment box:', box);
                            addMagicButtonToCommentBox(box);
                        }
                    }
                }
            }
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize the extension
if (window.location.hostname.includes('linkedin.com')) {
    // Wait for the page to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }
} 