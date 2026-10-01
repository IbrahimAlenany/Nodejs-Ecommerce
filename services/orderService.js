
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');

// @desc    Create cash order
// @route   POST /api/v1/orders/:cartId
// @access  Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({
    _id: req.params.cartId,
    user: req.user._id,
  });

  if (!cart) {
    return next(new ApiError('Cart not found', 404));
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return next(new ApiError('Cart is empty', 400));
  }

  const cartPrice =
    cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

  const totalOrderPrice = cartPrice;

  if (!Number.isFinite(totalOrderPrice) || totalOrderPrice <= 0) {
    return next(new ApiError('Invalid order price', 400));
  }

  // Check stock
  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product);

    if (!product || product.quantity < item.quantity) {
      return next(
        new ApiError(
          `Insufficient stock for product ${item.product}`,
          400
        )
      );
    }
  }

  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
    paymentMethodType: 'cash',
  });

  const bulkOption = cart.cartItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product,
        quantity: { $gte: item.quantity },
      },
      update: {
        $inc: {
          quantity: -item.quantity,
          sold: item.quantity,
        },
      },
    },
  }));

  const result = await Product.bulkWrite(bulkOption);

  if (result.matchedCount !== cart.cartItems.length) {
    await Order.findByIdAndDelete(order._id);

    return next(
      new ApiError('Insufficient stock for one or more products', 400)
    );
  }

  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    status: 'success',
    data: order,
  });
});

// Filter orders for logged-in user
exports.filterOrderForLoggedUser = asyncHandler(
  async (req, res, next) => {
    if (req.user.role === 'user') {
      req.filterObj = { user: req.user._id };
    }

    next();
  }
);

// @desc Get all orders
// @route GET /api/v1/orders
exports.findAllOrders = factory.getAll(Order);

// @desc Get specific order
// @route GET /api/v1/orders/:id
exports.findSpecificOrder = factory.getOne(Order);

// @desc Update order paid status
// @route PUT /api/v1/orders/:id/pay
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError('Order not found', 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

// @desc Update order delivered status
// @route PUT /api/v1/orders/:id/deliver
exports.updateOrderToDelivered = asyncHandler(
  async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: updatedOrder,
    });
  }
);

// @desc Create Stripe checkout session
// @route GET /api/v1/orders/checkout-session/:cartId
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({
    _id: req.params.cartId,
    user: req.user._id,
  });

  if (!cart) {
    return next(new ApiError('Cart not found', 404));
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    return next(new ApiError('Cart is empty', 400));
  }

  const cartPrice =
    cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

  const totalOrderPrice = cartPrice;

  if (!Number.isFinite(totalOrderPrice) || totalOrderPrice <= 0) {
    return next(new ApiError('Invalid order price', 400));
  }

  if (!req.body.shippingAddress) {
    return next(new ApiError('Shipping address is required', 400));
  }

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          product_data: {
            name: `Order for ${req.user.name}`,
          },
          unit_amount: Math.round(totalOrderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: cart._id.toString(),
    metadata: {
      shippingAddress: JSON.stringify(req.body.shippingAddress),
    },
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

// Create order after successful Stripe payment
const createCardOrder = async (session) => {
  if (session.payment_status !== 'paid') {
    return;
  }

  const cartId = session.client_reference_id;

  if (!cartId || !session.metadata?.shippingAddress) {
    throw new Error('Missing cart ID or shipping address');
  }

  // Prevent duplicate orders
  const existingOrder = await Order.findOne({
    stripeSessionId: session.id,
  });

  if (existingOrder) {
    return existingOrder;
  }

  let shippingAddress;

  try {
    shippingAddress = JSON.parse(
      session.metadata.shippingAddress
    );
  } catch {
    throw new Error('Invalid shipping address in Stripe metadata');
  }

  const cart = await Cart.findById(cartId);

  if (!cart) {
    throw new Error(`Cart not found: ${cartId}`);
  }

  const user = await User.findOne({
    email: session.customer_email,
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!cart.cartItems || cart.cartItems.length === 0) {
    throw new Error('Cart is empty');
  }

  // Check stock availability
  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product);

    if (!product || product.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product}`
      );
    }
  }

  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: session.amount_total / 100,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
    stripeSessionId: session.id,
  });

  const bulkOption = cart.cartItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product,
        quantity: { $gte: item.quantity },
      },
      update: {
        $inc: {
          quantity: -item.quantity,
          sold: item.quantity,
        },
      },
    },
  }));

  const result = await Product.bulkWrite(bulkOption);

  if (result.matchedCount !== cart.cartItems.length) {
    await Order.findByIdAndDelete(order._id);

    throw new Error('Insufficient stock for one or more products');
  }

  await Cart.findByIdAndDelete(cartId);

  return order;
};

// @desc Stripe webhook
// @route POST /webhook-checkout
exports.webhookCheckout = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await createCardOrder(event.data.object);
  }

  return res.status(200).json({
    received: true,
  });
});
