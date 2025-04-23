import React from 'react';
import './Comments.css';
import deletemsg from '../imgs/deletemsg.png'

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
        comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <div className="comment-header">
              <div className="comment-avatar">
                {comment.user?.profilePicture ? (
                  <img src={comment.user.profilePicture} alt={comment.userName} />
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