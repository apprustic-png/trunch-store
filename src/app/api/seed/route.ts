import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { SEED_PRODUCTS } from '@/data/seed-products';

export async function POST() {
  try {
    if (!adminDb) {
      return NextResponse.json({ message: 'Firebase Admin not configured, skipped DB seeding' }, { status: 200 });
    }

    const batch = adminDb.batch();
    const productsRef = adminDb.collection('products');

    for (const prod of SEED_PRODUCTS) {
      // Use lynkProductUuid as deterministic ID or auto-id
      const docRef = productsRef.doc(prod.lynkProductUuid);
      batch.set(docRef, {
        ...prod,
        id: prod.lynkProductUuid,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    await batch.commit();
    return NextResponse.json({ message: 'Database seeded successfully with 9 products!' }, { status: 200 });
  } catch (error: any) {
    console.error('Seed API error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
