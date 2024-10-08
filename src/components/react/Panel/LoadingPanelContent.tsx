export function LoadingPanelContent() {
  return (
    <div className="loading-content">
      <h2>Loading</h2>
      <div className="lottie-sticker lottie-fallback">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="lottie-fallback-dots"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </div>
    </div>
  );
}
