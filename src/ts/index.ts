import { Product } from "./Product";

const serverUrl = "http://localhost:5000/products";
const itemsPerPage = 9;
let currentPage = 1;
let allProducts: Product[] = [];
let count = 2

function renderProduct(product: Product): HTMLDivElement {
  const productElement = document.createElement("div");
  productElement.innerHTML = `
  <img src="../img/img_${count++}.png" alt="modelos" />
    <h3>${product.name}</h3>
    <p>Preço: $${product.price.toFixed(2)}</p>
    <p>Parcelamento: ${product.parcelamento.join('x de $')}</p>
  `;
  return productElement;
}

function renderProducts(products: Product[], startIndex: number, endIndex: number): void {
  const productContainer = document.getElementById("productContainer");

  if (!productContainer) {
    console.error("Element with id 'productContainer' not found.");
    return;
  }

  // Limpar o conteúdo existente no container
  productContainer.innerHTML = "";

  for (let i = startIndex; i < endIndex && i < products.length; i++) {
    const productElement = renderProduct(products[i]);
    productContainer.appendChild(productElement);
  }
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(serverUrl);
  if (!response.ok) {
    throw new Error(`Erro ao obter produtos: ${response.statusText}`);
  }

  const data: any[] = await response.json(); // Usando any[] temporariamente
  return data.map(productData => ({
    id: productData.id,
    name: productData.name,
    price: productData.price,
    parcelamento: productData.parcelamento,
    color: "", // Adicionando valores padrão para as propriedades ausentes
    image: "",
    size: [],
    date: ""
  }));
}

function renderNextPage(products: Product[]): void {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const newProducts = products.slice(startIndex, endIndex);
  allProducts = [...allProducts, ...newProducts]; // Concatenar os novos produtos aos produtos existentes
  renderProducts(allProducts, 0, endIndex);
  currentPage++;
}

async function main(): Promise<void> {
  try {
    const productsData = await fetchProducts();
    renderNextPage(productsData);

    const loadMoreButton = document.getElementById("loadMoreButton");
    if (loadMoreButton) {
      loadMoreButton.addEventListener("click", () => renderNextPage(productsData));
    }
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", main);
