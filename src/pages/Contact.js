import React, { useState } from 'react';
import SubmitPopup from '../components/SubmitPopup';
import Comments from '../components/Comments';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ isSuccess: false, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://netintel-app.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important for CORS with credentials
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        })
      });

      if (response.ok) {
        const data = await response.text();
        alert(data); // Show success message
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1>Contact us</h1>
        <p className="contact-description">
          Have a question? Want to partner with us? Reach out through this form, by sending us an email, or chatting on Twitter.
        </p>

        <div className="contact-methods">
          <a href="mailto:support@Netintel.com" className="contact-method">
            <div className="method-icon">✉️</div>
            <div className="method-details">
              <h3>Send us an email</h3>
              <p>support@Netintel.com</p>
            </div>
          </a>

          <a href="https://twitter.com/youraccount" className="contact-method">
            <div className="method-icon">💭</div>
            <div className="method-details">
              <h3>Chat with us</h3>
              <p>Message us on Twitter</p>
            </div>
          </a>
        </div>

        <div className="contact-form-container">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="XXXXX-XXXXX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Please type your message here..."
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-comments-section">
          <Comments />
        </div>
      </div>

      {showPopup && (
        <SubmitPopup
          isSuccess={popupData.isSuccess}
          message={popupData.message}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default Contact; 