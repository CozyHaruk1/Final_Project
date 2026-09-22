function ErrorMessage({ message = "Something went wrong." }) {
  return (
    <div className="error-message">
      <span className="error-icon">!</span>
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;