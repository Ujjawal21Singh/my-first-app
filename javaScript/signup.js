document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;

    try {
        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById("signupMessage").style.color = "green";
            document.getElementById("signupMessage").innerText = "Signup successful! Redirecting...";
            setTimeout(() => { window.location.href = "login.html"; }, 1000);
        } else {
            document.getElementById("signupMessage").innerText = "Signup failed! Username may be taken.";
        }
    } catch (error) {
        document.getElementById("signupMessage").innerText = "Error signing up!";
    }
});
