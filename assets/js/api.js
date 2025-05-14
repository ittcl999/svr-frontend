// เพิ่ม: ฟังก์ชันเชื่อมต่อ Google Apps Script Web App ผ่าน fetch

/**
 * เพิ่ม: ส่งข้อมูลฟอร์มคำขอเข้าพื้นที่
 * @param {Object} data – ข้อมูลฟอร์ม (payload)
 * @returns {Promise<Object>} ผลลัพธ์จาก GAS (JSON)
 */
async function submitForm(data) {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'submitForm',     // เพิ่ม: ระบุ action ให้ GAS รู้ว่าจะประมวลผลอะไร
      payload: data             // เพิ่ม: ส่งข้อมูลฟอร์มต้นทาง
    })
  });
  return response.json();
}

/**
 * เพิ่ม: ตรวจสอบข้อมูลผู้ร่วมงานจาก CID (Citizen ID)
 * @param {string} cid – หมายเลขบัตรประชาชน 13 หลัก
 * @returns {Promise<Object>} ข้อมูลผู้ร่วมงาน ถ้ามี
 */
async function checkWorkerCID(cid) {
  const response = await fetch(
    `${SCRIPT_URL}?action=checkWorkerCID&cid=${encodeURIComponent(cid)}`
  );
  return response.json();
}

/**
 * เพิ่ม: ดึงสถานะคำขอโดยใช้ SVR ID
 * @param {string} svrId – รหัสคำขอ
 * @returns {Promise<Object>} สถานะและรายละเอียดคำขอ
 */
async function getStatus(svrId) {
  const response = await fetch(
    `${SCRIPT_URL}?action=getStatus&svrId=${encodeURIComponent(svrId)}`
  );
  return response.json();
}

/**
 * เพิ่ม: บันทึกผลการอนุมัติหรือไม่อนุมัติคำขอ
 * @param {Object} payload – { svrId, status, reason }
 * @returns {Promise<Object>} ผลลัพธ์จาก GAS (JSON)
 */
async function approveRequest({ svrId, status, reason }) {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'approveRequest', // เพิ่ม: ระบุ action สำหรับการอนุมัติ
      payload: { svrId, status, reason }
    })
  });
  return response.json();
}
