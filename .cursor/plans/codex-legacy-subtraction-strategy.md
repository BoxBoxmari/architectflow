# Plan CodeX: Chiến lược “trừ lớp” — Legacy baseline vs `quality_audit`

**Mục tiêu:** Hướng dẫn CodeX (hoặc dev) thực thi từng bước theo tinh thần **loại bỏ phần không phù hợp**, **dùng lại cái đã có** (`quality_audit/core/legacy_audit/`, cờ trong `feature_flags.py`, `audit_service`), **không phức tạp hóa**, **không phát minh kiến trúc mới**.

**Baseline tham chiếu:** `legacy/main.py` (hành vi & phân loại “chuẩn cũ”).

**Nguồn sự thật trong repo:** `quality_audit/services/audit_service.py`, `quality_audit/config/feature_flags.py`, `quality_audit/core/legacy_audit/engine.py`, `quality_audit/core/legacy_audit/router.py`, `docs/parity/baseline-policy.md`, `tests/parity/`.

---

## A. Situation (Bối cảnh)

- **Đã có sẵn:** `LegacyAuditEngine` (`legacy_audit/engine.py`) route bảng qua `route_table` (router) rồi gọi **cùng các validator hiện tại** (BS/IS/CF/equity/tax/generic) — không phải chạy lại toàn bộ `legacy/main.py` trong runtime chính.
- **Cờ điều khiển:** `baseline_authoritative_default`, `legacy_parity_mode`, `legacy_bug_compatibility_mode` (và các biến thể env) trong `get_feature_flags()`; `audit_service._validate_single_table` chỉ set `use_legacy_as_authority` khi `baseline_authoritative_default` **và** (`legacy_bug_compatibility_mode` **hoặc** `legacy_parity_mode`).
- **Rủi ro đã ghi nhận:** Một số chỗ (ví dụ `generic_validator.py`, một phần `base_validator.py`) dùng `.get("legacy_parity_mode", True)` — **lệch** với default `False` trong `feature_flags.py` nếu dict cờ thiếu key → có thể bật parity ngầm.
- **Chiến lược sản phẩm:** Cần **một quyết định rõ** (xem mục H): production coi “đúng” là parity với baseline legacy hay đường classifier mặc định — ảnh hưởng default cờ và test kỳ vọng.

---

## B. Delegation Plan (WBS — không gọi subagent thật; đây là vai trò tương đương)

| Giai đoạn | Vai trò | Việc làm |
|-----------|---------|----------|
| P0 | Kiến trúc / trace | Đọc `audit_service` → `LegacyAuditEngine` → `router` → validator; map với `legacy/main.py` (chỉ để so khớp rule routing, không copy code). |
| P1 | Parity / baseline | Đối chiếu `docs/parity/baseline-policy.md`, `parity/baselines/`, script freeze/gap nếu có. |
| P2 | Code (trừ lớp) | Thống nhất default cờ; xóa/giảm nhánh trùng; chỉ sửa khi có test hoặc baseline chứng minh. |
| P3 | Test | `pytest tests/parity/`, regression liên quan cờ; không đổi snapshot/golden mù. |
| P4 | Review | PR nhỏ, checklist an toàn dữ liệu. |
| P5 | Verify | `ruff check .`, `pytest` (theo `pyproject.toml`). |

---

## C. Results Digest (Kết luận kỹ thuật ngắn)

- **Không** cần “port” lại monolith `legacy/main.py` vào runtime: đã có **lớp adapter** `legacy_audit/`.
- **Cần** “trừ”: (1) drift default cờ giữa modules, (2) logic song song không còn dùng khi baseline authoritative, (3) doc/test không khớp default thực tế.
- **Engine** hiện tại = router legacy + validator hiện đại; parity = **routing + tham số validator** khớp baseline, không phải duplicate engine thứ hai.

---

## D. Integrated Decisions (Quyết định tích hợp — CodeX phải chốt trước khi sửa default)

1. **Default runtime (không env):** Giữ `baseline_authoritative_default=False` và `legacy_parity_mode=False` trong `feature_flags.py` **trừ khi** product quyết định đổi (khi đó cập nhật tests + README/parity doc cùng lúc).
2. **Khi dict `feature_flags` thiếu key:** Toàn codebase phải đồng nhất với `get_feature_flags()` hoặc default **False** cho các cờ legacy — **không** default `True` riêng lẻ.
3. **Mọi thay đổi hành vi observable:** Một PR riêng + cập nhật `docs/parity/` hoặc `docs/legacy_parity/` + test.

---

## E. Action Plan — Cầm tay chỉ việc cho CodeX

### E0 — Chuẩn bị (30–60 phút)

1. Checkout branch: `git checkout -b chore/legacy-subtraction-flags` (tên tùy team).
2. Đọc tuần tự (không bỏ bước):
   - `legacy/main.py` (chỉ phần routing / constants / table sets liên quan phân loại).
   - `quality_audit/core/legacy_audit/router.py`
   - `quality_audit/core/legacy_audit/engine.py`
   - `quality_audit/services/audit_service.py` (hàm `_validate_single_table` và chỗ merge `feature_flags`)
   - `quality_audit/config/feature_flags.py`
3. Ghi lại 1 bảng “**Khi nào** `use_legacy_as_authority` = True” (copy điều kiện từ code, không diễn giải).

### E1 — PR-1: Thống nhất default cờ (P0, diff nhỏ)

**Mục tiêu:** Loại bỏ mâu thuẫn `.get(..., True)` vs `feature_flags` default `False`.

1. `rg "legacy_parity_mode" quality_audit/` — liệt kê tất cả call site.
2. Với mỗi file:
   - Nếu đã có `get_feature_flags()` đầy đủ: dùng kết quả đó, **không** `.get` riêng.
   - Nếu buộc `.get` trên dict tùy ý: đổi default thành **`False`** (hoặc merge dict với output của `get_feature_flags()` trước khi đọc).
3. Ưu tiên sửa: `quality_audit/core/validators/generic_validator.py`, `quality_audit/core/validators/base_validator.py` (và bất kỳ file nào `rg` tìm thấy default `True`).
4. **Không** thêm abstraction mới; chỉ sửa điều kiện đọc cờ.

**Verify sau PR-1:**

```bash
cd "c:\Users\Admin\Downloads\Quality Audit Tool"
ruff check quality_audit tests
pytest tests/parity/ tests/test_feature_flags_parity_force.py tests/test_audit_service_legacy_engine_default.py -q
```

**Pass criteria:** Không fail mới; nếu fail do kỳ vọng test cũ dựa trên default sai → cập nhật test **chỉ khi** product xác nhận default mới đúng (xem mục H).

### E2 — PR-2: Dọn “song song” có chứng cứ (chỉ khi grep chứng minh dead)

**Mục tiêu:** Xóa nhánh/classifier hoặc helper **không còn được gọi** khi đã bật `use_legacy_as_authority`, hoặc trùng với router.

1. Từ `audit_service`, trace mọi đường tới `ValidatorFactory` vs `legacy_engine.validate_table`.
2. Với từng khối nghi ngờ trùng: `rg` tên hàm → nếu chỉ test cũ dùng → cập nhật test rồi xóa.
3. **Cấm** xóa hàng loạt nếu chưa có `pytest` xanh cho module đó.

**Verify:** Cùng lệnh E1 + thêm test file module bị đụng:

```bash
pytest tests/test_generic_validator.py tests/test_base_validator.py -q
```

### E3 — PR-3: Tài liệu & ma trận cờ (đồng bộ một lần)

1. Cập nhật `README.md` hoặc `docs/parity/baseline-policy.md`: bảng env → `get_feature_flags()` → `use_legacy_as_authority`.
2. Nếu có script CLI/UI đọc cờ: grep `FEATURE_FLAG`, `legacy_parity`, `BASELINE` trong `quality_audit/cli.py`, `quality_audit/ui_ctk/`, `run_gui.bat` — chỉ sửa text/help string nếu sai default.

**Verify:** Không cần pytest nếu chỉ doc; optional `pytest tests/ui/` nếu đụng UI.

### E4 — PR-4 (tuỳ chọn): Baseline JSON / gap report

Chỉ khi team parity yêu cầu: chạy script có sẵn trong `scripts/` (đọc `scripts/freeze_parity_baseline.py`, `scripts/gap_report.py` từ README) và attach artifact vào PR — **không** tự viết pipeline mới.

---

## F. Verification Checklist (Verifier — áp dụng sau mỗi PR)

| # | Lệnh / kiểm tra | Pass khi |
|---|-----------------|----------|
| F1 | `ruff check quality_audit tests` | exit 0 |
| F2 | `pytest tests/parity/ -q` | exit 0 |
| F3 | `pytest tests/test_audit_service_baseline_context_isolation.py tests/test_audit_service_legacy_engine_default.py -q` | exit 0 |
| F4 | `pytest tests/ -q` (trước merge main) | exit 0 |
| F5 | Diff review: không secret, không đổi public API không ghi ADR | reviewer OK |

**Lưu ý:** Lệnh `pytest tests/` có thể lâu; trên máy dev có thể chạy tập con trước, full suite trên CI.

---

## G. Risk / Rollback

| Rủi ro | Dấu hiệu | Rollback |
|--------|----------|----------|
| Đổi default cờ làm lệch audit production | Khách hàng báo sai/warn khác hàng loạt | Revert PR-1; set env tạm `BASELINE_AUTHORITATIVE_DEFAULT` / parity theo policy cũ |
| Xóa nhánh “tưởng dead” | Test integration fail | Revert PR-2; khôi phục hàm từ git |
| Doc sai | Confusion triage | PR chỉ sửa doc |

---

## H. Open questions (phải trả lời trước khi đổi default cờ)

1. **Sản phẩm:** Runtime mặc định (không env) có phải là “classifier hiện đại” và chỉ bật legacy authority khi cấu hình rõ không?
2. **Nếu đáp án (1) là có:** PR-1 **bắt buộc** default `False` thống nhất; tests fail → sửa test theo policy mới.
3. **Nếu đáp án (1) là không (mặc định phải parity):** Đổi `DEFAULT_FLAGS` trong `feature_flags.py` **và** cập nhật toàn bộ test/docs trong **cùng một PR** — tránh drift.

---

## Meta: Subagent workflow (đã áp dụng khi soạn tài liệu)

- Intake: baseline `legacy/main.py` + đường đi `audit_service` → `legacy_audit`.
- WBS: PR nhỏ theo cờ → dọn dead → doc → optional baseline scripts.
- Verify: bảng F.
- Persist: file này tại `.cursor/plans/codex-legacy-subtraction-strategy.md`.

**Trạng thái hoàn thành plan (không phải hoàn thành code):** Deliverable là tài liệu này + `todos.md` — không phát `<promise>DONE</promise>` của Ralph loop cho đến khi các PR trên đã chạy verify thực tế.
