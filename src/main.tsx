import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { KvittraApp } from "./kvittra/KvittraApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="h-screen w-screen">
      <KvittraApp />
    </div>
  </StrictMode>,
);
