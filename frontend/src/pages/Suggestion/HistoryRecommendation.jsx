import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./HistoryRecommendation.module.css";

export default function HistoryRecommendation() {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API =
        (import.meta.env.VITE_API_URL || "") + "/api/ai/recommend/history";

    // 응답 아이템 정규화: id/title/description 통일
    const normalize = (x) => ({
        id: x?.challenge_id ?? x?.id,
        title:
            x?.title ??
            x?.challenge_title ??
            `챌린지 #${x?.challenge_id ?? x?.id ?? "?"}`,
        description: x?.description ?? x?.challenge_description ?? "",
        image_url: x?.image_url ?? null,
        raw: x, // 필요하면 원본도 보관
    });

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                setErr("");
                const { data } = await axiosInstance.post(
                    "/api/ai/recommend/history", // Node.js 라우터
                    {}, // 로그인 유저 기준
                    { withCredentials: true }
                );

                const list = Array.isArray(data) ? data : data.items || [];
                setItems(list.map(normalize).filter((it) => it.id)); // id 없는 건 제외
            } catch (e) {
                setErr(e.message);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    const goDetail = (id) => navigate(`/challenge/${id}`);

    return (
        <div className={styles.container}>
            {/* 본문 */}
            <div className={styles.wrapper}>
                {loading && <p className={styles.infoText}>불러오는 중…</p>}
                {err && <p className={styles.errorText}>⚠️ {err}</p>}
                {!loading && !err && items.length === 0 && (
                    <p className={styles.infoText}>추천 결과가 없습니다.</p>
                )}

                {items.length > 0 && (
                    <div className={styles.cardList}>
                        {items.map((c) => (
                            <article
                                key={c.id}
                                className={styles.card}
                                role="button"
                                tabIndex={0}
                                onClick={() => goDetail(c.id)}
                                onKeyDown={(e) =>
                                    (e.key === "Enter" || e.key === " ") &&
                                    goDetail(c.id)
                                }
                                style={{ cursor: "pointer" }}>
                                <h3 className={styles.cardTitle}>{c.title}</h3>
                                {c.description && (
                                    <p className={styles.cardDesc}>
                                        {c.description}
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
