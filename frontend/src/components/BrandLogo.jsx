export default function BrandLogo({ compact = false, light = false, className = '' }) {
  return (
    <div className={`brand-logo ${compact ? 'brand-logo--compact' : ''} ${light ? 'brand-logo--light' : ''} ${className}`.trim()}>
      <img src="/logos/skillmatch-logo.png" alt="SkillMatch" />
      {!compact && (
        <span className="brand-logo__copy">
          <strong>SkillMatch</strong>
          <small>Talento universitario</small>
        </span>
      )}
    </div>
  );
}
