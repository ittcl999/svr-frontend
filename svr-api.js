const GAS_URL = "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec";

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
  return res.json();
}