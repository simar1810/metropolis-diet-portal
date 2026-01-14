export function retailPurchaseReducer(state, action) {
  switch (action.type) {
    case "ADD_PRODUCT_TO_STOCK":
      return {
        ...state,
        stocks: [
          ...state.stocks,
          {
            ...action.payload,
            quantity: 1
          }
        ],
      }

    case "REMOVE_PRODUCT_FROM_STOCK":
      return {
        ...state,
        stocks: state.stocks.filter(stock => stock.productId !== action.payload.productId)
      }

    case "SET_PRODUCT_QUANTITY":
      return {
        ...state,
        stocks: state.stocks.map(stock =>
          stock.productId === action.payload.productId
            ? { ...stock, quantity: action.payload.quantity, name: action.payload.name }
            : stock
        )
      }

    default:
      return state;
  }
}

export function addProductToStock(payload) {
  return {
    type: "ADD_PRODUCT_TO_STOCK",
    payload
  }
}

export function setProductQuantity(payload) {
  return {
    type: "SET_PRODUCT_QUANTITY",
    payload
  }
}

export function removeProductFromStock(payload) {
  return {
    type: "REMOVE_PRODUCT_FROM_STOCK",
    payload
  }
}