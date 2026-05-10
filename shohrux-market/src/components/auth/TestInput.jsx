import { useState } from "react";

function TestInput() {
  const [text, setText] = useState("");

  console.log("TestInput render, text:", text);

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      padding: 30,
      borderRadius: 10,
      zIndex: 99999,
      boxShadow: '0 0 50px rgba(0,0,0,0.5)'
    }}>
      <h3>TEST INPUT - Bu yerda yozing</h3>
      <input
        type="text"
        value={text}
        onChange={(e) => {
          console.log("ONCHANGE:", e.target.value);
          setText(e.target.value);
        }}
        style={{
          width: 300,
          padding: 10,
          fontSize: 16,
          border: '2px solid blue',
          borderRadius: 8,
          marginTop: 10
        }}
        autoFocus
      />
      <p style={{ marginTop: 10, color: 'green' }}>
        Siz yozgan: "{text}"
      </p>
      <button 
        onClick={() => setText("")}
        style={{ marginTop: 10, padding: '5px 15px', background: 'red', color: 'white', border: 'none', borderRadius: 5 }}
      >
        Tozalash
      </button>
    </div>
  );
}

export default TestInput;