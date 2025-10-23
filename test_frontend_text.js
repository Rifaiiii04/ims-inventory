// Test frontend text input functionality
console.log("Testing frontend text input...");

// Simulate text input
const testText = `
TOKO ANGKRINGAN
================================
Nasi Goreng       1 x 15000
Es Teh           2 x 5000
Kerupuk          1 x 3000
================================
Total: Rp 28000
`;

// Test API call
fetch("/api/ocr/process-text", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
    },
    body: JSON.stringify({ text: testText }),
})
    .then((response) => response.json())
    .then((data) => {
        console.log("Frontend test result:", data);
        if (data.success) {
            console.log("✅ Text processing successful!");
            console.log("Items found:", data.data.items.length);
        } else {
            console.log("❌ Text processing failed:", data.message);
        }
    })
    .catch((error) => {
        console.error("❌ Frontend test error:", error);
    });
