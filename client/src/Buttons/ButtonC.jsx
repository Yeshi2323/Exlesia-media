import "./ButtonC.css";
export default function ButtonC({ onClick, children }) {
  return (
    <button className="btn-c" onClick={onClick}>
      {children}
    </button>
  );
}
