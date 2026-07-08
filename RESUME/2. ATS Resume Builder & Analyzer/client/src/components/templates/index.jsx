import { forwardRef } from "react";
import ModernTemplate from "./ModernTemplate.jsx";
import ClassicTemplate from "./ClassicTemplate.jsx";
import MinimalTemplate from "./MinimalTemplate.jsx";
import ElegantTemplate from "./ElegantTemplate.jsx";
import "./resume.css";

export const TEMPLATES = [
  { id: "modern", name: "Modern", Component: ModernTemplate },
  { id: "classic", name: "Classic", Component: ClassicTemplate },
  { id: "minimal", name: "Minimal", Component: MinimalTemplate },
  { id: "elegant", name: "Elegant", Component: ElegantTemplate },
];

export const ACCENTS = [
  "#2563eb",
  "#0ea5e9",
  "#7c3aed",
  "#db2777",
  "#059669",
  "#ea580c",
  "#0f172a",
];

// Renders the chosen template with the accent colour applied via CSS variable.
const ResumePreview = forwardRef(function ResumePreview({ data }, ref) {
  const tpl = TEMPLATES.find((t) => t.id === data.template) || TEMPLATES[0];
  const Template = tpl.Component;
  return (
    <div ref={ref} style={{ "--accent": data.accent || "#2563eb" }}>
      <Template data={data} />
    </div>
  );
});

export default ResumePreview;
