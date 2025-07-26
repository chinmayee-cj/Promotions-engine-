# Promotions-engine-

A lightweight and customizable **Promotions Engine** built with JavaScript to help businesses manage and apply promotional offers in their products or digital storefronts.

## 🚀 Features

- **Flexible Promotion Rules:** Easily define and manage discount, coupon, and promotional logic
- **Modular Design:** Add or modify promotional strategies without affecting the core engine
- **Easy Integration:** Seamlessly fits into existing JavaScript-based applications or services
- **Extensible:** Built with scalability and customization in mind
- **Strategy Pattern:** Uses design patterns for clean, maintainable code
- **Multiple Promotion Types:** Support for percentage discounts, fixed amounts, buy-N-get-M offers

## 📋 Prerequisites

- Node.js (v12.x or higher)
- npm (Node package manager)

## ⚡ Installation

git clone https://github.com/chinmayee-cj/Promotions-engine-.git
cd Promotions-engine-
npm install

text

## 🔧 Usage Example

const PromotionsEngine = require('./Promotions-engine-Scopely');

// Initialize Promotions Engine
const config = {
// Define your configuration details here
currency: 'USD',
defaultLocale: 'en-US'
};

const engine = new PromotionsEngine(config);

// Adid: 'SUMMER20',
type: 'percentage',
value: 20,
conditions: {
minimumPurchase: 100,
validUntil: '2024-08-31'
}
});

engine.addPromotion({
id: 'BUY2GET1',
type: 'quantity',
value: 'buy_2_get_1_free',
conditions: {
applicableItems: ['SKU001', 'SKU002']
}
});

// Example cart object
const cart = {
items: [
{ id: 'SKU001', price: 120, quantity: 2 },
{ id: 'SKU002', price: 80, quantity: 1 }
],
subtotal: 320
};

// Apply promotions to cart
const result = engine.applyPromotions(cart);
console.log(result);
// Output: { finalPrice: 256, appliedPromotions: ['SUMMER20'], savings: 64 }



## 📁 Project Structure

Promotions-engine-/
├── Promotions-engine-Scopely/ # Main engine source code
│ ├── index.js # Main entry point
│ ├── strategies/ # Promotion strategy implementations
│ ├── utils/ # Utility functions
│ └── models/ # Data models
├── tests/ # Unit tests
├── examples/ # Usage examples
├── package.json # Project metadata & dependencies
└── README.md # Project documentation



## 🎯 Supported Promotion Types

- **Percentage Discounts** - Apply percentage-based discounts
- **Fixed Amount Discounts** - Apply fixed dollar amount discounts
- **Buy N Get M** - Buy N items, get M items free or discounted
- **Minimum Purchase** - Discounts based on minimum cart value
- **Category-based** - Promotions for specific product categories
- **Time-sensitive** - Promotions with start/end dates

## 🧪 Running Tests

npm test



## 📖 API Documentation

### PromotionsEngine Constructor

const engine = new PromotionsEngine(config);



### Methods

#### `addPromotion(promotion)`
Adds a new promotion to the engine.

#### `removePromotion(promotionId)`
Removes a promotion by ID.

#### `applyPromotions(cart)`
Applies all applicable promotions to a cart and returns the result.

#### `getActivePromotions()`
Returns all currently active promotions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

If you encounter any issues or have suggestions, please [create an issue](https://github.com/chinmayee-cj/Promotions-engine-/issues).

## ⭐ Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

**Made with ❤️ by [chinmayee-cj](https://github.com/chinmayee-cj)**
