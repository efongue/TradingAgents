import React from "react";

export default function ParameterCard({ className = "", icon: Icon, title, children }) {
  return (
    <article className={`parameter-card ${className}`}>
      <div className="parameter-card-title">
        {Icon ? <Icon size={18} /> : null}
        <h3>{title}</h3>
      </div>
      <div className="parameter-card-content">{children}</div>
    </article>
  );
}
