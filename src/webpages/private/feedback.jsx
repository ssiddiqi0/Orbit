import React, { useState } from 'react';
import '../../styles/feedback.css';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setErrorMessage('Oops! Your feedback is empty. ✨');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        setSuccessMessage('Thank you! Your feedback means a lot! 🤍');
        setFeedback('');
      } else {
        setErrorMessage('Uh-oh! Something went wrong. Please try again. 🥺');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrorMessage('Oops! Something went wrong. Please try again later. 💔');
    }
  };

  return (
    <div className="feedback-container">
      <h2> Submit Feedback </h2>
      <p
        className="feedback-text"
        dangerouslySetInnerHTML={{
          __html: `Hi! Thanks for checking out my app! 🪐 <br><br>
          This is Orbit's <strong>first launch</strong>, and I'm still improving things 🚀<br><br>
          Your feedback is <strong>anonymous</strong>, so feel free to share <strong>any thoughts, bugs, or ideas</strong> to help me make it better. 💡<br><br>
          I really appreciate it! 🎀`,
        }}
      />

      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here... 💭✨"
          className="feedback-textarea"
        />
        <button type="submit" className="button1">💌 Send Feedback</button>
      </form>

      {/* Move the success message to the bottom */}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Feedback;
