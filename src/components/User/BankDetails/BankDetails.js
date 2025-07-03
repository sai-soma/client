import React, { useState, useEffect } from "react";
import "./BankDetails.css";
 
const BankDetails = () => {
  const initialFormState = {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    upiId: "",
    phonepeNumber: "",
  };
 
  const [formData, setFormData] = useState(initialFormState);
  const [bankDetails, setBankDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const BASE_URL = process.env.REACT_APP_API_URL;
 
  useEffect(() => {
    fetchBankDetails();
  }, []);
 
  const fetchBankDetails = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User not logged in. Cannot fetch bank details.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}api/auth/users/${userId}/bankDetails`
      );
 
      if (response.ok) {
        const data = await response.json();
        if (data.bankDetails && data.bankDetails.length > 0) {
          setBankDetails(data.bankDetails[0]);
          setIsEditing(false);
        } else {
          setIsEditing(true); // Show form if no bank details exist
        }
      } else {
        console.error("Error fetching bank details");
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
    setIsLoading(false);
  };
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
 
 
  const handleEdit = () => {
    setFormData(bankDetails);
    setIsEditing(true);
  };
 
  const handleDelete = async () => {
    const userId = localStorage.getItem("userId");
 
    if (!userId) {
      alert("User not logged in. Please login and try again.");
      return;
    }
 
    try {
      const response = await fetch(
       `${BASE_URL}api/auth/users/${userId}/bankDetails`,
        { method: "DELETE" }
      );
 
      if (response.ok) {
        setBankDetails(null);
        setFormData(initialFormState); // Reset form after deletion
        setIsEditing(true);
      } else {
        alert("Failed to delete bank details.");
      }
    } catch (error) {
      alert("Error deleting bank details.");
      console.error(error);
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
 
    if (!userId) {
      alert("User not logged in. Please login and try again.");
      return;
    }
 
    try {
      const checkResponse = await fetch(
        `${BASE_URL}api/auth/users/${userId}/bankDetails`
      );
      const data = await checkResponse.json();
 
      const method =
        data.bankDetails && data.bankDetails.length > 0 ? "PUT" : "POST";
 
      const response = await fetch(
        `${BASE_URL}api/auth/users/${userId}/bankDetails`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
 
      const result = await response.json();
 
      if (response.ok) {
        setBankDetails(result.bankDetails[0]);
        setIsEditing(false);
        setErrors({});
        alert("Bank details updated successfully!");
      } else if (result.errors) {
        // Normalize nested error keys like 'bankDetails.0.ifscCode' => 'ifscCode'
        const cleanedErrors = {};
Object.keys(result.errors).forEach((key) => {
  const splitKey = key.split(".");
  cleanedErrors[splitKey[splitKey.length - 1]] =
    typeof result.errors[key] === "string"
      ? result.errors[key]
      : (result.errors[key].message || result.errors[key]);
});
setErrors(cleanedErrors);
      } else if (result.message) {
        alert(result.message);
      } else {
        alert("Failed to update bank details");
      }
     
    } catch (error) {
      alert("Error saving bank details");
      console.error(error);
    }
  };
 
  if (isLoading) {
    return <p>Loading...</p>;
  }
 
  return (
    <div className="bank-form-container">
      {isEditing ? (
        <div className="form-box">
          <h2>{bankDetails ? "Edit Bank Details" : "Add Bank Details"}</h2>
          <form onSubmit={handleSubmit}>
            <label className="bank-label">Account Holder Name:</label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter account holder name"
              required
            />
            {errors.accountHolderName && (
      <p className="error-text">{errors.accountHolderName}</p>
        )}
 
            <label className="bank-label">Bank Name:</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter bank name"
              required
            />
{errors.bankName && <p className="error-text">{errors.bankName}</p>}
            <label className="bank-label">Account Number:</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter account number"
              required
            />
            {errors.accountNumber && (
      <p className="error-text">{errors.accountNumber}</p>
    )}
 
            <label className="bank-label">IFSC Code:</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter IFSC code"
              required
            />
            {errors.ifscCode && <p className="error-text">{errors.ifscCode}</p>}
 
            <label className="bank-label">Branch Name:</label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter branch name"
              required
            />
             {errors.branchName && <p className="error-text">{errors.branchName}</p>}
 
 
            <label className="bank-label">UPI ID:</label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter UPI ID (optional)"
            />
{errors.upiId && <p className="error-text">{errors.upiId}</p>}
 
            <label className="bank-label">
              PhonePe/Google Pay/Paytm Number:
            </label>
            <input
              type="text"
              name="phonepeNumber"
              value={formData.phonepeNumber}
              onChange={handleChange}
              className="bank-input"
              placeholder="Enter linked phone number"
            />
            {errors.phonepeNumber && (
      <p className="error-text">{errors.phonepeNumber}</p>
    )}
 
            <button type="submit" className="bank-submit-btn">
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div className="bank-details-container">
          <h3>Saved Bank Details</h3>
          {bankDetails ? (
            <>
              <p>
                <strong>Account Holder Name:</strong>{" "}
                {bankDetails.accountHolderName || "N/A"}
              </p>
              <p>
                <strong>Bank Name:</strong> {bankDetails.bankName || "N/A"}
              </p>
              <p>
                <strong>Account Number:</strong> {bankDetails.accountNumber || "N/A"}
              </p>
              <p>
                <strong>IFSC Code:</strong> {bankDetails.ifscCode || "N/A"}
              </p>
              <p>
                <strong>Branch Name:</strong> {bankDetails.branchName || "N/A"}
              </p>
              <p>
                <strong>UPI ID:</strong> {bankDetails.upiId || "N/A"}
              </p>
              <p>
                <strong>PhonePe/Google Pay/Paytm Number:</strong>{" "}
                {bankDetails.phonepeNumber || "N/A"}
              </p>
 
              <div className="button-container">
                <button className="edit-btn" onClick={handleEdit}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => setShowDeleteDialog(true)}>
                  Delete
                </button>
              </div>
            </>
          ) : (
            <p>No bank details found.</p>
          )}
        </div>
      )}
      {showDeleteDialog && (
  <div className="delete-dialog-overlay">
    <div className="delete-dialog-box">
      <p>Are you sure you want to delete your bank details?</p>
      <div className="dialog-buttons">
        <button
          className="confirm-delete"
          onClick={() => {
            handleDelete();
            setShowDeleteDialog(false);
          }}
        >
          Yes, Delete
        </button>
        <button
          className="cancel-delete"
          onClick={() => setShowDeleteDialog(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
 
export default BankDetails;