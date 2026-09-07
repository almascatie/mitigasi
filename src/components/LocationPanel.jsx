export default function LocationPanel({
  location,
  onGPS,
  onManual,
  onRemove,
}) {
  const hasLocation =
    location &&
    typeof location.lng === "number" &&
    typeof location.lat === "number";

  return (
    <section className="location-panel">
      <div className="location-panel-head">
        <div>
          <span className="eyebrow">
            LOKASI SAYA
          </span>

          <h2>
            Titik awal
          </h2>
        </div>

        <span className="location-status">
          {hasLocation
            ? "Tersimpan"
            : "Belum diatur"}
        </span>
      </div>

      {hasLocation ? (
        <>
          <div className="location-summary">
            <div className="location-symbol">
              ⌖
            </div>

            <div>
              <strong>
                Lokasi tersimpan
              </strong>

              <p>
                {location.lat.toFixed(6)},{" "}
                {location.lng.toFixed(6)}
              </p>
            </div>
          </div>

          <div className="location-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onGPS}
            >
              Perbarui GPS
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={onManual}
            >
              Pilih di peta
            </button>

            {onRemove && (
              <button
                type="button"
                className="text-button danger-text"
                onClick={onRemove}
              >
                Hapus lokasi
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="location-description">
            Tentukan lokasi Anda. Lokasi ini
            digunakan sebagai fokus awal ketika
            peta dibuka.
          </p>

          <div className="location-actions">
            <button
              type="button"
              className="primary-button"
              onClick={onGPS}
            >
              Gunakan lokasi HP
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={onManual}
            >
              Pilih manual di peta
            </button>
          </div>
        </>
      )}
    </section>
  );
}