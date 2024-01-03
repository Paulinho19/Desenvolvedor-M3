import { Product } from "./Product";

const serverUrl = "http://localhost:5000/products";
const itemsPerPage = 9;
let allProducts: Product[] = [];
let itemCount = 0;


function renderProduct(product: Product, index: number): HTMLDivElement {
  const productElement = document.createElement("div");

  const imageSrc = `.${product.image}`; 

  
 const formattedPriceString = new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL',
   minimumFractionDigits: 2, 
   maximumFractionDigits: 2, 
 }).format(Number(product.price)); 


  productElement.innerHTML = `
  <div class="container-models">
  <img class="imagem-modelo" src="${imageSrc}" alt="modelo" />
  <div class="info-produto">
  <h3>${product.name}</h3>
  <p class="preco">${formattedPriceString}</p>
  <p>até ${product.parcelamento.join('x de R$')}</p>
  <button class="botao-compra">Comprar</button>
  </div>
  </div>
  `;
  const buyButton = productElement.querySelector('.botao-compra');
  if (buyButton) {
    buyButton.addEventListener('click', () => {
      addToCart(product);
      updateCartCounter();
    });
  }
  
  return productElement;
}




function addToCart(product: Product): void {
  // Lógica para adicionar o produto ao carrinho (pode ser armazenado em um array, servidor, etc.)
  console.log(`Produto adicionado ao carrinho: ${product.name}`);
  itemCount++;
}

function updateCartCounter(): void {
  const contadorSacola = document.getElementById('contador-sacola');
  if (contadorSacola) {
    contadorSacola.textContent = itemCount.toString();
    contadorSacola.style.display = 'block'; // Exibe o contador
  }
}

function renderProducts(products: Product[], startIndex: number, endIndex: number): void {
  const productContainer = document.getElementById("productContainer");

  if (!productContainer) {
    console.error("Element with id 'productContainer' not found.");
    return;
  }

  for (let i = startIndex; i < endIndex && i < products.length; i++) {
    const productElement = renderProduct(products[i], i);
    productContainer.appendChild(productElement);
    allProducts.push(products[i]);
  }
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(serverUrl);
  if (!response.ok) {
    throw new Error(`Erro ao obter produtos: ${response.statusText}`);
  }

  const data: any[] = await response.json();
 
  return data.map(productData => ({
    id: productData.id,
    name: productData.name,
    price: parseFloat(productData.price),
    parcelamento: productData.parcelamento,
    color: productData.color || "", 
    image: productData.image || "", 
    size: productData.size || [],
    date: productData.date || ""
  }));
}

enum Ordenacao {
  MaisRecente = "mais-recente",
  MenorPreco = "menor-preco",
  MaiorPreco = "maior-preco",
}

let opcaoOrdenacao = Ordenacao.MaisRecente;

async function main(): Promise<void> {
  try {
    const productsData = await fetchProducts();
    renderProducts(productsData, 0, itemsPerPage);

    const loadMoreButton = document.getElementById("loadMoreButton");
    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", () => {
        if (allProducts.length < productsData.length) {
          const remainingProducts = productsData.slice(allProducts.length, allProducts.length + itemsPerPage);
          renderProducts(remainingProducts, 0, remainingProducts.length);

          
          if (allProducts.length >= productsData.length) {
            loadMoreButton.style.display = "none";
          }
        }
      });
    }

    
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", main);