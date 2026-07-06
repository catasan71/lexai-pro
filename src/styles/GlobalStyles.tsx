export function GlobalStyles() {
  return (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;-webkit-text-size-adjust:100%;}
    body{background:#070d1a;color:#e2e8f0;overflow-x:hidden;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-track{background:#0f172a;}
    ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
    select option{background:#0f172a;color:#e2e8f0;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.35;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes slideUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    input:focus,select:focus,textarea:focus{border-color:#818cf8!important;box-shadow:0 0 0 2px rgba(129,140,248,.15);}
    input::placeholder,textarea::placeholder{color:#475569;}
    button{-webkit-tap-highlight-color:transparent;}
  `}</style>
  );
}
