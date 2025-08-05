import { NextResponse } from 'next/server';
import { dbConnect }    from '../../../lib/dbConnect';
import Item             from '../../../models/Item';

export async function GET() {
  await dbConnect();
  const items = await Item.find({});
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  await dbConnect();
  const body = await request.json();
  try {
    const newItem = await Item.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
