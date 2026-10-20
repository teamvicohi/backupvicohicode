```javascript
// ========================================
// VICOHI - LOGIN DROPDOWN SCRIPT
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const loginDropdown = document.getElementById("loginDropdown");
    const loginBtn = document.getElementById("loginBtn");

    // ----------------------------------------
    // Login Dropdown
    // ----------------------------------------
    if (loginBtn && loginDropdown) {

        loginBtn.addEventListener("click", function (e) {
            e.stopPropagation();

            loginDropdown.classList.toggle("active");
        });


        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {

            if (!loginDropdown.contains(e.target) &&
                !loginBtn.contains(e.target)) {

                loginDropdown.classList.remove("active");
            }

        });


        // Close dropdown on larger screens
        window.addEventListener("resize", function () {

            if (window.innerWidth > 768) {
                loginDropdown.classList.remove("active");
            }

        });

    }

});
```
