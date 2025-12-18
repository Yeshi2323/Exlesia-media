import "./ButtonA.css";
export default function ButtonA({ onClick, children }) {
  return (
    <button className="btn-a" onClick={onClick}>
      {children}
    </button>
  );
}
