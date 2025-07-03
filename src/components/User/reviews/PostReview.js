import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PostReview.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const PostReview = ({ onClose }) => {
  const [form, setForm] = useState({
    name: "",
    review: "",
    rating: 5,
    image: "https://cdn-icons-png.flaticon.com/512/147/147140.png",
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const userName = user.fullName;
      setForm((prevForm) => ({ ...prevForm, name: userName }));
      checkExistingReview(userName);
    }
  }, []);

  const checkExistingReview = async (userName) => {
    try {
      const res = await axios.get(BASE_URL);
      const match = res.data.find((r) => r.name === userName);
      if (match) {
        setForm(match);
        setIsUpdate(true);
      } else {
        setIsUpdate(false);
      }
    } catch (err) {
      console.error("Error checking existing review:", err);
      toast.error("Failed to check existing review");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`${BASE_URL}/api/reviews`);
      const match = res.data.find((r) => r.name === form.name);
      if (match && !isUpdate) {
        toast.warn("You can only submit one review.");
        return;
      }

      await axios.post(BASE_URL, form);
      toast.success(isUpdate ? "Review updated!" : "Review posted!");
    } catch (error) {
      console.error("Error posting review:", error);
      toast.error("Error submitting review");
    }
  };

  return (
    <div className="pr-overlay">
      <div className="post-review-container">
        <h2>{isUpdate ? "Update Review" : "Post Review"}</h2>
        <button className="sh-close-btn" onClick={onClose}>✕</button>

        <form onSubmit={handleSubmit} className="post-review-form">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
            readOnly
          />
          <textarea
            name="review"
            placeholder="Your Review"
            value={form.review}
            onChange={handleChange}
            required
          />
          <select name="rating" value={form.rating} onChange={handleChange}>
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num} Star
              </option>
            ))}
          </select>
          <button type="submit">
            {isUpdate ? "Update Review" : "Submit Review"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default PostReview;
