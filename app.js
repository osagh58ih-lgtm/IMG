let checkout = document.getElementById('checkout');
let productInput = document.getElementById('productInput');
let priceInput = document.getElementById('priceInput');

document.querySelectorAll('.order').forEach(btn=>{
  btn.onclick = ()=>{
    productInput.value = btn.dataset.product;
    priceInput.value = btn.dataset.price;
    checkout.classList.remove('hidden');
  }
});

document.getElementById('closeCheckout').onclick = ()=> checkout.classList.add('hidden');

document.getElementById('submitOrder').onclick = ()=>{
  let name = document.getElementById('customerName').value;
  let done = document.getElementById('done');
  done.textContent = 'تم استلام طلبك يا ' + name + ' ✔️';
  done.classList.remove('hidden');
};
