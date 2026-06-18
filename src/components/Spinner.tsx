export function Spinner() {
  return (
    <span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.25)",borderTop:"2px solid currentColor",borderRadius:"50%",animation:"spin .8s linear infinite",display:"inline-block",flexShrink:0 }} />
  );
}
