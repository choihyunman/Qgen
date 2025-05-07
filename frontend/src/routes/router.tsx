import App from '@/App';
import Generate from '@/pages/Generate/Generate';
import List from '@/pages/List/List';
import Incorrect from '@/pages/Incorrect/Incorrect';
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
      {
        path: '/quiz',
        element: <Quiz />,
      },
      {
        path: '/quiz-end',
        element: <QuizEnd />,
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
