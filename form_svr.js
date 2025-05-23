// form_svr.js (Full logic แยกจาก HTML)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym5zxW382G2enqHVpsEkltXSCeaWEXdWmUqpz11Wxfi2pxp8Pg2SP9RmCbfDLtPU6T/exec';

// 🔁 POST to GAS
// ✅ JSONP version of postToGAS
async function postToGAS(payload) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });
  return res.json();
}

// 🔍 Fetch worker by CID
function fetchWorkerByCID(cid) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonpCallback_${Date.now()}`;
    const script = document.createElement('script');
    
    window[callbackName] = function (res) {
      clearTimeout(timeout); // ✅ ยกเลิก timeout ถ้ามาก่อน
      resolve(res);
      delete window[callbackName];
      document.body.removeChild(script);
    };

    script.src = `${SCRIPT_URL}?action=checkWorkerFromCID&cid=${cid}&callback=${callbackName}`;
    script.onerror = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error("โหลดข้อมูลไม่สำเร็จ"));
    };

    document.body.appendChild(script);

    // ✅ ตั้ง timeout กันโหลดนานเกิน
    const timeout = setTimeout(() => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error("หมดเวลารอข้อมูลจากระบบ"));
    }, 5000);
  });
}




function formatIDCard(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 13);
  el.dataset.raw = v;
  el.value = v.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5');
}

function addPersonnelField() {
  const container = document.getElementById('personnel-list');
  const row = document.createElement('div');
  row.className = 'person-row';

  const group = document.createElement('div');
  group.className = 'id-input-group';

  const input = document.createElement('input');
  input.type = 'text';
  input.required = true;
  input.maxLength = 17;
  input.dataset.raw = '';
  input.placeholder = '';
  input.oninput = async function () {
    formatIDCard(this);
    const cid = this.dataset.raw;
    const row = this.closest('.person-row');
    const det = row.querySelector('.worker-details');
    if (cid.length === 13) {
      document.getElementById('checking').style.display = 'block';
      const res = await fetchWorkerByCID(cid);
      document.getElementById('checking').style.display = 'none';
      det.innerHTML = '';

      if (res?.fullName) {
        [['fullName', 'ชื่อ-นามสกุล'], ['company', 'บริษัท'], ['phone', 'เบอร์โทร'], ['email', 'Email']]
          .forEach(([key, labelText]) => {
            if (!res[key]) return;
            const div = document.createElement('div');
            div.className = 'input-field';
            const input = document.createElement('input');
            input.type = 'text';
            input.readOnly = true;
            input.value = res[key];
            const label = document.createElement('label');
            label.className = 'active';
            label.textContent = labelText;
            div.append(input, label);
            det.append(div);
          });
        this.dataset.name = res.fullName;
        this.dataset.company = res.company;
        this.dataset.phone = res.phone;
        this.dataset.email = res.email;
      } else {
        const div = document.createElement('div');
        div.className = 'input-field';
        const status = document.createElement('span');
        status.style.color = 'red';
        status.style.fontWeight = 'bold';
        status.textContent = '❌ ไม่พบข้อมูล';
        div.append(status);
        det.append(div);
      }
    } else {
      this.dataset.name = '';
      this.dataset.company = '';
      this.dataset.phone = '';
      this.dataset.email = '';
      det.innerHTML = '';
    }
  };

  const label = document.createElement('label');
  label.className = 'active person-label';
  label.textContent = '';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '✕';
  removeBtn.onclick = () => {
    container.removeChild(row);
    updatePersonnelLabels();
  };

  group.append(input, label, removeBtn);
  row.append(group);

  const details = document.createElement('div');
  details.className = 'worker-details';
  row.append(details);

  container.append(row);
  updatePersonnelLabels();
}

function updatePersonnelLabels() {
  const rows = document.querySelectorAll('#personnel-list .person-row');
  rows.forEach((row, index) => {
    const label = row.querySelector('.person-label');
    const input = row.querySelector('input[type="text"]');
    label.textContent = `#${index + 1}`;
    input.placeholder = `เลขบัตรประชาชน #${index + 1}`;
  });
}

function clearSignature(){
      const c=document.getElementById('signature-pad');
      c.getContext('2d').clearRect(0,0,c.width,c.height);
    }
    function resizeCanvas(){
      const c=document.getElementById('signature-pad');
      c.width=c.clientWidth; c.height=150;
    }
    window.addEventListener("load", () => {
      const canvas = document.getElementById("signature-pad");
      const ctx = canvas.getContext("2d");

      function resizeCanvas() {
        // ปรับ canvas.width/height ให้ตรงกับขนาดที่ CSS กำหนด
        canvas.width  = canvas.clientWidth;
        canvas.height = 150;
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      // ปิดการเลื่อนหน้าเมื่อปัดบน canvas
      canvas.style.touchAction = 'none';

      let drawing = false, lastX = 0, lastY = 0;
      function start(e) {
        drawing = true;
        const pt = e.touches ? e.touches[0] : e;
        const rect = canvas.getBoundingClientRect();
        lastX = pt.clientX - rect.left;
        lastY = pt.clientY - rect.top;
        e.preventDefault();
      }
      function move(e) {
        if (!drawing) return;
        const pt = e.touches ? e.touches[0] : e;
        const rect = canvas.getBoundingClientRect();
        const x = pt.clientX - rect.left;
        const y = pt.clientY - rect.top;
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        lastX = x; lastY = y;
        e.preventDefault();
      }

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("touchstart", start);
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("touchmove", move);
      canvas.addEventListener("mouseup",   () => drawing = false);
      canvas.addEventListener("touchend", () => drawing = false);
      canvas.addEventListener("mouseout", () => drawing = false);
    });



let currentTab = 0;

document.addEventListener("DOMContentLoaded", () => {
  showTab(currentTab);
  resizeCanvas();
});

function showTab(n) {
  const tabs = document.getElementsByClassName('tab');
  Array.from(tabs).forEach(t => t.classList.remove('active'));
  tabs[n].classList.add('active');
  document.getElementById('prevBtn').style.display = (n === 0 ? 'none' : 'inline');
  document.getElementById('nextBtn').innerText = (n === tabs.length - 1 ? 'ส่งคำร้อง' : 'ถัดไป');
  if (n === 4) resizeCanvas();
  const ind = document.querySelector('.step-indicator');
  ind.innerHTML = '';
  for (let i = 0; i < tabs.length; i++) {
    const dot = document.createElement('span');
    if (i === n) dot.classList.add('active');
    ind.appendChild(dot);
  }
}

function nextPrev(n) {
  const tabs = document.getElementsByClassName('tab');
  if (n === 1 && !validateForm()) return;
  tabs[currentTab].classList.remove('active');
  currentTab += n;
  if (currentTab >= tabs.length) {
    submitForm();
    return;
  }
  showTab(currentTab);
}

function validateForm() {
  const fieldNames = {
    input1: "เลขบัตรประชาชน",
    input2: "ชื่อ-นามสกุล",
    input3: "บริษัท",
    input4: "เบอร์โทร",
    input5: "Email",
    input6: "เกี่ยวกับโครงการ/ระบบ",
    input7: "วัตถุประสงค์",
    input8: "วันที่เริ่มต้น",
    input9: "วันที่สิ้นสุด",
    Time_in: "เวลาเริ่มต้น",
    Time_out: "เวลาสิ้นสุด"
  };

  const inputs = document.querySelectorAll('.tab.active input[required], .tab.active textarea[required]');
  for (const inp of inputs) {
    const val = inp.value.trim();
    let label = fieldNames[inp.id] || 'ที่ช่องว่าง';
    if (!val) {
      Swal.fire({
        icon: 'warning',
        title: `กรุณากรอก "${label}"`,
        html: `<span style="color:red">จำเป็นต้องกรอก ${label}</span><br>ก่อนดำเนินการต่อ`,
        width: 'clamp(300px, 90%, 420px)',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
      return false;
    }

    if (inp.id === 'input1') {
      const cid = inp.dataset.raw || '';
      if (cid.length !== 13) {
        Swal.fire({
          icon: 'warning',
          title: '❌ เลขบัตรประชาชนไม่ถูกต้อง',
          html: `<span style="color:red">กรุณากรอกเลขบัตรให้ครบ 13 หลัก</span>`,
          width: 'clamp(300px, 90%, 420px)',
          confirmButtonColor: '#2563eb',
          customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
        });
        return false;
      }
    }

    if (inp.id === 'input5') {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(val)) {
            Swal.fire({
              icon: 'warning',
              title: '❌ รูปแบบ Email ไม่ถูกต้อง',
              html: `<span style="color:red">โปรดกรอก Email ให้ถูกต้อง เช่น user@example.com</span>`,
              width: 'clamp(300px, 90%, 420px)',
              confirmButtonColor: '#2563eb',
              customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
            });
            return false;
          }
        }
      }
  

  // ✅ Step 2: เวลาและวันที่
  if (currentTab === 1) {
    const t1 = document.getElementById('Time_in').value;
    const t2 = document.getElementById('Time_out').value;
    if (t1 && t2 && t1 >= t2) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น',
        width: 'clamp(300px, 90%, 420px)',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
      return false;
    }

    const d1 = document.getElementById('input8').value;
    const d2 = document.getElementById('input9').value;
    if (d1 && d2 && d2 < d1) {
      Swal.fire({
        icon: 'warning',
        title: '❌ วันที่สิ้นสุดไม่ถูกต้อง',
        html: `<span style="color:red">วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น</span>`,
        width: 'clamp(300px, 90%, 420px)',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
      return false;
    }
  }

  // ✅ Step 3: ตรวจผู้ร่วมงาน
  if (currentTab === 2) {
        const people = document.querySelectorAll('#personnel-list .person-row');
        if (people.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: '⚠️ กรุณาเพิ่มผู้ร่วมเข้างานอย่างน้อย 1 คน',
            html: `<span style="color:red">ต้องมีรายชื่อผู้ร่วมเข้างาน</span><br>ก่อนดำเนินการต่อ`,
            width: 'clamp(300px, 90%, 420px)',
            confirmButtonColor: '#2563eb',
            customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
          });
          return false;
        }

        for (let i = 0; i < people.length; i++) {
          const row = people[i];
          const inp = row.querySelector('input[type=text]');
          const cid = inp?.dataset.raw || '';
          const name = inp?.dataset.name || '';
          const num = i + 1;

          if (cid.length !== 13) {
            Swal.fire({
              icon: 'warning',
              title: `❌ กรอกเลขบัตรประชาชนไม่ครบ`,
              html: `<span style="color:red">ช่องเลขบัตรประชาชนลำดับที่ #${num}<br>กรุณากรอกให้ครบ 13 หลัก</span>`,
              width: 'clamp(300px, 90%, 420px)',
              confirmButtonColor: '#2563eb',
              customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
            });
            return false;
          }

          if (!name) {
            Swal.fire({
              icon: 'error',
              title: `❌ ไม่พบข้อมูลผู้ร่วมเข้างาน`,
              html: `<span style="color:red">ไม่สามารถดำเนินการต่อได้<br>เนื่องจากผู้ร่วมเข้างานลำดับ #${num} ไม่มีข้อมูลในระบบ</span><br>ให้ทำการแบบทดสอบประเมินความเข้าใจ<br><a href="tested.html" target="_blank">คลิกเพื่อเข้าสู่แบบทดสอบ</a>`,
              width: 'clamp(300px, 90%, 420px)',
              confirmButtonColor: '#2563eb',
              customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
            });
            return false;
          }
        }
      }

  // ✅ Step 4: ต้องแนบหนังสือนำ
  if (currentTab === 3) {
    const file1 = document.getElementById('file1').files[0];
    if (!file1) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ กรุณาแนบไฟล์หนังสือนำ',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
      return false;
    }
  }

  // ✅ Step 5: ตรวจลายเซ็น
  if (currentTab === 4) {
        const chk = document.getElementById('agreeTerms');
        const canvas = document.getElementById('signature-pad');
        const ctx = canvas.getContext('2d');

        if (!chk.checked) {
          Swal.fire({
            icon: 'warning',
            title: '⚠️ กรุณายอมรับเงื่อนไข',
            html: `<span style="color:red">อ่านเงื่อนไขและข้อตกลงก่อนส่งคำร้อง</span>`,
            width: 'clamp(300px, 90%, 420px)',
            confirmButtonColor: '#2563eb',
            customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
          });
          return false;
        }

        // ✅ ตรวจสอบว่าลายเซ็นว่างหรือไม่จริง ๆ
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let isSigned = false;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] !== 0 && (pixels[i] !== 255 || pixels[i + 1] !== 255 || pixels[i + 2] !== 255)) {
            isSigned = true;
            break;
          }
        }

        if (!isSigned) {
          Swal.fire({
            icon: 'warning',
            title: '⚠️ กรุณาลงลายเซ็นก่อนคำร้อง',
            html: `<span style="color:red">โปรดลงลายมือชื่อในช่องที่กำหนด</span>`,
            width: 'clamp(300px, 90%, 420px)',
            confirmButtonColor: '#2563eb',
            customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
          });
          return false;
        }
      }

  return true;
}

function showTermsPopup() {
  Swal.fire({
    icon: 'info',
    title: '🔐 เงื่อนไขและข้อตกลงก่อนส่งคำร้อง',
    html: `
      <div style="text-align: left; font-size: 1rem; color: #374151; line-height: 1.6;">
        เพื่อความมั่นคงปลอดภัยของระบบสารสนเทศและพื้นที่ควบคุม<br>
        บริษัท ขนส่ง จำกัด ขอให้ผู้ยื่นคำร้องทุกท่าน โปรดพิจารณาข้อกำหนดต่อไปนี้อย่างรอบคอบ :<br><br>

        ✅ <strong>ยืนยันว่าได้ศึกษาและเข้าใจ</strong> แนวทางปฏิบัติตาม<br>
        <a href="https://drive.google.com/file/d/1Z5cbRfR9T9CL9t024MkmxzyLrROAvn9y/view" target="_blank"
          style="color: #2563eb; font-weight: bold; text-decoration: none;">
          📘 คู่มือความมั่นคงปลอดภัยสำหรับผู้รับเหมาและบุคคลภายนอก</a><br><br>

        🛑 <strong>ข้อมูลที่กรอกแบบฟอร์มนั้น</strong> จะถูกใช้เพื่อประกอบการพิจารณาอนุญาตเข้าห้อง Server Room<br>
        🚫 <span style="color:red;"><strong>การแจ้งข้อมูลอันเป็นเท็จหรือปลอมแปลงเอกสาร</strong> อาจมีความผิดตามกฎหมาย</span><br><br>

        การส่งแบบฟอร์มนี้ถือเป็นการ <strong>ยอมรับและตกลงตามเงื่อนไขข้างต้นโดยสมบูรณ์</strong>
      </div>
    `,
    confirmButtonText: 'รับทราบ',
    width: 'clamp(320px, 95%, 500px)',
    confirmButtonColor: '#2563eb',
    customClass: {
      title: 'swal2-title-custom',
      popup: 'swal2-border'
    }
  });
}



async function submitForm() {
  const form = document.getElementById('regForm');

  if (!document.getElementById('agreeTerms').checked) {
    Swal.fire({
      icon: 'warning',
      title: 'กรุณายอมรับเงื่อนไข',
      text: 'คุณต้องยอมรับเงื่อนไขก่อนส่งคำร้อง',
      confirmButtonColor: '#2563eb',
      customClass: { popup: 'swal2-border', title: 'swal2-title-custom' }
    });
    return;
  }

  Swal.fire({
    title: 'กำลังส่งคำร้องขอ...',
    text: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px, 90%, 420px)',
    customClass: { popup: 'swal2-border', title: 'swal2-title-custom' }
  });

  try {
    // อ่านไฟล์เป็น base64
    const encodeFile = file => new Promise(resolve => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        content: reader.result.split(',')[1]
      });
      reader.readAsDataURL(file);
    });

    const file1 = document.getElementById('file1').files[0];
    const file2 = document.getElementById('file2').files[0];

    const file1Data = await encodeFile(file1);
    const file2Data = await encodeFile(file2);

    // ลายเซ็น base64
    const canvas = document.getElementById('signature-pad');
    const signatureData = canvas.toDataURL('image/png').split(',')[1];

    // ดึงรายการผู้ร่วมงาน
    const personnelList = Array.from(document.querySelectorAll('.person-row')).map(row => {
      const input = row.querySelector('input[type="text"]');
      return { cid: input.dataset.raw };
    });

    const payload = {
      input1: form.input1.value,
      input2: form.input2.value,
      input3: form.input3.value,
      input4: form.input4.value,
      input5: form.input5.value,
      input6: form.input6.value,
      input7: form.input7.value,
      input8: form.input8.value,
      input9: form.input9.value,
      Time_in: form.Time_in.value,
      Time_out: form.Time_out.value,
      input10_1: form.input10_1.checked,
      input10_2: form.input10_2.checked,
      input12: form.input12.value,
      file1: file1Data,
      file2: file2Data,
      signature: signatureData,
      personnelList
    };

    const result = await postToGAS(payload);
    Swal.close();

    if (result?.status === "success") {
      Swal.fire({
        icon: 'success',
        title: 'ส่งคำร้องเรียบร้อยแล้ว',
        html: `หมายเลขคำร้อง: <b>${result.noSVR}</b>`,
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      }).then(() => {
        window.location.href = `${SCRIPT_URL}?action=viewStatus&cid=${result.svrId}`;
      });
    } else {
      throw new Error(result?.message || "ไม่สามารถส่งคำร้องได้");
    }
  } catch (err) {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: '❌ ส่งคำร้องไม่สำเร็จ',
      text: err.message || 'เกิดข้อผิดพลาด',
      confirmButtonColor: '#dc2626',
      customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
    });
  }
}

