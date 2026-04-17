"use client";

export default function ClientHome() {
  return (
    <div style={{ padding: 40 }}>
      <h1>App carregou ✅</h1>
      <button onClick={() => alert("clicou")}>
        Teste botão
      </button>
    </div>
  );
}
