let selectedFile = null;

// สลับแท็บ ข้อความ / รูปภาพ
function switchTab(type) {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.input-section');
  
  tabs.forEach(btn => btn.classList.remove('active'));
  sections.forEach(sec => sec.classList.remove('active'));

  if (type === 'text') {
    tabs[0].classList.add('active');
    document.getElementById('textSection').classList.add('active');
  } else {
    tabs[1].classList.add('active');
    document.getElementById('imageSection').classList.add('active');
  }
}

// เลือกไฟล์รูปภาพ
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file;
    document.getElementById('fileLabel').textContent = `📷 เลือกไฟล์แล้ว: ${file.name}`;
  }
}

// ฟังก์ชันแสดงสถานะการทำงาน
function showStatus(message, isSuccess) {
  const statusBox = document.getElementById('statusMessage');
  statusBox.textContent = message;
  statusBox.className = `status-box ${isSuccess ? 'success' : 'error'}`;
}

// 1. ส่งข้อมูลข้อความไป n8n
async function sendText() {
  const webhookUrl = document.getElementById('webhookUrl').value.trim();
  const textInput = document.getElementById('textInput').value.trim();

  if (!webhookUrl) return alert('กรุณาใส่ Webhook URL ของ n8n ก่อนครับ');
  if (!textInput) return alert('กรุณากรอกข้อความก่อนส่งครับ');

  const btn = document.getElementById('btnSendText');
  btn.disabled = true;
  showStatus('⏳ กำลังส่งข้อมูลไปยัง n8n (อาจใช้เวลา 30 วิหาก Cold Start)...', true);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: textInput })
    });

    if (response.ok) {
      showStatus('✅ ส่งข้อความสำเร็จ! n8n กำลังประมวลผล', true);
      document.getElementById('textInput').value = '';
    } else {
      showStatus(`❌ เกิดข้อผิดพลาดจาก Server (Code: ${response.status})`, false);
    }
  } catch (err) {
    showStatus('❌ ไม่สามารถเชื่อมต่อ n8n ได้ (ตรวจสอบ URL หรือ CORS)', false);
  } finally {
    btn.disabled = false;
  }
}

// 2. ส่งข้อมูลรูปภาพไป n8n
async function sendImage() {
  const webhookUrl = document.getElementById('webhookUrl').value.trim();

  if (!webhookUrl) return alert('กรุณาใส่ Webhook URL ของ n8n ก่อนครับ');
  if (!selectedFile) return alert('กรุณาเลือกรูปภาพก่อนครับ');

  const btn = document.getElementById('btnSendImage');
  btn.disabled = true;
  showStatus('⏳ กำลังอัปโหลดรูปภาพไปยัง n8n...', true);

  const formData = new FormData();
  formData.append('data', selectedFile); // ส่งไฟล์ในคีย์ชื่อ 'data'

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData // ยิงเป็น multipart/form-data
    });

    if (response.ok) {
      showStatus('✅ ส่งรูปภาพสำเร็จ! n8n กำลังอ่านข้อมูลภาพ', true);
      selectedFile = null;
      document.getElementById('fileLabel').textContent = '📁 คลิกที่นี่เพื่อเลือกรูปภาพ หรือลากไฟล์มาวาง';
    } else {
      showStatus(`❌ เกิดข้อผิดพลาดจาก Server (Code: ${response.status})`, false);
    }
  } catch (err) {
    showStatus('❌ ไม่สามารถเชื่อมต่อ n8n ได้ (ตรวจสอบ URL หรือ CORS)', false);
  } finally {
    btn.disabled = false;
  }
}
