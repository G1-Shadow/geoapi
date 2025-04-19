import React from 'react';
import './Comments.css';

const CommentList = ({ 
  comments, 
  isLoading, 
  error, 
  user, 
  onDelete,
  formatDate 
}) => {
  return (
    <div className="comments-list">
      {isLoading && comments.length === 0 ? (
        <div className="loading-message">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          {error ? error : "No comments yet. Be the first to comment!"}
        </div>
      ) : (
        comments.map((comment, index) => (
          <div key={comment.id} className="comment-card">
            <div className="comment-header">
              <div className="comment-number">#{index + 1}</div>
              <div className="comment-info">
                <div className="comment-author-time">
                  <span className="comment-author">{comment.userName}</span>
                  <span className="comment-time">{formatDate(comment.createdAt)}</span>
                </div>
                {user && user.id === comment.user.id && (
                  <button 
                    onClick={() => onDelete(comment.id)}
                    className="delete-comment"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <div className="comment-text">
              {comment.commentText}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList; 