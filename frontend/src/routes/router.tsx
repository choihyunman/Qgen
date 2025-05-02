import App from '@/App';
import Generate from '@/pages/Generate/Generate';
import List from '@/pages/List/List';
import Incorrect from '@/pages/Incorrect/Incorrect';
import { createBrowserRouter } from 'react-router-dom';
import Quiz from '@/pages/Quiz/Quiz';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/generate',
        element: <Generate />,
      },
      {
        path: '/quiz',
        element: <Quiz />,
      },
      {
        path: '/list',
        element: <List />,
      },
      {
        path: '/incorrect',
        element: <Incorrect />,
      },
    ],
  },
]);
