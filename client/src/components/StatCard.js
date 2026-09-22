function StatCard({ icon, title, value, subtitle, type = "" }) {
  return (
    <div className="card">
      <div className={`card-icon ${type}`}>
        {icon}
      </div>

      <div>
        <p>{title}</p>

        <h2>{value}</h2>

        <span className={type === "green" ? "positive" : ""}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export default StatCard;