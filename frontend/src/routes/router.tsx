import App from '@/App';
import Generate from '@/pages/Generate/Generate';
import List from '@/pages/List/List';
import Note from '@/pages/Note/Note';
import { createBrowserRouter } from 'react-router-dom';
import Quiz from '@/pages/Quiz/Quiz';
import QuizEnd from '@/pages/Quiz/QuizEnd';
import Login from '@/pages/Login/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/generate/:workBookId',
        element: <Generate />,
      },
      {
        path: '/quiz/:testPaperId',
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
        path: '/list/:workBookId',
        element: <List />,
      },
      {
        path: '/quiz-end',
        element: <QuizEnd />,
      },

      {
        path: '/note',
        element: <Note />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      // {
      //   path: '/note/:workBookId',
      //   element: <Note />,
      // },
    ],
  },
]);
