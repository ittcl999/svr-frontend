// form_svr.js (โครงสร้างเบื้องต้น จะจัดตาม logic ปัจจุบัน)

// 👉 ตรงนี้ใช้แทน google.script.run
async function postToGAS(payload) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });
    return await res.json();
  } catch (err) {
    throw new Error("การเชื่อมต่อกับระบบล้มเหลว");
  }
}

// ✅ ใช้แทน google.script.run.findWorkerFromCID
async function fetchWorkerByCID(cid) {
  try {
    const url = `${SCRIPT_URL}?action=checkWorkerFromCID&cid=${cid}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    return null;
  }
}

// 🔁 ต่อไปจะย้ายฟังก์ชัน: 
// - formatIDCard
// - checkWorkerFromCID
// - addPersonnelField / updatePersonnelLabels
// - submitForm
// - validateForm
// - clearSignature / resizeCanvas
// - nextPrev / showTab

// 📌 เมื่อย้ายเสร็จ จะสามารถลิงก์จาก form_svr.html ได้แบบ:
// <script src="js/form_svr.js"></script>

// ✅ โปรดรอติดตามส่วนที่ 2: ฟังก์ชันเต็ม
