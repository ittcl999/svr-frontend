// api.js
const SCRIPT_URL = 'https://script.google.com/macros/s/XXX/exec';  // เปลี่ยนเป็น URL จริง

/**
 * เรียก GAS แบบ JSON (CORS)
 * @param {string} action 
 * @param {object} params 
 * @returns {Promise<any>}
 */
export async function callApi(action, params = {}) {
  const url = new URL(SCRIPT_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));

  // ปกติ
  try {
    const res = await fetch(url, { credentials: 'omit' });
    return await res.json();
  } catch (err) {
    // ถ้า CORS error ให้ fallback ไป JSONP
    return new Promise((resolve, reject) => {
      const cbName = `jsonp_cb_${Date.now()}`;
      window[cbName] = data => {
        resolve(data);
        delete window[cbName];
        script.remove();
      };
      const script = document.createElement('script');
      script.src = `${url.toString()}&callback=${cbName}`;
      document.body.appendChild(script);
    });
  }
}

/**
 * เรียก GAS แบบ POST (ส่ง JSON body)
 * @param {object} body 
 * @returns {Promise<any>}
 */
export async function postApi(body) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    // JSONP POST ไม่รองรับง่ายๆ ให้ใช้ GET แทนสำหรับงานสำคัญเท่านั้น
    console.error('POST API failed:', err);
    throw err;
  }
}
