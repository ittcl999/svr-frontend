// approve.js (ใช้ fetch แทน google.script.run พร้อม SweetAlert2)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym5zxW382G2enqHVpsEkltXSCeaWEXdWmUqpz11Wxfi2pxp8Pg2SP9RmCbfDLtPU6T/exec'; // 🔁 เปลี่ยนเป็น URL จริงของคุณ
const svrId = new URLSearchParams(location.search).get('svrId');

async function loadData() {
  Swal.fire({
    title: 'กำลังประมวลผล',
    html: 'กรุณารอสักครู่...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px, 90%, 420px)',
    confirmButtonColor: '#2563eb',
    customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
  });

  try {
    const res = await fetch(`${SCRIPT_URL}?action=getApproveData&svrId=${encodeURIComponent(svrId)}`);
    const data = await res.json();
    Swal.close();

    if (!data || !data.found) {
      Swal.fire('❌ ไม่พบข้อมูล', 'ไม่สามารถโหลดข้อมูลได้', 'error');
      return;
    }

    document.getElementById('main-container').style.display = 'block';
    const container = document.getElementById('details');
    container.innerHTML = `
      <div class="info-row"><span>📄 หมายเลขคำขอ :</span> ${data.noSVR}</div>
      <div class="info-row"><span>👤 ชื่อผู้ร้องขอ :</span> ${data.requester}</div>
      <div class="info-row"><span>🆔 เลขบัตรประชาชน :</span> ${data.idCard}</div>
      <div class="info-row"><span>🏢 บริษัท :</span> ${data.company}</div>
      <div class="info-row"><span>📞 โทรศัพท์ :</span> ${data.phone}</div>
      <div class="info-row"><span>📧 Email :</span> ${data.email}</div>
      <div class="info-row"><span>🏗️ โครงการ :</span> ${data.project}</div>
      <div class="info-row"><span>🎯 วัตถุประสงค์ :</span> ${data.purpose}</div>
      <div class="info-row"><span>📅 วันที่เริ่มต้น :</span> ${data.dateStart}</div>
      <div class="info-row"><span>📅 วันที่สิ้นสุด :</span> ${data.dateEnd}</div>
      <div class="info-row"><span>⏰ เวลาเริ่มต้น :</span> ${data.timeIn}</div>
      <div class="info-row"><span>⏰ เวลาสิ้นสุด :</span> ${data.timeOut}</div>
      <div class="info-row" id="pdf1Row"><span>📄 PDF :</span> <a id="pdf1Link" href="#" target="_blank">เอกสาร (ก่อนผลการอนุมัติ)</a></div>
      <div class="info-row" id="pdf2Row" style="display:none;"><span>📄 PDF :</span> <a id="pdf2Link" href="#" target="_blank">เอกสาร (ผลการอนุมัติ)</a></div>
    `;

    document.getElementById('pdf1Link').href = data.pdf1 || '#';
    document.getElementById('pdf2Link').href = data.pdf2 || '#';

    if (data.approveStatus === 'อนุมัติ' || data.approveStatus === 'ไม่อนุมัติ') {
      document.getElementById('pdf1Row').style.display = 'none';
      document.getElementById('pdf2Row').style.display = data.pdf2 ? 'block' : 'none';
    } else {
      document.getElementById('pdf1Row').style.display = data.pdf1 ? 'block' : 'none';
      document.getElementById('pdf2Row').style.display = 'none';
    }

    const approvalSection = document.getElementById('approvalSection');
    const approvalStatus = document.getElementById('approvalStatus');

    if (data.approveStatus === '' || data.approveStatus === 'รออนุมัติ') {
      approvalSection.style.display = 'block';
      approvalStatus.innerHTML = '';
    } else {
      approvalSection.style.display = 'none';
      approvalStatus.innerHTML = data.approveStatus === 'อนุมัติ'
        ? `✅ คำขอนี้ได้รับการอนุมัติแล้ว<br>เมื่อ ${data.approvalTimestamp || 'ไม่ระบุเวลา'}`
        : `❌ คำขอนี้ถูกปฏิเสธ<br>เหตุผล: ${data.reasonReject || 'ไม่ระบุเหตุผล'}<br>เมื่อ ${data.approvalTimestamp || 'ไม่ระบุเวลา'}`;
    }
  } catch (err) {
    Swal.fire('❌ เกิดข้อผิดพลาด', err.message || String(err), 'error');
  }
}

async function submitApproval() {
  const choice = document.querySelector('input[name="approval"]:checked');
  if (!choice) {
    Swal.fire({ icon: 'warning', title: '⚠️ กรุณาเลือกผลการอนุมัติ', confirmButtonColor: '#2563eb', customClass: { title: 'swal2-title-custom', popup: 'swal2-border' } });
    return;
  }

  const status = choice.value;
  const reason = document.getElementById('reason').value.trim();

  if (status === 'ไม่อนุมัติ' && !reason) {
    Swal.fire({ icon: 'warning', title: '⚠️ กรุณาระบุเหตุผลหากไม่อนุมัติ', confirmButtonColor: '#2563eb', customClass: { title: 'swal2-title-custom', popup: 'swal2-border' } });
    return;
  }

  Swal.fire({
    title: 'กำลังบันทึกผลการอนุมัติ',
    html: 'โปรดรอสักครู่ ระบบกำลังดำเนินการ',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px, 90%, 420px)',
    confirmButtonColor: '#2563eb',
    customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
  });

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveApproveNew', svrId, status, reason })
    });
    const result = await res.json();

    Swal.close();
    if (result.status === 'success') {
      Swal.fire({
        icon: 'success',
        title: '✅ บันทึกผลการอนุมัติสำเร็จ!',
        html: '<span style="color:green">ระบบได้ดำเนินการสร้างเสร็จสมบูรณ์</span>',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      }).then(() => {
        loadData();
        document.getElementById('approvalSection').style.display = 'none';
      });
    } else {
      Swal.fire({ icon: 'error', title: '❌ บันทึกไม่สำเร็จ', confirmButtonColor: '#2563eb', customClass: { title: 'swal2-title-custom', popup: 'swal2-border' } });
    }
  } catch (err) {
    Swal.close();
    Swal.fire({ icon: 'error', title: '❌ เกิดข้อผิดพลาด', text: err.message || String(err), confirmButtonColor: '#2563eb', customClass: { title: 'swal2-title-custom', popup: 'swal2-border' } });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  document.querySelectorAll('input[name="approval"]').forEach(el => {
    el.addEventListener('change', () => {
      const value = document.querySelector('input[name="approval"]:checked')?.value;
      document.getElementById('reason-box').style.display = (value === 'ไม่อนุมัติ') ? 'block' : 'none';
    });
  });
});
