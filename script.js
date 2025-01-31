let menu = []; // Initialize an empty menu array
let order = [];

// Fetch the menu from menu.json
async function fetchMenu() {
  try {
    const response = await fetch("menu.json");
    menu = await response.json();
    displayMenu(); // Display the menu after fetching
  } catch (error) {
    console.error("Error fetching menu: ", error);
  }
}

// Display the menu
function displayMenu() {
  const menuContainer = document.getElementById("menu");
  menuContainer.innerHTML = "";

  menu.forEach((item, index) => {
    const menuItem = document.createElement("div");
    menuItem.classList.add("menu-item");

    menuItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>₦${item.price.toFixed(2)}</p>
      <button onclick="addToOrder(${index})">Add to Order</button>
    `;

    menuContainer.appendChild(menuItem);
  });
}

// Add item to order
function addToOrder(index) {
  const item = menu[index];
  const existingItem = order.find((orderItem) => orderItem.name === item.name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    order.push({ ...item, quantity: 1 });
  }

  updateOrderSummary();
}

// Update the order summary
function updateOrderSummary() {
  const orderSummary = document.getElementById("order-summary");
  const totalAmount = document.getElementById("total-amount");

  if (order.length === 0) {
    orderSummary.innerHTML = "<p>No items selected yet.</p>";
    totalAmount.textContent = "0.00";
    return;
  }

  let summaryHTML = "";
  let total = 0;

  order.forEach((item) => {
    summaryHTML += `<p>${item.name} x ${item.quantity} - ₦${(item.price * item.quantity).toFixed(2)}</p>`;
    total += item.price * item.quantity;
  });

  orderSummary.innerHTML = summaryHTML;
  totalAmount.textContent = total.toFixed(2);
}

// Simulate checkout
function checkout() {
  if (order.length === 0) {
    alert("Your order is empty. Please add some items.");
    return;
  }

  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;

  if (!email || !address) {
    alert("Please enter your email and delivery address.");
    return;
  }

  const totalAmount = parseFloat(document.getElementById("total-amount").textContent);

  // Send the order data to the serverless function
  fetch("/.netlify/functions/sendOrder", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      address: address,
      items: order,
      total: totalAmount,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      alert(`Payment successful! Your order will be delivered to:\n${address}`);
      order = []; // Clear the order
      updateOrderSummary(); // Update the order summary
      document.getElementById("email").value = ""; // Clear the email field
      document.getElementById("address").value = ""; // Clear the address field
    })
    .catch((error) => {
      console.error("Error sending order email: ", error);
      alert("There was an error processing your order. Please contact support.");
    });
}

// Fetch the menu when the page loads
fetchMenu();