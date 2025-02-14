import React, { useEffect, useState } from 'react';
import './feed.css'
import ProgressBar from "@ramonak/react-progress-bar";
import { BsBell, BsTwitter, BsBarChartLine } from "react-icons/bs";

const Feed = ({ groupId, posts, fetchPosts, updatePost }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [postType, setPostType] = useState('tweet'); // Default type
    const [heading, setHeading] = useState(''); // For all post types
    const [description, setDescription] = useState(''); // For tweets/reminders
    const [pollOptions, setPollOptions] = useState(['']); // For polls
  
    // Refresh Posts
    const handleRefresh = async () => {
      setRefreshing(true);
      await fetchPosts();
      setRefreshing(false);
    };
    const getPostIcon = (type) => {
        switch (type) {
          case 'reminder':
            return <BsBell className="post-icon reminder-icon" />;
          case 'tweet':
            return <BsTwitter className="post-icon tweet-icon" />;
          case 'poll':
            return <BsBarChartLine className="post-icon poll-icon" />;
          default:
            return null;
        }
      };
    // Handle Create Post
    const handleCreatePost = async () => {
      const token = localStorage.getItem('authToken'); // Assume token is stored here
      if (!token) {
        console.error('User not authenticated');
        return;
      }
  
      const postData = {
        group: groupId,
        type: postType,
        heading, // Include heading for all post types
        description: postType === 'poll' ? undefined : description, // Only include for non-polls
        pollOptions: postType === 'poll' ? pollOptions.filter((option) => option) : undefined, // Include only non-empty options
      };

      try {
  
        const response = await fetch(`${process.env.REACT_APP_API_URL}/groups/${groupId}/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData),
        });
  
        if (response.ok) {
          console.log('Post created successfully');
          setShowCreatePost(false); // Close the create post form
          await fetchPosts(); // Refresh posts
        } else {
          console.error('Failed to create post');
        }
      } catch (err) {
        console.error('Error creating post:', err);
      }
    };
  
    // Add or remove poll options dynamically
    const handlePollOptionChange = (index, value) => {
      const updatedOptions = [...pollOptions];
      updatedOptions[index] = value;
      setPollOptions(updatedOptions);
    };
    const handleVote = async (postId, optionId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('User not authenticated');
          return;
        }
      
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/posts/${postId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ optionId }),
          });
      
          if (response.ok) {
            const updatedPost = await response.json();
            updatePost(updatedPost); // Update the post with populated `user`
          } else {
            console.error('Failed to vote');
          }
        } catch (err) {
          console.error('Error voting:', err);
        }
      };
      
      
      
    const addPollOption = () => setPollOptions([...pollOptions, '']);
    const removePollOption = (index) =>
      setPollOptions(pollOptions.filter((_, i) => i !== index));

      
    return (
        <div className="feed-container">
        <h2>Group Feed</h2>
        <button onClick={handleRefresh} className="button1" disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
        <button onClick={() => setShowCreatePost(!showCreatePost)} className="button1">
          {showCreatePost ? 'Cancel' : 'Create Post'}
        </button>
  
        {showCreatePost && (
          <div className="create-post-form">
            <h3>Create a New Post</h3>
            <label>
              Post Type:
              <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                <option value="tweet">Tweet</option>
                <option value="reminder">Reminder</option>
                <option value="poll">Poll</option>
              </select>
            </label>
            <label>
              Heading/Question:
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder={postType === 'poll' ? 'Enter poll question...' : 'Enter heading...'}
              />
            </label>
            {postType !== 'poll' && (
              <label>
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
            )}
            {postType === 'poll' && (
              <div className="poll-options">
                <h4>Poll Options:</h4>
                {pollOptions.map((option, index) => (
                  <div key={index} className="poll-option">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handlePollOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePollOption(index)}
                      disabled={pollOptions.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addPollOption}>
                  Add Option
                </button>
              </div>
            )}
            <button onClick={handleCreatePost} className="button1">
              Submit Post
            </button>
          </div>
        )}
  
  {posts.length > 0 ? (
  <ul className="post-list">
    {posts
      .slice() // Create a shallow copy to avoid mutating the original array
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort posts by `createdAt`
      .map((post) => (
        <li key={post._id} className={`post-item ${post.type}`}>
          <div className="post-header">
            {getPostIcon(post.type)}
            <h3 className="post-heading">{post.heading || 'Untitled Post'}</h3>
            <p className="post-type">Type: {post.type}</p>
          </div>
          <div className="post-body">
            {post.description && <p className="post-description">{post.description}</p>}
            {post.type === 'poll' && post.pollOptions && (
              <div className="poll-options">
                <h4>Poll Options:</h4>
                <ul>
                  {post.pollOptions.map((option) => {
                    const totalVotes = post.pollOptions.reduce(
                      (sum, opt) => sum + opt.votes,
                      0
                    );
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

                    return (
                      <li key={option._id} className="poll-option-item">
                        <div className="poll-option-text">
                          <strong>{option.option}</strong> - {option.votes} votes
                        </div>
                        <div className="poll-progress-container">
                          <ProgressBar
                            completed={percentage}
                            customLabel={`${percentage.toFixed(1)}%`}
                            height="25px"
                            bgColor="#ffd966"
                            baseBgColor="rgba(255, 255, 255, 0.1)"
                            labelColor="#2d2d2d"
                            borderRadius="10px"
                            className="poll-progress-bar"
                          />
                        </div>
                              <button
                                onClick={() => handleVote(post._id, option._id)}
                                className="vote-button"
                              >
                                Vote
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="post-footer">
                  <p className="post-author">By: {post.user?.name || 'Unknown User'}</p>
                  <p className="post-date">Posted on: {new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts available. Create some new posts!</p>
        )}
      </div>
    );
  };
  
  export default Feed;