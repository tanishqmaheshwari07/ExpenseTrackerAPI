import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, Lock, Compass } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useAuthStore } from '../store/authStore';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 space-y-5 shadow-card border-border">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 text-danger mx-auto flex items-center justify-center shadow-sm">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-danger">
            Error 401
          </span>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            Unauthorized Access
          </h1>
          <p className="text-sm text-muted">
            Your session has expired or you need to be signed in to view this page.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
            className="w-full h-11 text-sm font-semibold"
          >
            Sign in to continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 space-y-5 shadow-card border-border">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-sm">
          <ShieldX className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Error 403
          </span>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            Access Forbidden
          </h1>
          <p className="text-sm text-muted">
            You don't have the necessary administrative permissions to view this resource.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="w-full h-11 text-sm font-semibold"
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 space-y-5 shadow-card border-border">
        <div className="w-14 h-14 rounded-full bg-surface border border-border text-muted mx-auto flex items-center justify-center shadow-sm">
          <Compass className="w-7 h-7 text-ink" />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-faint">
            Error 404
          </span>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-muted">
            The page you are looking for might have been removed, renamed, or is temporarily unavailable.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            className="w-full h-11 text-sm font-semibold"
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
