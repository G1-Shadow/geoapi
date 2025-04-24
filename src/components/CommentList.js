import React from 'react';
import './Comments.css';
import deletemsg from '../imgs/deletemsg.svg'

const CommentList = ({ 
  comments, 
  isLoading, 
  error, 
  user, 
  onDelete,
  formatDate 
}) => {
  const getProfileImage = (comment) => {
    // If user has a Google profile picture
    if (comment.user?.imageUrl) {
      return comment.user.imageUrl;
    }
    // If user has a picture from profile section
    if (comment.user?.profilePicture) {
      return comment.user.profilePicture;
    }
    if (comment.user?.picture) {
      return comment.user.picture;
    }
    // Default to avatar placeholder
    return null;
  };

  return (
    <div className="comments-list">
      {isLoading && comments.length === 0 ? (
        <div className="loading-message">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          {error ? error : "No comments yet. Be the first to comment!"}
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <div className="comment-header">
              <div className="comment-avatar">
                {getProfileImage(comment) ? (
                  <img 
                    src={getProfileImage(comment)} 
                    alt={comment.userName} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = comment.userName?.charAt(0).toUpperCase();
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {comment.userName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="comment-info">
                <div className="comment-author">{comment.userName}</div>
                <div className="comment-meta">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
            </div>
            <div className="comment-text">
              {comment.commentText}
            </div>
            {(user && (user.id === comment.user?.id || user.roles?.includes('ADMIN'))) && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="delete-comment"
                disabled={isLoading}
                title="Delete comment"
              >
                <img src={deletemsg} alt="delete" height="20" width="20" />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList; 