import App from '@/App';
import GenerateTestpaper from '@/pages/GenerateTestpaper/GenerateTestpaper';
import List from '@/pages/List/List';
import { createBrowserRouter } from 'react-router-dom';
import Quiz from '@/pages/Quiz/Quiz';

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
        path: '/quiz',
        element: <Quiz />,
      },
      {
        path: '/list',
        element: <List />,
      },
    ],
  },
]);
