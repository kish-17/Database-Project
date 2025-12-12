import React from 'react';

const Input = ({ type, placeholder, value, onChange, label }) => {
  return (
    <div className="auth-input-group">
      {label && <label className="auth-input-label">{label}</label>}
      <input
        type={type}
        className="auth-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;

