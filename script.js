let clients = {};

function addProduct() {
    const clientName = document.getElementById('clientName').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const productValue = parseFloat(document.getElementById('productValue').value);
    const installments = parseInt(document.getElementById('installments').value) || 1;

    if (!clientName || !productName || isNaN(productValue) || productValue <= 0) {
        alert("Por favor, preencha todos os campos corretamente.");
        return;
    }

    // Verificar se o cliente já existe, caso contrário, criar um novo
    if (!clients[clientName]) {
        clients[clientName] = {
            products: [],
            totalValue: 0,
            installments: installments,
            paidAmount: 0, // Total já pago
            paymentDates: [], // Guardar as datas de vencimento das parcelas
            remainingValue: 0, // Valor restante
            paymentStatus: [] // Guardar o status de cada parcela (Pago/A Pagar)
        };
    }

    // Adicionar o novo produto à lista de produtos do cliente
    clients[clientName].products.push({ name: productName, value: productValue });
    clients[clientName].totalValue += productValue;

    // Gerar as datas de vencimento para cada parcela
    const currentDate = new Date();
    clients[clientName].paymentDates = [];
    clients[clientName].paymentStatus = [];
    for (let i = 1; i <= installments; i++) {
        let dueDate = new Date(currentDate);
        dueDate.setMonth(currentDate.getMonth() + i); // Vencimento das parcelas no próximo mês
        clients[clientName].paymentDates.push(dueDate);
        clients[clientName].paymentStatus.push('due'); // Inicialmente, todas as parcelas estão a pagar
    }

    // Atualizar o valor restante
    clients[clientName].remainingValue = clients[clientName].totalValue - clients[clientName].paidAmount;

    updatePaymentList();
    resetForm();
}

function updatePaymentList() {
    const paymentList = document.getElementById('payments');
    paymentList.innerHTML = ''; // Limpar a lista de pagamentos antes de atualizar

    // Iterar sobre todos os clientes e seus produtos
    for (let clientName in clients) {
        const client = clients[clientName];
        const clientItem = document.createElement('li');
        clientItem.classList.add('paymentItem');

        let productsHtml = '';
        client.products.forEach((product, index) => {
            productsHtml += `
                <div class="product">
                    <strong>${product.name}</strong>: R$ ${product.value.toFixed(2)}
                    <button onclick="editProduct('${clientName}', ${index})">Editar</button>
                </div>`;
        });

        // Calculando o valor de cada parcela
        const parcelValue = (client.totalValue / client.installments).toFixed(2);

        // Calculando o valor restante
        const remainingValue = client.remainingValue.toFixed(2);

        // Verificando se já foi pago
        const status = client.paidAmount === client.totalValue ? "Pago" : "A Pagar";
        const statusClass = client.paidAmount === client.totalValue ? "paid" : "due";

        // Criar HTML com datas de vencimento e status de pagamento
        let paymentsHtml = '';
        for (let i = 0; i < client.paymentDates.length; i++) {
            const dueDate = client.paymentDates[i].toLocaleDateString();
            const paymentStatus = client.paymentStatus[i];
            paymentsHtml += `
                <div class="payment">
                    <strong>Parcela ${i + 1}</strong>: 
                    <input type="date" value="${formatDateForInput(client.paymentDates[i])}" 
                           onchange="updateDueDate('${clientName}', ${i}, this.value)" />
                    <span class="${paymentStatus}">${paymentStatus === 'paid' ? 'Pago' : 'A Pagar'}</span>
                    <button onclick="togglePaymentStatus('${clientName}', ${i})">
                        Marcar como ${paymentStatus === 'paid' ? 'A Pagar' : 'Pago'}
                    </button>
                </div>`;
        }

        clientItem.innerHTML = `
            <div class="clientName">${clientName}</div>
            <div class="products">${productsHtml}</div>
            <div class="totalValue">Total: R$ ${client.totalValue.toFixed(2)}</div>
            <div class="installmentsStatus">
                <strong>Parcelas:</strong> ${client.installments} de R$ ${parcelValue}
            </div>
            <div class="paymentDates">
                ${paymentsHtml}
            </div>
            <div class="remainingValue">
                <strong>Valor restante a pagar: </strong> R$ ${remainingValue}
            </div>
            <div class="actions">
                <button onclick="markAsPaid('${clientName}')">Pagamento Feito</button>
                <button onclick="deleteClient('${clientName}')">Excluir Cliente</button>
            </div>
        `;
        paymentList.appendChild(clientItem);
    }
}

function markAsPaid(clientName) {
    const client = clients[clientName];
    const parcelValue = client.totalValue / client.installments;

    // Marcar a primeira parcela como paga
    if (client.paidAmount < client.totalValue) {
        client.paidAmount += parcelValue;
    }

    // Atualizar o valor restante a pagar
    client.remainingValue = client.totalValue - client.paidAmount;

    // Verificar se o pagamento foi totalmente feito
    if (client.paidAmount >= client.totalValue) {
        client.paymentStatus = client.paymentStatus.map(() => 'paid');
    }

    updatePaymentList();
}

function togglePaymentStatus(clientName, parcelIndex) {
    const client = clients[clientName];

    // Alternar entre "Pago" e "A Pagar"
    const newStatus = client.paymentStatus[parcelIndex] === 'paid' ? 'due' : 'paid';
    client.paymentStatus[parcelIndex] = newStatus;

    // Atualizar o valor restante com base no status
    updateRemainingValue(clientName);

    updatePaymentList();
}

function updateRemainingValue(clientName) {
    const client = clients[clientName];
    let paidAmount = 0;

    // Calcular o valor pago
    client.paymentStatus.forEach((status, index) => {
        if (status === 'paid') {
            paidAmount += client.totalValue / client.installments;
        }
    });

    // Atualizar o valor restante
    client.paidAmount = paidAmount;
    client.remainingValue = client.totalValue - paidAmount;
}

function updateDueDate(clientName, parcelIndex, newDate) {
    const client = clients[clientName];
    const newDueDate = new Date(newDate);
    client.paymentDates[parcelIndex] = newDueDate;
    updatePaymentList();
}

function deleteClient(clientName) {
    delete clients[clientName];
    updatePaymentList();
}

function editProduct(clientName, productIndex) {
    const product = clients[clientName].products[productIndex];
    const newProductName = prompt("Novo nome do produto", product.name);
    const newProductValue = prompt("Novo valor do produto", product.value.toFixed(2));

    if (newProductName && newProductValue) {
        clients[clientName].products[productIndex].name = newProductName;
        clients[clientName].products[productIndex].value = parseFloat(newProductValue);

        // Recalcular o total
        clients[clientName].totalValue = clients[clientName].products.reduce((sum, prod) => sum + prod.value, 0);

        // Atualizar o valor restante
        clients[clientName].remainingValue = clients[clientName].totalValue - clients[clientName].paidAmount;

        updatePaymentList();
    }
}

function resetForm() {
    document.getElementById('clientName').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productValue').value = '';
    document.getElementById('installments').value = '';
}

// Função para formatar a data para input de data (YYYY-MM-DD)
function formatDateForInput(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}
