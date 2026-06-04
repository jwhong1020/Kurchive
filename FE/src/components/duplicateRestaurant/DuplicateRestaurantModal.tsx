import { useNavigate } from "react-router-dom";
import type { DuplicateConflict } from "../../types/restaurantDuplicate";
import styles from "./DuplicateRestaurantModal.module.css";

type Props = {
  conflict: DuplicateConflict | null;
  onClose: () => void;
  /** 식당 등록 시에만: 그래도 등록 (force=true) */
  onForceSubmit?: () => void;
  forceSubmitting?: boolean;
};

export default function DuplicateRestaurantModal({
  conflict,
  onClose,
  onForceSubmit,
  forceSubmitting = false,
}: Props) {
  const navigate = useNavigate();

  if (!conflict) return null;

  const title =
    conflict.kind === "exact"
      ? "이미 등록된 식당입니다"
      : "비슷한 식당이 근처에 있습니다";

  const goToRestaurant = (id: number) => {
    onClose();
    navigate(`/restaurant/${id}`);
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dup-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="dup-modal-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.message}>{conflict.message}</p>
        </div>

        <div className={styles.list}>
          {conflict.candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.candidate}
              onClick={() => goToRestaurant(c.id)}
            >
              {c.thumbnail_url ? (
                <img src={c.thumbnail_url} alt="" className={styles.thumb} />
              ) : (
                <div className={styles.thumbPlaceholder}>사진 없음</div>
              )}
              <div className={styles.info}>
                <p className={styles.name}>{c.name}</p>
                {c.address ? (
                  <p className={styles.address}>{c.address}</p>
                ) : null}
                <p className={styles.meta}>
                  {typeof c.distance_m === "number"
                    ? `약 ${c.distance_m}m 거리`
                    : "등록된 식당"}
                  {c.is_name_similar ? " · 이름 유사" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          {onForceSubmit && conflict.kind === "nearby" ? (
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={forceSubmitting}
              onClick={onForceSubmit}
            >
              {forceSubmitting ? "등록 중..." : "그래도 새로 등록하기"}
            </button>
          ) : null}
          <button type="button" className={styles.primaryBtn} onClick={onClose}>
            입력 수정하기
          </button>
        </div>
      </div>
    </div>
  );
}
