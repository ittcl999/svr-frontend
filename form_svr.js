// form_svr.js (Full logic แยกจาก HTML)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym5zxW382G2enqHVpsEkltXSCeaWEXdWmUqpz11Wxfi2pxp8Pg2SP9RmCbfDLtPU6T/exec';

// 🔁 POST to GAS
async function postToGAS(payload) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });
  return res.json();
}

// 🔍 Fetch worker by CID
async function fetchWorkerByCID(cid) {
  const res = await fetch(`${SCRIPT_URL}?action=checkWorkerFromCID&cid=${cid}`);
  return res.json();
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

function clearSignature() {
  const canvas = document.getElementById('signature-pad');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
  const canvas = document.getElementById('signature-pad');
  canvas.width = canvas.clientWidth;
  canvas.height = 150;
}

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

let currentTab = 0;
document.addEventListener("DOMContentLoaded", () => {
  showTab(currentTab);
  resizeCanvas();
});
