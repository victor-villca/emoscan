interface GoogleLoginButtonProps {
  onClick: () => void;
}

export default function GoogleLoginButton({ onClick }: GoogleLoginButtonProps) {
  return (
    <button
      onClick={onClick}
      className="google-btn flex items-center justify-center w-full py-3 px-4 border border-gray-200 rounded-button bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg"
      aria-label="Sign in with Google"
    >
      <div className="w-6 h-6 flex items-center justify-center mr-3">
        <i className="ri-google-fill text-xl" aria-hidden="true" />
      </div>
      <span>Sign in with Google</span>
    </button>
  );
}
