import App from '@/App';
import Generate from '@/pages/Generate/Generate';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/generate',
        element: <Generate />,
      },
    ],
  },
]);
