import App from '@/App';
import GenerateTestpaper from '@/pages/generateTestpaper';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/generateTestpaper',
        element: <GenerateTestpaper />,
      },
    ],
  },
]);
