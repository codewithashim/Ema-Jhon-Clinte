import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addToDb,
  deleteShoppingCart,
  getStoredCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";

/**
 * count
 * perPage (size) :10
 * pages : count/perPage
 * (corrent page) : page
 */

const Shop = () => {
  //   const { products, count } = useLoaderData();
  const [cart, setCart] = useState([]);
  const [products, setProduct] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    fetch(`http://localhost:5000/products?page=${page}&perPage=${perPage}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.products);
        setCount(data.count);
      });
  }, [page, perPage]);

  const pages = Math.ceil(count / perPage);

  const clearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  useEffect(() => {
    const storedCart = getStoredCart();
    const savedCart = [];
    const ids = Object.keys(storedCart);

    fetch("http://localhost:5000/productsByIds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    })
      .then((res) => res.json())
      .then((data) => {
        for (const key in storedCart) {
          const addedProduct = data.products.find(
            (product) => product._id === key
          );
          if (addedProduct) {
            const quantity = storedCart[key];
            addedProduct.quantity = quantity;
            savedCart.push(addedProduct);
          }
        }
        setCart(savedCart);
      });
  }, [products]);

  const handleAddToCart = (selectedProduct) => {
    console.log(selectedProduct);
    let newCart = [];
    const exists = cart.find((product) => product._id === selectedProduct._id);
    if (!exists) {
      selectedProduct.quantity = 1;
      newCart = [...cart, selectedProduct];
    } else {
      const rest = cart.filter(
        (product) => product._id !== selectedProduct._id
      );
      exists.quantity = exists.quantity + 1;
      newCart = [...rest, exists];
    }

    setCart(newCart);
    addToDb(selectedProduct._id);
  };

  return (
    <div className="shop-container">
      <div className="products-container">
        {products.map((product) => (
          <Product
            key={product._id}
            product={product}
            handleAddToCart={handleAddToCart}
          ></Product>
        ))}
      </div>
      <div className="cart-container">
        <Cart clearCart={clearCart} cart={cart}>
          <Link to="/orders">
            <button>Review Order</button>
          </Link>
        </Cart>
      </div>
      <div className="pagination">
        {/* <p>curnetly selectd page {page}</p> */}
        {[...Array(pages).keys()].map((number) => {
          return (
            <button
              key={number}
              className={page === number && "selected"}
              onClick={() => setPage(number)}
            >
              {number + 1}
            </button>
          );
        })}
        <select onChange={(event) => setPerPage(event.target.value)}>
          <option value="5">5</option>
          <option value="10" selected>
            10
          </option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>
  );
};

export default Shop;
