const GAS_URL = "https://script.google.com/macros/s/AKfycbym5zxW382G2enqHVpsEkltXSCeaWEXdWmUqpz11Wxfi2pxp8Pg2SP9RmCbfDLtPU6T/exec";

async function getApproveData(svrId) {
  const res = await fetch(`${GAS_URL}?action=getApproveData&svr=${svrId}`);
  return res.json();
}

async function submitFormData(payload) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function saveApprove(svrId, status, reason = "") {
  const url = `${GAS_URL}?action=saveApprove&svr=${svrId}&status=${status}&reason=${encodeURIComponent(reason)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "success") {
    Swal.fire('สำเร็จ', 'บันทึกผลอนุมัติเรียบร้อย', 'success');
  } else {
    Swal.fire('ล้มเหลว', data.message || 'บันทึกไม่สำเร็จ', 'error');
  }
}
