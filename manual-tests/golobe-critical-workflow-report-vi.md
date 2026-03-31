    # Golobe Travel Agency (localhost) — Báo Cáo Kiểm Thử Thủ Công Luồng Nghiệp Vụ Quan Trọng

**Ngày kiểm thử:** 2026-03-31  
**Người kiểm thử:** GitHub Copilot (Playwright MCP)  
**Môi trường:** Localhost (`http://localhost:3000`)  
**Trình duyệt:** Playwright Chromium

---

## Tóm Tắt

Luồng nghiệp vụ quan trọng nhất của hệ thống đặt vé máy bay đã được kiểm thử end-to-end và **hoàn tất thành công**, bao gồm: tìm chuyến bay -> xem kết quả -> xem chi tiết -> đăng nhập -> điền thông tin hành khách -> thiết lập tùy chọn -> review -> thanh toán Stripe -> trang thành công.

Các luồng chính (happy path) đều đi qua được. Có một số vấn đề không chặn hoàn toàn luồng thanh toán nhưng cần ưu tiên xử lý để cải thiện độ ổn định và UX.

---

## Kịch Bản 1 — Truy Cập Trang Chủ

- **Các bước thực hiện:**
  1. Truy cập `http://localhost:3000`.
  2. Kiểm tra các thành phần chính (hero, tab Flights/Stays, navigation).

- **Kết quả:**
  - Trang chủ tải thành công.
  - Hiển thị đầy đủ bố cục chính và menu điều hướng.

- **Vấn đề ghi nhận:** Không.

---

## Kịch Bản 2 — Tìm Chuyến Bay

- **Các bước thực hiện:**
  1. Vào trang `/flights`.
  2. Chọn hành trình một chiều LHR -> ATL, ngày đi `2026-04-01`, hạng `economy`, 1 người lớn.
  3. Điều hướng tới URL tìm kiếm đã encode đúng định dạng tham số hệ thống.

- **Kết quả:**
  - Trang kết quả tải thành công với danh sách chuyến bay hợp lệ.
  - Có bộ lọc, sắp xếp, và hiển thị giá vé.

- **Vấn đề ghi nhận:**
  - Một số thẻ kết quả hiển thị thời gian theo placeholder `hh:mm aaa` thay vì giờ thực tế.

---

## Kịch Bản 3 — Xem Chi Tiết Chuyến Bay

- **Các bước thực hiện:**
  1. Chọn chuyến `EK0835` từ kết quả.
  2. Mở trang chi tiết chuyến bay.
  3. Kiểm tra thông tin hãng bay, thời gian, giá, cổng/terminal.

- **Kết quả:**
  - Trang chi tiết hiển thị đầy đủ và chính xác hơn so với card kết quả.
  - Nút `Book Now` hoạt động và điều hướng đúng sang trang đặt chỗ.

- **Vấn đề ghi nhận:** Không.

---

## Kịch Bản 4 — Kiểm Tra Xác Thực (Authentication Gate)

- **Các bước thực hiện:**
  1. Truy cập trang đặt chỗ khi chưa đăng nhập.
  2. Xác nhận hệ thống yêu cầu đăng nhập/đăng ký.
  3. Đăng nhập bằng tài khoản test: `playwright.test@golobe.local`.

- **Kết quả:**
  - Cơ chế chặn người dùng chưa đăng nhập hoạt động đúng.
  - Đăng nhập thành công và quay lại luồng đặt chỗ.

- **Vấn đề ghi nhận:** Không.

---

## Kịch Bản 5 — Đặt Vé Bước 1 (Passenger Details)

- **Các bước thực hiện:**
  1. Điền thông tin hành khách:
     - First Name: `Test`
     - Last Name: `Playwright`
     - DOB: `15 Jan 1990`
     - Passport Number: `A12345678`
     - Passport Expiry: `15 Jan 2029`
     - Country: `United Kingdom`
     - Gender: `Male`
     - Phone: `5551234567`
  2. Nhấn `Continue`.

- **Kết quả:**
  - Chuyển thành công sang tab `passenger_preferences`.

- **Vấn đề ghi nhận:**
  - Trường hợp hiếm gặp: giao diện hiển thị đã có First/Last Name nhưng session state chưa cập nhật, gây báo lỗi "First name is required" / "Last name is required". Sau khi đồng bộ lại state thì tiếp tục bình thường.

---

## Kịch Bản 6 — Đặt Vé Bước 2 (Preferences)

- **Các bước thực hiện:**
  1. Giữ tùy chọn mặc định (ghế, hành lý, bữa ăn, hỗ trợ đặc biệt).
  2. Nhấn `Continue`.

- **Kết quả:**
  - Chuyển thành công sang tab `review`.

- **Vấn đề ghi nhận:** Không.

---

## Kịch Bản 7 — Đặt Vé Bước 3 (Review)

- **Các bước thực hiện:**
  1. Kiểm tra lại toàn bộ thông tin hành khách và fare summary.
  2. Nhấn `Reserve & Pay`.

- **Kết quả:**
  - Điều hướng sang tab `payment`.
  - Hiển thị trạng thái giữ chỗ và form thanh toán Stripe.

- **Vấn đề ghi nhận:**
  - Nếu reservation hết hạn (`00:00`), hệ thống có thể báo đã tồn tại booking chưa xử lý cho cùng chuyến bay và yêu cầu thanh toán booking cũ.

---

## Kịch Bản 8 — Thanh Toán End-to-End (Stripe)

- **Các bước thực hiện:**
  1. Điền form Stripe (trong iframe):
     - Card: `4242 4242 4242 4242`
     - Expiry: `12/29`
     - CVC: `123`
     - ZIP: `12345`
  2. Nhấn `Pay 704.81 USD`.

- **Kết quả:**
  - Điều hướng thành công tới:
    - `/success?title=Payment+successful...`
  - Trang success hiển thị:
    - Heading: `Payment successful`
    - Message: `Your payment was successful`
    - Link: `Download ticket`

- **Vấn đề ghi nhận:**
  - Nếu thiếu ZIP, Stripe báo `Your ZIP is invalid` và không cho submit (hành vi đúng).

---

## Lỗi Console Quan Sát Được

| Mức độ | Mô tả | Ảnh hưởng |
|--------|------|-----------|
| Error/Warning | Có ghi nhận lỗi và cảnh báo trong console trong quá trình chạy | Trung bình-thấp: không chặn hoàn tất luồng thanh toán, nhưng cần rà soát để tăng độ ổn định và giảm nhiễu theo dõi lỗi |

> Ghi chú: Trong phiên kiểm thử này, các lỗi console không ngăn cản việc hoàn tất booking và thanh toán thành công.

---

## Tổng Hợp Kết Quả

| Luồng | Kết quả |
|------|--------|
| Truy cập trang chủ | ✅ Pass |
| Tìm kiếm chuyến bay | ✅ Pass |
| Xem danh sách kết quả | ✅ Pass |
| Xem chi tiết chuyến bay | ✅ Pass |
| Chặn chưa đăng nhập + đăng nhập thành công | ✅ Pass |
| Bước Passenger Details | ✅ Pass |
| Bước Preferences | ✅ Pass |
| Bước Review | ✅ Pass |
| Thanh toán Stripe -> Success | ✅ Pass |

**Kết luận:** Luồng nghiệp vụ quan trọng đã chạy thành công end-to-end. Các vấn đề còn lại chủ yếu thuộc nhóm ổn định trạng thái form, xử lý reservation hết hạn, và hiển thị thời gian trên card kết quả.