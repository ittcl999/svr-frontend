// ✅ เปลี่ยนลิงก์ตรงนี้ให้เป็น Web App URL ของคุณ
const GAS_URL = "https://script.google.com/macros/s/AKfycbym5zxW382G2enqHVpsEkltXSCeaWEXdWmUqpz11Wxfi2pxp8Pg2SP9RmCbfDLtPU6T/exec";

// ✅ เรียกข้อมูลการอนุมัติ
async function getApproveData(svrId) {
  const res = await fetch(`${GAS_URL}?action=getApproveData&svr=${svrId}`);
  return res.json();
}

// ✅ ส่งข้อมูลคำขอ
async function submitFormData(payload) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// ✅ บันทึกผลการอนุมัติ
async function saveApprove(svrId, status, reason = "") {
  const url = `${GAS_URL}?action=saveApprove&svr=${svrId}&status=${status}&reason=${encodeURIComponent(reason)}`;
  const res = await fetch(url);
  return res.json();
}
