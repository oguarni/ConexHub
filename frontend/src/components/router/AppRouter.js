import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy load page components for better performance
const MainContent = React.lazy(() => import('../layout/MainContent'));
const About = React.lazy(() => import('../pages/About'));
const DebugProducts = React.lazy(() => import('../DebugProducts'));

// Lazy load admin components if they exist
const AdminPanel = React.lazy(() => 
  import('../admin/AdminPanel').catch(() => ({
    default: () => (
      <div className="p-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-600 mb-2">⚠️ Admin Panel</div>
          <p className="text-gray-700">Admin Panel não está disponível nesta versão.</p>
        </div>
      </div>
    )
  }))
);

const NotFound = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
      <p className="text-gray-600 mb-4">A página que você procura não existe.</p>
      <a 
        href="/" 
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar ao início
      </a>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainContent />} />
        <Route path="/products" element={<MainContent />} />
        <Route path="/about" element={<About />} />
        
        {/* Development/Debug routes */}
        {process.env.NODE_ENV === 'development' && (
          <Route path="/debug" element={<DebugProducts />} />
        )}
        
        {/* Protected admin routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;