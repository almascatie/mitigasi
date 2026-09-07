export default function RouteManager({
  routes = [],
  selectedRouteId = null,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <section className="route-manager">
      <div className="route-manager-head">
        <div>
          <span className="eyebrow">
            RUTE SAYA
          </span>

          <h2>
            Jalur evakuasi
          </h2>

          <p>
            Buat dan simpan sebanyak rute
            yang Anda perlukan.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={onCreate}
        >
          + Buat rute
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            ↗
          </div>

          <strong>
            Belum ada rute
          </strong>

          <p>
            Buat rute evakuasi pertama
            dengan menggambar jalurnya
            langsung di peta.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={onCreate}
          >
            Buat rute pertama
          </button>
        </div>
      ) : (
        <div className="route-list">
          {routes.map((route, index) => {
            const selected =
              route.id === selectedRouteId;

            const pointCount =
              Array.isArray(route.coordinates)
                ? route.coordinates.length
                : 0;

            const informationCount =
              Array.isArray(route.points)
                ? route.points.length
                : 0;

            const obstacleCount =
              Array.isArray(route.obstacles)
                ? route.obstacles.length
                : 0;

            return (
              <article
                key={route.id}
                className={`route-card ${
                  selected
                    ? "route-card-selected"
                    : ""
                }`}
                onClick={() =>
                  onSelect?.(route)
                }
              >
                <div className="route-card-number">
                  {index + 1}
                </div>

                <div className="route-card-content">
                  <div className="route-card-title">
                    <strong>
                      {route.name ||
                        `Rute ${index + 1}`}
                    </strong>
                  </div>

                  {route.description && (
                    <p>
                      {route.description}
                    </p>
                  )}

                  <div className="route-card-meta">
                    <span>
                      {pointCount} titik jalur
                    </span>

                    <span>
                      {informationCount} titik
                    </span>

                    <span>
                      {obstacleCount} rintangan
                    </span>
                  </div>
                </div>

                <div className="route-card-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit?.(route);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger-text"
                    onClick={(event) => {
                      event.stopPropagation();

                      const confirmed =
                        window.confirm(
                          `Hapus "${route.name}"?`
                        );

                      if (confirmed) {
                        onDelete?.(route);
                      }
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}