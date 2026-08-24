import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { SEED_PRODUCTS } from '@/data/seed-products';

// Helper function to safely get Firestore instance or fallback
async function getOrInitDb() {
  return adminDb;
}

export async function POST(req: NextRequest) {
  try {
    const rawBodyText = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBodyText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { event, data } = body || {};

    if (event !== 'payment.received' || data?.message_action !== 'SUCCESS' || String(data?.message_code) !== '0') {
      return NextResponse.json({ message: 'Event ignored: not a successful payment' }, { status: 200 });
    }

    const messageData = data?.message_data;
    if (!messageData) {
      return NextResponse.json({ error: 'Missing message_data' }, { status: 400 });
    }

    const grandTotal = messageData.totals?.grandTotal ?? 0;
    const refId = messageData.refId || '';
    const messageId = body.message_id || '';
    const merchantKey = process.env.LYNK_MERCHANT_KEY || '';

    // Signature verification: sha256(String(grandTotal) + refId + message_id + LYNK_MERCHANT_KEY)
    const signatureString = `${String(grandTotal)}${refId}${messageId}${merchantKey}`;
    const expectedSignature = crypto.createHash('sha256').update(signatureString).digest('hex').toLowerCase();

    const incomingSignature = (req.headers.get('x-lynk-signature') || '').toLowerCase();

    // Log for debugging
    console.log(`[Lynk Webhook] refId: ${refId}, signatureString: "${signatureString}", expected: ${expectedSignature}, incoming: ${incomingSignature}`);

    if (merchantKey && incomingSignature) {
      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(incomingSignature.padStart(expectedSignature.length, '0'), 'utf8')
      );

      if (!isSignatureValid) {
        console.error(`[Lynk Webhook] Signature mismatch! Expected ${expectedSignature}, got ${incomingSignature}`);
        return NextResponse.json({ error: 'Unauthorized signature mismatch' }, { status: 401 });
      }
    }

    const customer = messageData.customer || {};
    const customerEmail = (customer.email || '').trim().toLowerCase();
    const item = messageData.items?.[0] || {};
    const itemUuid = item.uuid || '';
    const createdAt = messageData.createdAt || new Date().toISOString();

    if (!refId) {
      return NextResponse.json({ error: 'Missing refId' }, { status: 400 });
    }

    // Process DB operations if adminDb is available
    if (adminDb) {
      // 1. Idempotency Check
      const existingRefDoc = await adminDb.collection('payments').doc(refId).get();
      if (existingRefDoc.exists) {
        console.log(`[Lynk Webhook] RefId ${refId} already processed. Returning 200 OK.`);
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // Save raw payment record
      await adminDb.collection('payments').doc(refId).set({
        refId,
        messageId,
        grandTotal,
        customerEmail,
        itemUuid,
        rawPayload: body,
        createdAt: new Date().toISOString()
      });

      // 2. Find matching product by lynkProductUuid
      let targetProductUuid = itemUuid;

      // 3. Search for pending order by email & lynkProductUuid
      const pendingOrdersSnapshot = await adminDb.collection('orders')
        .where('status', '==', 'pending')
        .where('userEmail', '==', customerEmail)
        .where('lynkProductUuid', '==', targetProductUuid)
        .limit(1)
        .get();

      if (!pendingOrdersSnapshot.empty) {
        const orderDoc = pendingOrdersSnapshot.docs[0];
        const poDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await orderDoc.ref.update({
          status: 'order confirm',
          paymentRefId: refId,
          paymentAmount: messageData.totals?.totalPrice || item.price || 0,
          paymentTime: createdAt,
          poDeadline,
          updatedAt: new Date().toISOString()
        });

        console.log(`[Lynk Webhook] Order ${orderDoc.id} status updated to 'order confirm'`);
      } else {
        // Fallback: Save to unmatched_payments
        console.warn(`[Lynk Webhook] No matching pending order found for email: ${customerEmail}, itemUuid: ${itemUuid}`);
        await adminDb.collection('unmatched_payments').doc(refId).set({
          refId,
          email: customerEmail,
          lynkProductUuid: itemUuid,
          rawPayload: body,
          status: 'needs_review',
          createdAt: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ status: 'SUCCESS', refId }, { status: 200 });
  } catch (error: any) {
    console.error('[Lynk Webhook Error]', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
