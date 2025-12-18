import "./ButtonB.css";

export default function ButtonB({ onClick, children }) {
  return (
    <button className="btn-b" onClick={onClick}>
      {children}
    </button>
  );
}
