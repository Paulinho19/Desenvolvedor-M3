import { Product } from "./Product";

const serverUrl = "http://localhost:5000/products";
const itemsPerPage = 9;
let currentPage = 1;
let allProducts: Product[] = [];

function getImageNumber(index: number): number {
  const baseImageNumber = 2;
  const totalImageCount = 10 - baseImageNumber + 1;

  // Se o índice for menor que o número total de imagens disponíveis (2 a 10), use a lógica existente.
  if (index < totalImageCount) {
    return baseImageNumber + index;
  } else {
    // Caso contrário, retorne sempre o número da última imagem disponível (10).
    return 10;
  }
}

function renderProduct(product: Product, index: number): HTMLDivElement {
  const productElement = document.createElement("div");

  const imageSrc = `.${product.image}`; // Use o caminho relativo baseado no parâmetro 'image' do JSON

  // Formatar o preço como moeda brasileira com duas casas decimais
 const formattedPriceString = new Intl.NumberFormat('pt-BR', {
   style: 'currency',
   currency: 'BRL',
   minimumFractionDigits: 2, // Definir o número mínimo de casas decimais
   maximumFractionDigits: 2, // Definir o número máximo de casas decimais
 }).format(Number(product.price)); // Converte para número antes da formatação


  productElement.innerHTML = `
  <img class="imagem-modelo" src="${imageSrc}" alt="modelo" />
  <div class="info-produto">
  <h3>${product.name}</h3>
  <p class="preco">${formattedPriceString}</p>
  <p>até ${product.parcelamento.join('x de R$')}</p>
  <button class="botao-compra">Comprar</button>
  </div>
  `;
  return productElement;
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
