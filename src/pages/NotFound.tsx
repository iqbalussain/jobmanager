
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center glass-gaming-strong p-8 rounded-2xl gaming-pulse">
        <h1 className="text-4xl font-bold mb-4 text-gaming-glow">404</h1>
        <p className="text-xl text-gaming-glow mb-4">Oops! Page not found</p>
        <a href="/" className="text-gaming-primary hover:text-gaming-secondary underline transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
