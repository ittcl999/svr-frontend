const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbym5zxW382G2enqHVpsEkltXSCeaWEXdWmUqpz11Wxfi2pxp8Pg2SP9RmCbfDLtPU6T/exec";
let questions = [];

function jsonpRequest(url, callbackName) {
  const script = document.createElement('script');
  script.src = `${url}&callback=${callbackName}`;
  document.body.appendChild(script);
}

async function startQuiz(event) {
  const startButton = event.target;
  startButton.disabled = true;
  startButton.style.display = "none";

  const idCardRaw = document.getElementById("idCard").value.trim();
  const idCard = idCardRaw.replace(/\D/g, "");
  const name = document.getElementById("name").value.trim();
  const company = document.getElementById("company").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  const requiredFields = [
    { value: idCard, label: 'เลขบัตรประชาชน', length: 13 },
    { value: name, label: 'ชื่อ-นามสกุล' },
    { value: company, label: 'บริษัท' },
    { value: phone, label: 'เบอร์โทรศัพท์' }
  ];

  for (const field of requiredFields) {
    if (!field.value || (field.length && field.value.length !== field.length)) {
      Swal.fire({
        icon: 'warning',
        title: `กรุณากรอก "${field.label}" ให้ถูกต้อง`,
        html: `<span style="color:red">จำเป็นต้องกรอกข้อมูลให้ครบถ้วน</span>`,
        width: 'clamp(300px, 90%, 420px)',
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
      startButton.disabled = false;
      startButton.style.display = "inline-block";
      return;
    }
  }

  Swal.fire({
    title: 'กำลังตรวจสอบข้อมูล...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px, 90%, 420px)',
    customClass: { popup: 'swal2-border', title: 'swal2-title-custom' }
  });

  const callbackCheck = `jsonpCheckStatus_${Date.now()}`;
  window[callbackCheck] = function (status) {
    delete window[callbackCheck];
    Swal.close();

    if (status.tested) {
      Swal.fire({
        icon: 'info',
        title: 'ได้ทำแบบทดสอบไปแล้ว',
        html: `<span style="font-size: 1em; color: #ff0000;">พบว่าหมายเลขบัตรประชาชนดังกล่าว</span><br>
               มีการทำแบบทดสอบเรียบร้อยแล้ว<br>
               สามารถเข้าสอบครั้งถัดไปได้ใน<br>
               <span style="font-size: 1em; color: #0062ff;">วันที่ ${status.statusMessage}</span>`,
        confirmButtonColor: '#2563eb',
        customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
      });
      startButton.disabled = false;
      startButton.style.display = "inline-block";
    } else {
      getQuestionsJSONP(); // ดึงคำถามแบบ JSONP
    }
  };

  const url = `${SCRIPT_URL}?action=checkTestStatus&idCard=${idCard}`;
  jsonpRequest(url, callbackCheck);
}

function getQuestionsJSONP() {
  Swal.fire({
    title: 'กำลังเข้าสู่แบบทดสอบ',
    html: 'กรุณารอสักครู่...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px, 90%, 420px)',
    confirmButtonColor: '#2563eb',
    customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
  });

  const callbackQ = `jsonpQuestions_${Date.now()}`;
  window[callbackQ] = function (qList) {
    delete window[callbackQ];
    questions = qList;

    document.getElementById("quizForm").style.display = "block";
    document.getElementById("infoForm").style.display = "none";
    renderQuestions();
    Swal.close();
  };

  const url = `${SCRIPT_URL}?action=getQuestions`;
  jsonpRequest(url, callbackQ);
}

function renderQuestions() {
  const container = document.getElementById("questions");
  container.innerHTML = "";

  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question-container";
    div.innerHTML = `
      <div class="question-header">
        <h2 class="question-number">ข้อที่ ${i + 1}</h2>
        <p class="question-text">${q.question}</p>
      </div>
      <div class="choices">
        ${q.choices.map((c, j) => `
          <label class="choice-label">
            <input type="radio" name="q${i}" value="${j}">
            <span class="choice-text">${c}</span>
          </label>
        `).join("")}
      </div>`;
    container.appendChild(div);
  });
}

document.getElementById("quizForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.style.display = "none";

  const answers = questions.map((q, i) => {
    const selected = document.querySelector(`input[name='q${i}']:checked`);
    return selected ? parseInt(selected.value) : -1;
  });

  const unanswered = answers.indexOf(-1);
  if (unanswered !== -1) {
    Swal.fire({
      icon: 'warning',
      title: 'ยังตอบไม่ครบทุกข้อ',
      text: `กรุณาตอบคำถามให้ครบก่อนส่งคำตอบ (เช่น ข้อที่ ${unanswered + 1})`,
      width: 'clamp(300px, 90%, 420px)',
      confirmButtonColor: '#2563eb',
      customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
    });
    submitBtn.disabled = false;
    submitBtn.style.display = "inline-block";
    return;
  }

  const payload = {
    name: document.getElementById("name").value.trim(),
    idCard: document.getElementById("idCard").value.replace(/\D/g, ""),
    company: document.getElementById("company").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    answers
  };

  Swal.fire({
    title: 'กำลังประมวลผลคำตอบของคุณ',
    text: 'กรุณารอสักครู่...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    width: 'clamp(300px, 90%, 420px)',
    customClass: { title: 'swal2-title-custom', popup: 'swal2-border' }
  });

  // ❗️ submitAnswers ยังใช้ fetch เพราะ JSONP ไม่รองรับ POST
  // ถ้าจะหลีกเลี่ยง fetch ต้อง submit ผ่าน form HTML ซ่อนแทน (ยังไม่แนะนำ)
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "submitAnswers", ...payload }),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(result => {
      Swal.close();
      document.getElementById("quizForm").style.display = "none";
      document.getElementById("result").innerHTML = `
        <h4 class="test-complete-message">คุณ ${payload.name} ได้ทำแบบทดสอบเรียบร้อยแล้ว</h4>
        <button onclick="goTo('viewForm')" class="btn btn-info">📄 แบบฟอร์มขออนุญาตเข้าพื้นที่</button>`;
    })
    .catch(err => {
      Swal.close();
      Swal.fire({ icon: 'error', title: '❌ เกิดข้อผิดพลาด', text: err.message });
      submitBtn.disabled = false;
      submitBtn.style.display = "inline-block";
    });
});

document.getElementById("idCard").addEventListener("input", function () {
  const v = this.value.replace(/\D/g, "").slice(0, 13);
  const parts = [v.slice(0, 1), v.slice(1, 5), v.slice(5, 10), v.slice(10, 12), v.slice(12, 13)];
  this.value = parts.filter(Boolean).join("-");
});

function goTo(action) {
  window.open(`${SCRIPT_URL}?action=${action}`, "_blank");
}
