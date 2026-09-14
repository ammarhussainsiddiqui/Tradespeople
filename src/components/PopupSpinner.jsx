export default function PopupSpinner({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-accent border-r-accent border-b-transparent border-l-transparent">


      </div>
    </div>
  );
}
