# M-Pesa Integration Setup Guide

This guide will help you set up M-Pesa payment integration for your StyleCo e-commerce website.

## Overview

The M-Pesa integration includes:

- **STK Push** - Sends payment prompts directly to customer's phone
- **Payment Callbacks** - Handles payment confirmation/failure
- **Transaction Status** - Query payment status
- **Full E-commerce Flow** - Cart → Checkout → Payment → Confirmation

## Prerequisites

1. **Safaricom Developer Account**

   - Sign up at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Create a new app
   - Subscribe to M-Pesa APIs

2. **Business Registration** (for production)
   - Registered business with Safaricom
   - M-Pesa Paybill or Till Number

## Setup Steps

### 1. Get M-Pesa Credentials

#### Sandbox (Development)

1. Login to Safaricom Developer Portal
2. Go to your app → APIs → M-Pesa
3. Get your credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - Use sandbox shortcode: `174379`
   - Use sandbox passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`

#### Production

1. Contact Safaricom to activate your business
2. Get your production credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Shortcode** (your Paybill/Till number)
   - **Passkey** (provided by Safaricom)

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Update the M-Pesa configuration:

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### 3. Test M-Pesa Integration

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Test M-Pesa configuration:**

   ```bash
   curl http://localhost:8080/api/mpesa/test
   ```

3. **Test the full flow:**
   - Add items to cart
   - Go to checkout
   - Fill in customer details
   - Select M-Pesa payment
   - Use test phone number: `254708374149`

### 4. Callback URL Setup

For production, you need a public callback URL:

1. **Deploy your app** (Firebase Hosting, Netlify, etc.)
2. **Update callback URL** in your environment:
   ```env
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   ```
3. **Whitelist your callback URL** in Safaricom Developer Portal

## API Endpoints

### STK Push

```
POST /api/mpesa/stkpush
```

Request body:

```json
{
  "amount": 100,
  "phone": "254708374149",
  "description": "StyleCo Order - 2 items",
  "orderData": {
    "items": [...],
    "customerInfo": {...},
    "total": 100
  }
}
```

### Payment Callback

```
POST /api/mpesa/callback
```

Automatically called by Safaricom when payment is processed.

### Query Transaction Status

```
GET /api/mpesa/query/:checkoutRequestId
```

### Test Configuration

```
GET /api/mpesa/test
```

## Testing

### Sandbox Test Numbers

- **Phone Number:** `254708374149` (always successful)
- **Phone Number:** `254708374148` (always fails)

### Test Flow

1. Add products to cart
2. Proceed to checkout
3. Fill in customer details with test phone number
4. Select M-Pesa payment
5. Submit payment
6. Check your phone for M-Pesa prompt
7. Enter PIN to complete payment

## Security Considerations

### Production Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Validate all incoming data
- [ ] Store credentials securely
- [ ] Implement rate limiting
- [ ] Log all transactions
- [ ] Set up monitoring and alerts
- [ ] Test callback URL accessibility
- [ ] Implement order management system

### Environment Variables Security

- Never commit `.env` files to version control
- Use secure environment variable storage in production
- Rotate credentials regularly
- Monitor for unauthorized API usage

## Troubleshooting

### Common Issues

1. **"Invalid Access Token"**

   - Check consumer key/secret
   - Ensure environment is correct (sandbox/production)

2. **"Invalid Phone Number"**

   - Phone must be in format: `254XXXXXXXXX`
   - Must be a valid Safaricom number

3. **"Callback URL not reachable"**

   - Ensure URL is publicly accessible
   - Check firewall settings
   - Test URL manually

4. **"Transaction Failed"**
   - Check account balance (sandbox)
   - Verify business shortcode
   - Check passkey format

### Debug Mode

Enable debug logging in development:

```env
NODE_ENV=development
```

### M-Pesa Simulator

Use Safaricom's M-Pesa simulator for testing:

1. Login to Developer Portal
2. Go to APIs → M-Pesa → Simulator
3. Test different scenarios

## Production Deployment

1. **Update environment to production:**

   ```env
   MPESA_ENVIRONMENT=production
   MPESA_BUSINESS_SHORTCODE=your-production-shortcode
   MPESA_PASSKEY=your-production-passkey
   ```

2. **Deploy your application**

3. **Test with real phone numbers**

4. **Monitor transactions** in Safaricom Business Portal

## Support

- **Safaricom Developer Support:** developer.safaricom.co.ke
- **M-Pesa Business Support:** +254 722 000 000
- **Documentation:** developer.safaricom.co.ke/docs

## Cost Structure

### Transaction Fees

- M-Pesa charges transaction fees based on amount
- Fees are deducted from merchant account
- Check current rates on Safaricom Business Portal

### API Costs

- Sandbox: Free
- Production: Pay-per-transaction model
- Check pricing on developer portal

## Next Steps

1. **Order Management** - Implement order tracking system
2. **Email Notifications** - Send order confirmations
3. **Inventory Management** - Update stock levels
4. **Reporting** - Generate sales reports
5. **Customer Portal** - Order history and tracking
