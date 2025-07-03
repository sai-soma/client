const LoadingSpinner = () => (
  <div style={{ textAlign: "center", padding: "10px" }}>
    <div className="spinner" />
    <style>{`
      .spinner {
        margin: auto;
        width: 30px;
        height: 30px;
        border: 4px solid #ccc;
        border-top-color: #333;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;