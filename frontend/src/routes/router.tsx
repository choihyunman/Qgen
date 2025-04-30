import App from '@/App';
import GenerateTestpaper from '@/pages/GenerateTestpaper/GenerateTestpaper';
import List from '@/pages/List/List';
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
      {
        path: '/list',
        element: <List />,
      },
    ],
  },
]);
