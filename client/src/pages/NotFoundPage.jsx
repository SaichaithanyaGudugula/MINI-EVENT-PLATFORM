import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="empty">
    <p>Page not found</p>
    <Link to="/">Back to events</Link>
  </div>
);

export default NotFoundPage;


