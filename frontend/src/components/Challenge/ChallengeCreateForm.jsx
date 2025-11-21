import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "../../styles/Challenge/ChallengeCreateForm.module.css";

const ChallengeCreateForm = ({
    mode = "create",
    initialData = {},
    user_id,
}) => {
    console.log("ChallengeCreateForm user_id props:", user_id);
    const isEdit = mode === "edit";
    const navigate = useNavigate();

    // ────────────────── 1) 상태 선언 ──────────────────
    // (A) 관심사/진로 옵션 및 선택된 ID
    const [interestOptions, setInterestOptions] = useState([]);
    const [visionOptions, setVisionOptions] = useState([]);
    const [interestIds, setInterestIds] = useState(
        initialData.interestIds || []
    );
    const [visionIds, setVisionIds] = useState(initialData.visionIds || []);

    // (B) 텍스트 필드들
    const [title, setTitle] = useState(initialData.title || "");
    const [content, setContent] = useState(initialData.content || "");
    const [maximumPeople, setMaximumPeople] = useState(
        initialData.maximum_people || 1
    );
    const [minAge, setMinAge] = useState(initialData.minAge || 8);
    const [maxAge, setMaxAge] = useState(initialData.maxAge || 16);
    const [startDate, setStartDate] = useState(initialData.startDate || "");
    const [endDate, setEndDate] = useState(initialData.endDate || "");
    const [deadline, setDeadline] = useState(initialData.deadline || "");
    const [isRegular, setIsRegular] = useState(initialData.isRegular || "정기");
    const [repeatCycle, setRepeatCycle] = useState(
        initialData.repeatCycle || "주 1회"
    );
    const [allowJoinMid, setAllowJoinMid] = useState(
        initialData.allowJoinMid || "허용"
    );
    const [days, setDays] = useState(initialData.days || []);
    const [phone, setPhone] = useState(initialData.phone || "");
    const [status, setStatus] = useState(initialData.status || "모집중");

    // (C) 편집 모드: 기존 첨부파일 보여주기
    const [initialAttachments, setInitialAttachments] = useState([]);

    // (D) 새로 선택한 파일들
    const [photos, setPhotos] = useState([]); // 이미지
    const [consents, setConsents] = useState([]); // 동의서 (문서 or 이미지)

    const dayOptions = ["월", "화", "수", "목", "금", "토", "일"];

    const engToKor = {
        ACTIVE: "모집중",
        CLOSED: "마감",
        CANCELLED: "취소됨",
    };

    // ────────────────── 2) 관심사/진로 옵션 불러오기 ──────────────────
    useEffect(() => {
        axiosInstance
            .get("api/interests")
            .then((res) => setInterestOptions(res.data));
        axiosInstance
            .get("api/visions")
            .then((res) => setVisionOptions(res.data));
    }, []);

    // ────────────────── 3) 편집 모드 초기 세팅 ──────────────────
    useEffect(() => {
        if (isEdit && initialData && Object.keys(initialData).length > 0) {
            // (a) 기존 필드 초기화
            setTitle(initialData.title || "");
            setContent(initialData.content || initialData.description || "");
            setMaximumPeople(initialData.maximum_people || 1);
            setMinAge(initialData.minAge || initialData.minimum_age || 8);
            setMaxAge(initialData.maxAge || initialData.maximum_age || 16);
            setStartDate(
                initialData.startDate ||
                    initialData.duration?.start?.slice(0, 10) ||
                    ""
            );
            setEndDate(
                initialData.endDate ||
                    initialData.duration?.end?.slice(0, 10) ||
                    ""
            );
            setDeadline(
                initialData.deadline ||
                    initialData.application_deadline?.slice(0, 10) ||
                    ""
            );
            setIsRegular(
                initialData.isRegular !== undefined
                    ? initialData.isRegular
                    : initialData.is_recuming
                    ? "정기"
                    : "비정기"
            );
            setRepeatCycle(
                initialData.repeatCycle ||
                    (initialData.repeat_type === "WEEKLY"
                        ? "주 1회"
                        : initialData.repeat_type === "BIWEEKLY"
                        ? "격주"
                        : initialData.repeat_type === "MONTHLY"
                        ? "월 1회"
                        : "정기 아님")
            );
            setAllowJoinMid(
                initialData.allowJoinMid !== undefined
                    ? initialData.allowJoinMid
                    : initialData.intermediate_participation
                    ? "허용"
                    : "비허용"
            );
            setDays(
                initialData.days
                    ? initialData.days.map((d) => {
                          const map = {
                              Monday: "월",
                              Tuesday: "화",
                              Wednesday: "수",
                              Thursday: "목",
                              Friday: "금",
                              Saturday: "토",
                              Sunday: "일",
                          };
                          return map[d] || d;
                      })
                    : []
            );
            setPhone(initialData.phone || initialData.creator_contact || "");
            setStatus(
                initialData.status ||
                    engToKor[initialData.challenge_state] ||
                    initialData.challenge_state ||
                    "모집중"
            );

            setInterestIds(
                initialData.interestIds ||
                    (initialData.interests
                        ? initialData.interests.map(
                              (i) => i.interest_id || i.id
                          )
                        : [])
            );
            setVisionIds(
                initialData.visionIds ||
                    (initialData.visions
                        ? initialData.visions.map((v) => v.vision_id || v.id)
                        : [])
            );

            // (b) 기존 첨부파일 목록을 state에 담아둠
            if (initialData.attachments) {
                setInitialAttachments(initialData.attachments);
            }
        }
    }, [initialData, isEdit]);

    // ────────────────── 4) 체크박스 토글 ──────────────────
    const toggleInterest = (id) => {
        setInterestIds((ids) =>
            ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
        );
    };
    const toggleVision = (id) => {
        setVisionIds((ids) =>
            ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
        );
    };

    // ────────────────── 5) 첨부파일 삭제 핸들러 (편집 모드) ──────────────────
    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm("정말로 이 첨부파일을 삭제하시겠습니까?")) return;
        try {
            await axiosInstance.delete(`/api/attachments/${attachmentId}`);
            setInitialAttachments((prev) =>
                prev.filter((att) => att.attachment_id !== attachmentId)
            );
            toast("첨부파일이 삭제되었습니다.", {
                className: "my-toast",
                progressClassName: "custom-progress-bar",
            });
        } catch (err) {
            console.error("첨부파일 삭제 실패:", err.response || err);
            toast("첨부파일 삭제 중 오류가 발생했습니다.", {
                className: "my-toast",
                progressClassName: "custom-progress-bar",
            });
        }
    };

    // ────────────────── 6) 폼 제출 핸들러 ──────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        // (A) JSON 메타데이터 객체
        const reqBody = {
            title: title,
            description: content,
            minimum_age: minAge,
            maximum_age: maxAge,
            maximum_people: Number(maximumPeople),
            application_deadline: deadline ? deadline + "T23:59:59" : null,
            start_date: startDate ? startDate + "T07:00:00" : null,
            end_date: endDate ? endDate + "T07:30:00" : null,
            is_recuming: isRegular === "정기",
            repeat_type:
                isRegular === "정기"
                    ? repeatCycle === "주 1회"
                        ? "WEEKLY"
                        : repeatCycle === "격주"
                        ? "BIWEEKLY"
                        : repeatCycle === "월 1회"
                        ? "MONTHLY"
                        : "NONE"
                    : "NONE",
            intermediate_participation: allowJoinMid === "허용",
            days: days.map((d) => {
                switch (d) {
                    case "월":
                        return "Monday";
                    case "화":
                        return "Tuesday";
                    case "수":
                        return "Wednesday";
                    case "목":
                        return "Thursday";
                    case "금":
                        return "Friday";
                    case "토":
                        return "Saturday";
                    case "일":
                        return "Sunday";
                    default:
                        return d;
                }
            }),
            interestIds: interestIds,
            visionIds: visionIds,
            creator_contact: phone,
            user_id: user_id,
            ...(isEdit && {
                challenge_state: status === "모집중" ? "ACTIVE" : "CLOSED",
            }),
        };

        try {
            if (isEdit) {
                // ───────────────── 수정 모드 ─────────────────
                const challengeId = initialData.challenge_id;

                // (1) JSON PATCH
                await axiosInstance.patch(
                    `/api/challenges/${challengeId}`,
                    reqBody
                );

                // (2) photos / consents 업로드
                if (photos.length > 0 || consents.length > 0) {
                    const uploadForm = new FormData();
                    photos.forEach((f) => uploadForm.append("photos", f));
                    consents.forEach((f) => uploadForm.append("consents", f));

                    await axiosInstance.post(
                        `/api/challenges/${challengeId}/attachments`,
                        uploadForm,
                        { headers: { "Content-Type": "multipart/form-data" } }
                    );
                }

                toast("챌린지 수정 완료!", {
                    className: "my-toast",
                    progressClassName: "custom-progress-bar",
                });
            } else {
                // ───────────────── 생성 모드 ─────────────────
                const formData = new FormData();
                formData.append("meta", JSON.stringify(reqBody));
                photos.forEach((f) => formData.append("photos", f));
                consents.forEach((f) => formData.append("consents", f));

                await axiosInstance.post("/api/challenges", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast("챌린지 개설 신청 완료!", {
                    className: "my-toast",
                    progressClassName: "custom-progress-bar",
                });
            }

            navigate("/challenge");
        } catch (error) {
            console.error(error.response?.data || error.message);

            toast(error.response?.data?.error || "오류가 발생했습니다.", {
                className: "my-toast",
                progressClassName: "custom-progress-bar",
            });
        }
    };

    // ────────────────── 7) 렌더링 ──────────────────
    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.flexRow}>
                {/* ─────────── 왼쪽 컬럼 ─────────── */}
                <div className={styles.column}>
                    {/* 제목 */}
                    <div className={styles.field}>
                        <label className={styles.label}>제목</label>
                        <input
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* 내용 */}
                    <div className={styles.field}>
                        <label className={styles.label}>내용</label>
                        <textarea
                            className={styles.input}
                            style={{ minHeight: 90, resize: "vertical" }}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>

                    {/* 관심사 (복수 선택) */}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            관심사 선택 (복수 가능)
                        </label>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                            }}>
                            {interestOptions.map((opt) => (
                                <label
                                    key={opt.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "2px 6px",
                                        borderRadius: "6px",
                                        background: interestIds.includes(opt.id)
                                            ? "#c7d2fe"
                                            : "#f1f5f9",
                                        fontWeight: interestIds.includes(opt.id)
                                            ? 600
                                            : 400,
                                        cursor: "pointer",
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={interestIds.includes(opt.id)}
                                        onChange={() => toggleInterest(opt.id)}
                                    />
                                    {opt.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 진로(비전) (복수 선택) */}
                    <div className={styles.field} style={{ marginTop: 18 }}>
                        <label className={styles.label}>
                            진로(비전) 선택 (복수 가능)
                        </label>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                            }}>
                            {visionOptions.map((opt) => (
                                <label
                                    key={opt.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "2px 6px",
                                        borderRadius: "6px",
                                        background: visionIds.includes(opt.id)
                                            ? "#fcd34d"
                                            : "#f1f5f9",
                                        fontWeight: visionIds.includes(opt.id)
                                            ? 600
                                            : 400,
                                        cursor: "pointer",
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={visionIds.includes(opt.id)}
                                        onChange={() => toggleVision(opt.id)}
                                    />
                                    {opt.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 모집 인원 */}
                    <div className={styles.field}>
                        <label className={styles.label}>모집 인원</label>
                        <input
                            type="number"
                            min={1}
                            className={styles.input}
                            style={{ width: 120 }}
                            value={maximumPeople}
                            onChange={(e) =>
                                setMaximumPeople(
                                    e.target.value.replace(/\D/, "")
                                )
                            }
                            placeholder="모집 인원(최소 1)"
                            required
                        />
                    </div>

                    {/* 연령 */}
                    <div className={styles.field}>
                        <label className={styles.label}>연령</label>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}>
                                <span style={{ fontSize: 15, fontWeight: 500 }}>
                                    최소
                                </span>
                                <select
                                    value={minAge}
                                    onChange={(e) =>
                                        setMinAge(Number(e.target.value))
                                    }
                                    className={styles.ageInput}>
                                    {Array.from(
                                        { length: 9 },
                                        (_, i) => 8 + i
                                    ).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <span
                                style={{
                                    fontSize: 16,
                                    fontWeight: 400,
                                    margin: "0 5px",
                                }}>
                                ~
                            </span>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}>
                                <span style={{ fontSize: 15, fontWeight: 500 }}>
                                    최대
                                </span>
                                <select
                                    value={maxAge}
                                    onChange={(e) =>
                                        setMaxAge(Number(e.target.value))
                                    }
                                    className={styles.ageInput}>
                                    {Array.from(
                                        { length: 9 },
                                        (_, i) => 8 + i
                                    ).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 편집 모드일 때만: 상태 */}
                    {isEdit && (
                        <div className={styles.field}>
                            <label className={styles.label}>상태</label>
                            <div style={{ display: "flex", gap: 16 }}>
                                {["모집중", "마감", "취소됨"].map((s) => (
                                    <label
                                        key={s}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value={s}
                                            checked={status === s}
                                            onChange={() => setStatus(s)}
                                            style={{ accentColor: "#2563eb" }}
                                        />
                                        {s}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─────────── 오른쪽 컬럼 ─────────── */}
                <div className={styles.column}>
                    {/* 활동 일정 */}
                    <div className={styles.field}>
                        <label className={styles.label}>활동 일정</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={styles.input}
                            style={{ width: 160, display: "inline-block" }}
                        />
                        {"  ~  "}
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={styles.input}
                            style={{ width: 160, display: "inline-block" }}
                        />
                    </div>

                    {/* 신청 마감일 */}
                    <div className={styles.field}>
                        <label className={styles.label}>신청 마감일</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className={styles.input}
                            style={{ width: 160 }}
                        />
                    </div>

                    {/* 정기 여부 */}
                    <div className={styles.field}>
                        <label className={styles.label}>정기 여부</label>
                        <div style={{ display: "flex", gap: 16 }}>
                            {["정기", "비정기"].map((type) => (
                                <label
                                    key={type}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}>
                                    <input
                                        type="radio"
                                        name="isRegular"
                                        value={type}
                                        checked={isRegular === type}
                                        onChange={() => setIsRegular(type)}
                                        style={{ accentColor: "#2563eb" }}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 반복 주기 */}
                    {isRegular === "정기" && (
                        <div className={styles.field}>
                            <label className={styles.label}>반복 주기</label>
                            <div style={{ display: "flex", gap: 14 }}>
                                {["주 1회", "격주", "월 1회", "정기 아님"].map(
                                    (opt) => (
                                        <label
                                            key={opt}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}>
                                            <input
                                                type="radio"
                                                name="repeatCycle"
                                                value={opt}
                                                checked={repeatCycle === opt}
                                                onChange={() =>
                                                    setRepeatCycle(opt)
                                                }
                                                style={{
                                                    accentColor: "#2563eb",
                                                }}
                                            />
                                            {opt}
                                        </label>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* 중도 참여 */}
                    <div className={styles.field}>
                        <label className={styles.label}>중도 참여</label>
                        <div style={{ display: "flex", gap: 16 }}>
                            {["허용", "비허용"].map((opt) => (
                                <label
                                    key={opt}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}>
                                    <input
                                        type="radio"
                                        name="allowJoinMid"
                                        value={opt}
                                        checked={allowJoinMid === opt}
                                        onChange={() => setAllowJoinMid(opt)}
                                        style={{ accentColor: "#2563eb" }}
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 요일 선택 */}
                    <div className={styles.field}>
                        <label className={styles.label}>요일</label>
                        <div style={{ display: "flex", gap: 10 }}>
                            {dayOptions.map((d) => (
                                <label
                                    key={d}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                    }}>
                                    <input
                                        type="checkbox"
                                        checked={days.includes(d)}
                                        onChange={() =>
                                            setDays(
                                                days.includes(d)
                                                    ? days.filter(
                                                          (x) => x !== d
                                                      )
                                                    : [...days, d]
                                            )
                                        }
                                        style={{ accentColor: "#2563eb" }}
                                    />
                                    {d}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 전화번호 */}
                    <div className={styles.field}>
                        <label className={styles.label}>개설자 전화번호</label>
                        <input
                            className={styles.input}
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value.replace(/[^0-9-]/g, ""))
                            }
                            placeholder="010-1234-5678"
                        />
                    </div>

                    {/* ── 기존 첨부파일 목록 (편집 모드) ── */}
                    {isEdit && initialAttachments.length > 0 && (
                        <div className={styles.field} style={{ marginTop: 18 }}>
                            <label className={styles.label}>
                                기존 첨부파일
                            </label>
                            <ul style={{ paddingLeft: 20, margin: 0 }}>
                                {initialAttachments.map((att) => (
                                    <li
                                        key={att.attachment_id}
                                        style={{
                                            marginBottom: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}>
                                        <a
                                            href={`${import.meta.env.VITE_API_URL.replace(
                                                /\/api\/?$/,
                                                ""
                                            )}${att.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: "#2563eb",
                                                textDecoration: "underline",
                                            }}>
                                            {att.attachment_name}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDeleteAttachment(
                                                    att.attachment_id
                                                )
                                            }
                                            style={{
                                                background: "#f87171",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "2px 8px",
                                                fontSize: 12,
                                                cursor: "pointer",
                                            }}>
                                            삭제
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ── 새 사진 업로드 (multiple) ── */}
                    <div className={styles.field} style={{ marginTop: 18 }}>
                        <label className={styles.label}>사진 업로드</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                                setPhotos(Array.from(e.target.files))
                            }
                        />
                        {photos.length > 0 && (
                            <div style={{ marginTop: 5, color: "#444" }}>
                                {photos.map((f, idx) => (
                                    <div key={idx}>{f.name}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── 새 동의서 업로드 (multiple) ── */}
                    <div className={styles.field} style={{ marginTop: 18 }}>
                        <label className={styles.label}>
                            보호자 동의서 업로드
                        </label>
                        <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            multiple
                            onChange={(e) =>
                                setConsents(Array.from(e.target.files))
                            }
                        />
                        {consents.length > 0 && (
                            <div style={{ marginTop: 5, color: "#444" }}>
                                {consents.map((f, idx) => (
                                    <div key={idx}>{f.name}</div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 등록/수정 버튼 */}
            <button
                type="submit"
                className={styles.button}
                style={{ marginTop: 20 }}>
                {isEdit ? "수정" : "등록"}
            </button>
        </form>
    );
};

export default ChallengeCreateForm;
