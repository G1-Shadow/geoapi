import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentList from './CommentList';
import './Comments.css';
import people from '../imgs/People.svg';
import postIcon from '../imgs/postcomment.png';

const Comments = ({ 
  postId, // Optional: If comments are associated with a specific post
  maxComments = 10, // Optional: Limit number of comments shown
  showLoginPrompt = true // Optional: Whether to show login prompt for non-authenticated users
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLogin = () => {
    window.location.href = 'https://netintel-app.onrender.com/oauth2/authorization/google';
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setComments([]);
        return;
      }
      
      const url = postId 
          ? `https://netintel-app.onrender.com/api/comments?postId=${postId}&limit=${maxComments}`
          : `https://netintel-app.onrender.com/api/comments?limit=${maxComments}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        setComments([]);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      console.log('Fetched comments:', data);
      setComments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      handleLogin();
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleLogin();
        return;
      }

      const response = await fetch('https://netintel-app.onrender.com/api/comments/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: newComment.trim(),
          postId: postId || null
        })
      });

      console.log('Sending comment:', { text: newComment.trim(), postId: postId || null }); // Debug log

      if (response.status === 401) {
        handleLogin();
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(errorText || 'Failed to post comment');
      }

      const postedComment = await response.json();
      console.log('Posted comment response:', postedComment);
      setComments(prevComments => [postedComment, ...prevComments].slice(0, maxComments));
      setNewComment('');
      setError(null);
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!user) {
      handleLogin();
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        handleLogin();
        return;
      }

      const response = await fetch(`https://netintel-app.onrender.com/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        setError('Unauthorized. Please login again.');
        handleLogin();
        return;
      }

      if (response.status === 403) {
        setError('You do not have permission to delete this comment.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete comment');
      }

      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
      setError(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="comments-container">
      <div className="comments-header">
        <h2>Comments</h2>
        <div className="user-avatars">
          <img src={people} alt="User Avatar" />
        </div>
        <div className="satisfaction-rating">
          <span className="rating-number">98%</span>
          <span className="rating-text">Users Satisfaction</span>
        </div>
      </div>
      
      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-header">
            <div className="comment-form-avatar">
              <img src={user.picture || people} alt={user.name || 'User Avatar'} />
            </div>
            <div className="comment-form-user">
              {user.name || 'Anonymous User'}
            </div>
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button 
            type="submit" 
            className="post-button"
            disabled={!newComment.trim() || isLoading}
          >
            <img src={postIcon} alt="Post comment" />
          </button>
        </form>
      ) : showLoginPrompt ? (
        <div className="comments-login-message">
          <p>Please login to post comments</p>
          <button onClick={handleLogin} className="login-button2">
            Login with Google
          </button>
        </div>
      ) : null}

      <CommentList
        comments={comments}
        isLoading={isLoading}
        error={error}
        user={user}
        onDelete={handleDelete}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Comments; 