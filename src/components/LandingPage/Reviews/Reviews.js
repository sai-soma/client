import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const BASE_URL = process.env.REACT_APP_API_URL;

  // Hardcoded reviews
  const hardcodedReviews = [
    {
      name: "Alice",
      review: "Great service and friendly staff!",
      rating: 5,
      image: "https://cdn-icons-png.flaticon.com/512/147/147140.png",
      createdAt: "2025-05-28T12:00:00Z",
    },
    {
      name: "Bob",
      review: "I had a wonderful experience, highly recommend!",
      rating: 4,
      image: "https://cdn-icons-png.flaticon.com/512/147/147140.png",
      createdAt: "2025-05-28T12:00:00Z",
    },
    {
      name: "Charlie",
      review: "The product quality is excellent!",
      rating: 5,
      image: "https://cdn-icons-png.flaticon.com/512/147/147140.png",
      createdAt: "2025-05-28T12:00:00Z",
    },
    {
      name: "Diana",
      review: "Fast shipping and great customer support.",
      rating: 4,
      image: "https://cdn-icons-png.flaticon.com/512/147/147140.png",
      createdAt: "2025-05-28T12:00:00Z",
    },
    {
      name: "Ethan",
      review: "Will definitely come back for more!",
      rating: 5,
      image: "https://cdn-icons-png.flaticon.com/512/147/147140.png",
      createdAt: "2025-05-28T12:00:00Z",
    },
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("${BASE_URL}api/reviews");
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(sorted);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
    const interval = setInterval(fetchReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  // Combine fetched reviews with hardcoded reviews if less than 5
  const combinedReviews = reviews.length < 5 ? [...new Set([...reviews, ...hardcodedReviews])].slice(0, 5) : reviews;

  // Duplicate reviews for continuous scrolling
  const displayReviews = [...combinedReviews, ...combinedReviews];

  return (
    <div className="reviews-container">
      <h2 className="reviews-title">
        What <span className="reviews-highlight">Users</span> say about us?
      </h2>
      <div className="reviews-scroll-container">
        <div className={`reviews-marquee`}>
          {displayReviews.map((d, index) => {
            const isLong = d.review.split(" ").length > 35;

            return (
              <div key={index} className="review-card">
                <div className="review-header">
                  <img src={d.image || "/default-user.png"} className="review-image" alt={d.name} />
                  <h3 className="review-name">{d.name}</h3>
                </div>
                <p className="review-text">{isLong ? d.review.slice(0, 120) + "..." : d.review}</p>
                <div className="review-rating">
                  {"★".repeat(d.rating)}
                  {"☆".repeat(5 - d.rating)}
                </div>
                {isLong && (
                  <button className="read-more-btn" onClick={() => setSelectedReview(d)}>
                    Read More
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      &nbsp; &nbsp;
      {/* Modal */}
      {selectedReview && (
        <div className="review-modal-overlay" onClick={() => setSelectedReview(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedReview(null)}>
              ×
            </button>
            <div className="review-header">
              <img src={selectedReview.image || "/default-user.png"} className="review-image" alt={selectedReview.name} />
              <h3 className="review-name">{selectedReview.name}</h3>
            </div>
            <p className="review-text-full">{selectedReview.review}</p>
            <div className="review-rating">
              {"★".repeat(selectedReview.rating)}
              {"☆".repeat(5 - selectedReview.rating)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
