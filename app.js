// ฟังก์ชันแสดงสถานะบนหน้าเว็บ
function showStatus(message, isSuccess = true) {
  const statusDiv = document.getElementById('statusMessage');
  if (!statusDiv) return;
  
  statusDiv.style.display = 'block';
  statusDiv.innerText = message;
  statusDiv.style.backgroundColor = isSuccess ? '#e8f5e9' : '#ffebee';
  statusDiv.style.color = isSuccess ? '#2e7d32' : '#c62828';
  statusDiv.style.padding = '10px';
  statusDiv.style.borderRadius = '5px';
  statusDiv.style.marginTop = '10px';
}

// 1. ส่งข้อมูลข้อความไปยัง n8n Webhook
async function sendText() {
  const webhookUrlInput = document.getElementById('webhookUrl');
  const textInput = document.getElementById('textInput');
  const btn = document.getElementById('btnSendText');

  const webhookUrl = webhookUrlInput ? webhookUrlInput.value.trim() : '';
  const messageText = textInput ? textInput.value.trim() : '';

  if (!webhookUrl) return alert('กรุณาใส่ n8n Webhook URL ก่อนครับ');
  if (!messageText) return alert('กรุณากรอกข้อความก่อนส่งครับ');

  btn.disabled = true;
  showStatus('⏳ กำลังส่งข้อมูลไปยัง n8n...', true);

  // ใช้ URLSearchParams เพื่อส่งแบบ Form Data ป้องกัน Error 405
  const payload = new URLSearchParams();
  payload.append('message', messageText);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString()
    });

    if (response.ok) {
      showStatus('✅ ส่งข้อความสำเร็จ! n8n รับข้อมูลเรียบร้อยแล้ว', true);
      textInput.value = '';
    } else {
      showStatus(`❌ เกิดข้อผิดพลาดจาก Server (Code: ${response.status})`, false);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showStatus('❌ ไม่สามารถเชื่อมต่อกับ n8n ได้ (เช็ก URL หรือ CORS)', false);
  } finally {
    btn.disabled = false;
  }
}

// 2. ส่งข้อมูลแบบไฟล์ (ถ้ามีปุ่มอัปโหลดไฟล์ในหน้าเว็บ)
async function sendFile() {
  const webhookUrlInput = document.getElementById('webhookUrl');
  const fileInput = document.getElementById('fileInput');
  const btn = document.getElementById('btnSendFile');

  const webhookUrl = webhookUrlInput ? webhookUrlInput.value.trim() : '';
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;

  if (!webhookUrl) return alert('กรุณาใส่ n8n Webhook URL ก่อนครับ');
  if (!file) return alert('กรุณาเลือกไฟล์ก่อนส่งครับ');

  btn.disabled = true;
  showStatus('⏳ กำลังอัปโหลดไฟล์ไปยัง n8n...', true);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData // ไม่ต้องใส่ Header Content-Type เบราว์เซอร์จะจัดการ Boundary ให้เอง
    });

    if (response.ok) {
      showStatus('✅ ส่งไฟล์สำเร็จ! n8n รับข้อมูลเรียบร้อยแล้ว', true);
      fileInput.value = '';
    } else {
      showStatus(`❌ เกิดข้อผิดพลาดจาก Server (Code: ${response.status})`, false);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showStatus('❌ ไม่สามารถเชื่อมต่อกับ n8n ได้', false);
  } finally {
    btn.disabled = false;
  }
}

// ผูก Event Listener เมื่อโหลด DOM เสร็จสมบูรณ์
document.addEventListener('DOMContentLoaded', () => {
  const btnSendText = document.getElementById('btnSendText');
  const btnSendFile = document.getElementById('btnSendFile');

  if (btnSendText) btnSendText.addEventListener('click', sendText);
  if (btnSendFile) btnSendFile.addEventListener('click', sendFile);
});
