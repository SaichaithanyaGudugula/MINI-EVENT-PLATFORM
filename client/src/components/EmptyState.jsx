const EmptyState = ({ title = 'Nothing here yet', action }) => (
  <div className="empty">
    <p>{title}</p>
    {action}
  </div>
);

export default EmptyState;


