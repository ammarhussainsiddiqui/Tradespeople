const Spinner = ({ className }) => (
  <svg
    className={`animate-spin h-5 w-5 ${className}`}
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.414 1.414C8.204 18.047 10.042 18 12 18v-4c-1.506 0-2.933.432-4.14 1.172L6 17.291z"
    ></path>
  </svg>
);
export default Spinner;