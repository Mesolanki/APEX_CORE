const crypto = require('crypto');

/**
 * Demo payment gateway: validates payload and returns an order id.
 * Wire Stripe/PayPal here in production (use secret keys server-side only).
 */
const createCharge = async (req, res) => {
    try {
        const { items, email } = req.body || {};
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let subtotalCents = 0;
        for (const row of items) {
            const qty = Math.max(1, parseInt(row.qty, 10) || 1);
            const price = Number(row.priceUsd);
            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({ message: 'Invalid item price' });
            }
            subtotalCents += Math.round(price * 100) * qty;
        }

        const orderId = `NX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        if (subtotalCents <= 0) {
            return res.status(201).json({
                ok: true,
                orderId: `${orderId}-FREE`,
                totalUsd: '0.00',
                email: email || null,
                message: 'Order confirmed — no charge (free item or demo).',
            });
        }
        const totalUsd = (subtotalCents / 100).toFixed(2);

        res.status(201).json({
            ok: true,
            orderId,
            totalUsd,
            email: email || null,
            message: 'Payment authorized (demo). No card was charged.',
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Payment service error' });
    }
};

module.exports = { createCharge };
