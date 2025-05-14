// ✅ scan.js | Logic เดิม 100% จาก scan.html

let token = "";

function onScanSuccess(qrMessage) {
  if (!qrMessage) {
    Swal.fire({ 
      icon: 'error', 
      title: '❌ ไม่พบข้อมูลใน QR Code', 
      html: `<div style="margin-top: 10px;">กรุณา Scan QR Code (New)</div>`,
      confirmButtonText: '🔄 Scan QR Code (New)',
      width: 'clamp(300px,90%,420px)', 
      customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
    }).then(() => resetScanner());
    return;
  }

  html5QrcodeScanner.clear();
  document.getElementById('reader').style.display = 'none';

  token = extractToken(qrMessage);

  if (!token) {
    Swal.fire({
      icon: 'error',
      title: '❌ ไม่พบ Token',
      html: `<div style="margin-top: 10px;">QR Code นี้ไม่ถูกต้อง</div>`,
      confirmButtonText: '🔄 Scan QR Code (New)',
      width: 'clamp(300px,90%,420px)',
      customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
    }).then(() => resetScanner());
    return;
  }

  Swal.fire({
    title: 'กำลังตรวจสอบข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    customClass: { popup: 'swal2-border', title: 'swal2-title-custom' }
  });

  google.script.run
    .withSuccessHandler(function(data) {
      Swal.close();
      if (!data || !data.found) {
        Swal.fire({ 
          icon: 'error', 
          title: '❌ ไม่พบข้อมูล', 
          text: 'Token นี้ไม่มีอยู่ในระบบ', 
          confirmButtonText: '🔄 Scan QR Code (New)',
          width: 'clamp(300px,90%,420px)', 
          customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
        }).then(() => resetScanner());
        return;
      }

      showScanInfo(data);
    })
    .withFailureHandler(function(err) {
      Swal.fire({ 
        icon: 'error', 
        title: '❌ เกิดข้อผิดพลาด', 
        text: err.message || String(err), 
        width: 'clamp(300px,90%,420px)', 
        confirmButtonColor: '#2563eb', 
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
    })
    .getScanInfoByToken(token);
}

function extractToken(raw) {
  try {
    if (raw.includes("?token=")) {
      const urlObj = new URL(raw);
      return urlObj.searchParams.get("token") || "";
    } else {
      return raw.trim();
    }
  } catch {
    return raw.trim();
  }
}

function showScanInfo(data) {
  const infoDiv = document.getElementById('info');
  const buttonsDiv = document.getElementById('buttons');
  const checkinBtn = document.getElementById('checkin');
  const checkoutBtn = document.getElementById('checkout');

  infoDiv.style.display = 'block';
  infoDiv.innerHTML = `
    <div class="info-row"><span class="info-label">📄 หมายเลขคำขอ : </span><div class="info-value">${data.noSVR || '-'}</div></div>
    <div class="info-row"><span class="info-label">👤 ชื่อผู้ร้องขอ : </span><div class="info-value">${data.requester || data.name || '-'}</div></div>
    <div class="info-row"><span class="info-label">🆔 เลขบัตรประชาชน : </span><div class="info-value">${data.idCard || '-'}</div></div>
    <div class="info-row"><span class="info-label">🏢 บริษัท : </span><div class="info-value">${data.company || '-'}</div></div>
    <div class="info-row"><span class="info-label">📞 โทรศัพท์ : </span><div class="info-value">${data.phone || '-'}</div></div>
    <div class="info-row"><span class="info-label">📧 Email : </span><div class="info-value">${data.email || '-'}</div></div>
    <div class="info-row"><span class="info-label">🏗️ โครงการ : </span><div class="info-value">${data.project || '-'}</div></div>
    <div class="info-row"><span class="info-label">🎯 วัตถุประสงค์ : </span><div class="info-value">${data.purpose || '-'}</div></div>
    <div class="info-row"><span class="info-label">📅 วันที่เริ่มต้น : </span><div class="info-value">${data.dateStart || '-'}</div></div>
    <div class="info-row"><span class="info-label">📅 วันที่สิ้นสุด : </span><div class="info-value">${data.dateEnd || '-'}</div></div>
    <div class="info-row"><span class="info-label">⏰ เวลาเริ่มต้น : </span><div class="info-value">${data.timeIn || '-'}</div></div>
    <div class="info-row"><span class="info-label">⏰ เวลาสิ้นสุด : </span><div class="info-value">${data.timeOut || '-'}</div></div>
    <div class="info-row"><span class="info-label">✅ Check-In : </span><div class="info-value">${data.checkin || '-'}</div></div>
    <div class="info-row"><span class="info-label">✅ Check-Out : </span><div class="info-value">${data.checkout || '-'}</div></div>
    <div class="info-row"><span class="info-label">📌 สถานะผลการอนุมัติ : </span><div class="info-value">${data.status || '-'}</div></div>
    ${data.status === "ไม่อนุมัติ" ? `<div class="info-row"><span class="info-label">❌ เหตุผลที่ไม่อนุมัติ : </span><div class="info-value" style="color:#dc2626;">${data.reason || '-'}</div></div>` : ""}
  `;

  if (data.checkin && data.checkout) {
    buttonsDiv.style.display = 'none';
    infoDiv.innerHTML += `
      <div class="locked-wrapper">
        <p class="locked">✅ ได้ทำการ Check-In และ Check-Out ครบแล้ว</p>
        <button onclick="resetScanner()" class="scan-again-btn">🔄 Scan QR Code (New)</button>
      </div>
    `;
  } else {
    checkinBtn.style.display = (!data.checkin) ? 'block' : 'none';
    checkoutBtn.style.display = (data.checkin && !data.checkout) ? 'block' : 'none';
    buttonsDiv.style.display = 'flex';

    if (!document.querySelector('#buttons .scan-again-btn')) {
      const scanBtn = document.createElement('button');
      scanBtn.textContent = '🔄 สแกน QR Code ใหม่';
      scanBtn.className = 'scan-again-btn';
      scanBtn.style.marginTop = '10px';
      scanBtn.onclick = resetScanner;
      buttonsDiv.appendChild(scanBtn);
    }
  }
}

function submitScanAction(type) {
  Swal.fire({
    title: 'กำลังบันทึก...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px,90%,420px)',
    customClass: { popup: 'swal2-border', title: 'swal2-title-custom' }
  });

  google.script.run
    .withSuccessHandler(function(res) {
      Swal.close();
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: '✅ สำเร็จ',
          html: `
            <div style="font-size: 1.05rem; color: #333;">
              <p>📅 <b>วันที่:</b> ${res.time.split(' ')[0]}</p>
              <p>🕒 <b>เวลา:</b> ${res.time.split(' ')[1]}</p>
              <p>✅ คุณได้ทำ <b>${type === 'in' ? 'Check-In' : 'Check-Out'}</b> เรียบร้อยแล้ว</p>
            </div>
          `,
          confirmButtonColor: '#2563eb',
          customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
        }).then(() => {
          Swal.fire({
            title: '🔄 กำลังอัปเดตข้อมูล...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
            customClass: { popup: 'swal2-border', title: 'swal2-title-custom' }
          });

          google.script.run
            .withSuccessHandler(function(data) {
              Swal.close();
              if (data && data.found) showScanInfo(data);
            })
            .withFailureHandler(function(err) {
              Swal.fire({
                icon: 'error',
                title: '❌ เกิดข้อผิดพลาด',
                text: err.message || String(err),
                confirmButtonColor: '#2563eb',
                customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
              });
            })
            .getScanInfoByToken(token);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '❌ ล้มเหลว',
          text: res.message || '',
          width: 'clamp(300px,90%,420px)',
          confirmButtonColor: '#2563eb',
          customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
        });
      }
    })
    .withFailureHandler(function(err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: '❌ เกิดข้อผิดพลาด',
        text: err.message || String(err),
        width: 'clamp(300px,90%,420px)',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
    })
    .submitScan(token, type);
}

function resetScanner() {
  document.getElementById('info').style.display = 'none';
  document.getElementById('buttons').style.display = 'none';
  document.getElementById('reader').style.display = 'block';
  document.getElementById('info').innerHTML = '';
  html5QrcodeScanner.clear().then(() => {
    html5QrcodeScanner.render(onScanSuccess);
  }).catch(err => {
    console.error("❌ รีเซ็ตกล้องล้มเหลว:", err);
  });
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess);
