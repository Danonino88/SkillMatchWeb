const normalize = (values = []) => {
  const safe = values.map((value) => Math.max(0, Number(value) || 0));
  const max = Math.max(...safe, 1);
  return safe.map((value) => ({ value, height: Math.max(8, Math.round((value / max) * 92)) }));
};

export default function DashboardInsights({
  title = 'Resumen de actividad',
  subtitle = 'Lectura rápida del desempeño actual',
  labels = [],
  values = [],
  progress = 72,
  progressLabel = 'Avance general',
}) {
  const bars = normalize(values);
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (safeProgress / 100) * circumference;

  return (
    <section className="dashboard-insights" aria-label={title}>
      <div className="insight-panel insight-panel--chart">
        <div className="insight-panel__head">
          <div>
            <span className="insight-kicker">ANÁLISIS</span>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <span className="insight-live"><i /> Actualizado</span>
        </div>

        <div className="mini-chart" role="img" aria-label={`${title}: ${values.join(', ')}`}>
          {bars.map((bar, index) => (
            <div className="mini-chart__item" key={`${labels[index] || 'dato'}-${index}`}>
              <span className="mini-chart__value">{bar.value}</span>
              <div className="mini-chart__track">
                <span style={{ height: `${bar.height}%`, animationDelay: `${index * 90}ms` }} />
              </div>
              <small>{labels[index] || `Dato ${index + 1}`}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-panel insight-panel--progress">
        <span className="insight-kicker">PROGRESO</span>
        <div className="progress-ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" className="progress-ring__base" />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="progress-ring__value"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div><strong>{safeProgress}%</strong><span>{progressLabel}</span></div>
        </div>
        <p className="insight-note">Consulta las métricas y mantén tus actividades al día.</p>
      </div>
    </section>
  );
}
